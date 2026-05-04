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
    // 📸 Smart Camera Discovery
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        // Filter for "back" cameras or external "usb" cameras
        const filtered = devices.filter(d => {
          const label = d.label.toLowerCase();
          return label.includes("back") || label.includes("environment") || label.includes("usb") || label.includes("external");
        });
        
        // Fallback to all devices if filter is too strict
        const finalDevices = filtered.length > 0 ? filtered : devices;
        setCameras(finalDevices);
        setSelectedCam(finalDevices[0].id);
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
      <Card className="p-0 overflow-hidden border-[color:var(--glass-border)]">
        <div className="bg-[color:var(--control-bg)] p-5 border-b border-[color:var(--glass-border)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[color:var(--text)] tracking-tight">Check-in Terminal</h2>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => { stop(); setMode("camera"); }}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all ${
                    mode === "camera" 
                      ? "bg-[color:var(--brand-soft-bg)] text-[color:var(--brand-ink)] border-[color:var(--brand-soft-border)] shadow-sm" 
                      : "bg-[color:var(--control-bg)] text-[color:var(--muted)] border-[color:var(--control-border)] hover:bg-[color:var(--control-bg-hover)]"
                  }`}
                >
                  Lens Mode
                </button>
                <button
                  onClick={() => { stop(); setMode("usb"); }}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all ${
                    mode === "usb" 
                      ? "bg-[color:var(--brand-soft-bg)] text-[color:var(--brand-ink)] border-[color:var(--brand-soft-border)] shadow-sm" 
                      : "bg-[color:var(--control-bg)] text-[color:var(--muted)] border-[color:var(--control-border)] hover:bg-[color:var(--control-bg-hover)]"
                  }`}
                >
                  Scanner Mode
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {mode === "camera" && (
                <div className="flex items-center gap-2 bg-[color:var(--control-bg)] p-1.5 rounded-2xl border border-[color:var(--control-border)] w-full sm:w-auto">
                  <select
                    value={selectedCam}
                    onChange={(e) => { setSelectedCam(e.target.value); if(running) { stop(); } }}
                    className="flex-1 sm:w-64 text-[12px] font-black bg-[color:var(--bg)] text-[color:var(--text)] px-4 py-2 outline-none cursor-pointer rounded-xl appearance-none"
                  >
                    {cameras.length === 0 ? (
                      <option className="text-[color:var(--muted)]">Searching for lenses...</option>
                    ) : (
                      cameras.map(cam => (
                        <option key={cam.id} value={cam.id} className="bg-[color:var(--bg)] text-[color:var(--text)]">
                          {cam.label || `Camera ${cam.id.slice(0, 5)}`}
                        </option>
                      ))
                    )}
                  </select>
                  {running ? (
                    <Button variant="danger" size="sm" onClick={stop} className="px-6 rounded-xl font-black uppercase text-[10px] tracking-widest">
                      Stop
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={start} className="px-6 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2">
                      <Camera className="h-3 w-3" /> Start
                    </Button>
                  )}
                </div>
              )}
              {mode === "usb" && (
                <div className="flex items-center gap-2 text-[10px] font-black text-[color:var(--brand-ink)] bg-[color:var(--brand-soft-bg)] px-4 py-2.5 rounded-2xl border border-[color:var(--brand-soft-border)] uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-[color:var(--brand-ink)] rounded-full animate-pulse shadow-[0_0_8px_rgba(29,78,216,0.4)]" />
                  Ready to Receive
                </div>
              )}
            </div>
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
