import { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import API from "../api/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { Camera, RefreshCcw, ShieldAlert } from "lucide-react";

export default function Scanner() {
  const [result, setResult] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [blockedInfo, setBlockedInfo] = useState(null);
  
  // 📸 Camera Selection State
  const [cameras, setCameras] = useState([]);
  const [selectedCam, setSelectedCam] = useState("");
  const [mode, setMode] = useState("camera"); // "camera" or "usb"

  const scannerRef = useRef(null);
  const regionId = useMemo(() => "qr-reader-region", []);
  const usbBuffer = useRef("");
  const usbTimeout = useRef(null);

  const parseMemberId = (text) => {
    if (!text) return "";
    try {
      const parsed = JSON.parse(text);
      return parsed?.memberId || text;
    } catch {
      return text;
    }
  };

  const isProcessingRef = useRef(false);

  const stop = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch {
      // ignore
    } finally {
      setRunning(false);
      setIsPaused(false);
      isProcessingRef.current = false;
    }
  };

  const playBeep = async () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // Sharper frequency
      
      // Smooth start and end to avoid clicking sounds
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 0.05); // High volume
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5); // Fade out at 0.5s

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 500); // 0.5 seconds duration
    } catch (e) {
      console.warn("Audio not supported or blocked:", e);
    }
  };

  const processScan = async (text) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsPaused(true);

    try {
      playBeep();
      
      // If using camera, pause it
      if (mode === "camera" && scannerRef.current && typeof scannerRef.current.pause === "function") {
        scannerRef.current.pause(true);
      }

      const memberId = parseMemberId(text);
      const res = await API.post("/attendance/checkin", { memberId });
      setResult(`${res.data?.status || "OK"} — ${res.data?.reason || "Checked in"}`);
    } catch (err) {
      if (err.response?.data?.status === "BLOCKED") {
        setBlockedInfo({ reason: err.response?.data?.reason || "Access denied" });
        setResult("");
      } else {
        setResult(`Error — ${err.response?.data?.message || err.response?.data?.reason || err.message}`);
      }
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
        setIsPaused(false);
        try {
          if (mode === "camera" && scannerRef.current && typeof scannerRef.current.resume === "function") {
            scannerRef.current.resume();
          }
          setResult("");
        } catch (e) {
          // Ignore
        }
      }, 2000);
    }
  };

  const start = async () => {
    try {
      setError("");
      setResult("");
      setIsPaused(false);
      isProcessingRef.current = false;

      if (!scannerRef.current) scannerRef.current = new Html5Qrcode(regionId);
      const config = { fps: 10, qrbox: { width: 260, height: 260 } };

      setRunning(true);
      
      const cameraConfig = selectedCam ? { deviceId: selectedCam } : { facingMode: "environment" };

      await scannerRef.current.start(
        cameraConfig,
        config,
        (decodedText) => processScan(decodedText),
        () => {},
      );
    } catch (e) {
      setRunning(false);
      setError(e?.message || "Failed to start camera");
    }
  };

  useEffect(() => {
    // 📸 Discover Cameras
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        setCameras(devices);
        setSelectedCam(devices[0].id);
      }
    }).catch(err => {
      console.warn("Camera discovery failed:", err);
    });

    return () => {
      stop();
    };
  }, []);

  // ⌨️ USB Scanner Listener
  useEffect(() => {
    if (mode !== "usb") return;

    const handleKeyDown = (e) => {
      // USB Scanners usually type very fast and end with "Enter"
      if (e.key === "Enter") {
        if (usbBuffer.current.length > 1) {
          processScan(usbBuffer.current);
        }
        usbBuffer.current = "";
      } else {
        // Only accept alphanumeric and some symbols from the scanner
        if (e.key.length === 1) {
          usbBuffer.current += e.key;
        }
        
        // Clear buffer if no key for 100ms (prevents manual typing conflicts)
        if (usbTimeout.current) clearTimeout(usbTimeout.current);
        usbTimeout.current = setTimeout(() => {
          usbBuffer.current = "";
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (usbTimeout.current) clearTimeout(usbTimeout.current);
    };
  }, [mode]);

  return (
    <div className="grid gap-4 md:gap-6">
      <Card className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-[color:var(--text)]">Check-in Terminal</div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => { stop(); setMode("camera"); }}
                className={`text-[11px] px-3 py-1 rounded-full border transition ${mode === "camera" ? "bg-brand-500 text-white border-brand-500" : "bg-[color:var(--control-bg)] text-[color:var(--muted)] border-[color:var(--control-border)]"}`}
              >
                Camera Mode
              </button>
              <button
                onClick={() => { stop(); setMode("usb"); }}
                className={`text-[11px] px-3 py-1 rounded-full border transition ${mode === "usb" ? "bg-brand-500 text-white border-brand-500" : "bg-[color:var(--control-bg)] text-[color:var(--muted)] border-[color:var(--control-border)]"}`}
              >
                USB Scanner Mode
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode === "camera" && (
              <>
                <select
                  value={selectedCam}
                  onChange={(e) => { setSelectedCam(e.target.value); if(running) { stop(); } }}
                  className="text-xs bg-[color:var(--control-bg)] border border-[color:var(--control-border)] rounded-xl px-3 py-2 outline-none focus:ring-2 ring-brand-500/20"
                >
                  {cameras.map(cam => (
                    <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id.slice(0, 5)}`}</option>
                  ))}
                </select>
                {running ? (
                  <Button variant="danger" onClick={stop}>Stop</Button>
                ) : (
                  <Button variant="primary" onClick={start} className="gap-2">
                    <Camera className="h-4 w-4" /> Start
                  </Button>
                )}
              </>
            )}
            {mode === "usb" && (
              <div className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-2 rounded-xl border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                READY FOR USB SCAN
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <div className="grid gap-3">
          {mode === "camera" ? (
            <div className="relative">
              <div
                id={regionId}
                className={`w-full overflow-hidden rounded-2xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] transition-opacity ${
                  isPaused ? "opacity-30" : "opacity-100"
                }`}
              />
              {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Badge variant="warning" className="text-sm px-3 py-1.5 shadow-sm">
                    Paused for next scan...
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[color:var(--control-border)] rounded-2xl bg-[color:var(--bg2)]">
              <div className="p-4 bg-brand-500/10 rounded-full mb-4">
                <RefreshCcw className="h-10 w-10 text-brand-500 animate-spin-slow" />
              </div>
              <div className="text-sm font-bold text-[color:var(--text)]">Waiting for USB Scanner...</div>
              <div className="text-xs text-[color:var(--muted)] mt-1">Please point your handheld scanner at the member's QR code.</div>
            </div>
          )}
          {error ? <div className="text-sm text-danger-500 font-semibold">{error}</div> : null}
          {result ? (
            <div className="flex items-center gap-2">
              <Badge variant={String(result).startsWith("Error") ? "danger" : "success"}>
                {String(result).startsWith("Error") ? "Error" : "Success"}
              </Badge>
              <div className="text-xs text-[color:var(--muted)]">{result}</div>
            </div>
          ) : (
            <div className="text-xs text-[color:var(--muted)]">
              Aim the camera at a member’s QR code to check them in.
            </div>
          )}
        </div>
      </Card>

      <Modal open={!!blockedInfo} onClose={() => setBlockedInfo(null)} title="Access Blocked">
        <div className="flex flex-col items-center p-4 text-center">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-[color:var(--text)] mb-2">Member Blocked</h3>
          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-6">{blockedInfo?.reason}</p>
          <Button variant="danger" onClick={() => setBlockedInfo(null)} className="w-full">Dismiss</Button>
        </div>
      </Modal>
    </div>
  );
}
