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
  const scannerRef = useRef(null);
  const regionId = useMemo(() => "qr-reader-region", []);

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

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); // 1000 Hz for a sharper beep
      gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime); // Loud volume (100%)

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 300); // Longer beep duration (300ms)
    } catch (e) {
      console.warn("Audio not supported or blocked:", e);
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
      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;
          setIsPaused(true);

          try {
            playBeep(); // Play sound immediately on successful read
            
            // Pause camera temporarily
            if (scannerRef.current && typeof scannerRef.current.pause === "function") {
              scannerRef.current.pause(true);
            }

            const memberId = parseMemberId(decodedText);
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
            // Wait 2 seconds, then resume
            setTimeout(() => {
              isProcessingRef.current = false;
              setIsPaused(false);
              try {
                if (scannerRef.current && typeof scannerRef.current.resume === "function") {
                  scannerRef.current.resume();
                  setResult(""); // Clear result for next scan
                }
              } catch (e) {
                // Ignore if already stopped
              }
            }, 2000);
          }
        },
        () => {},
      );
    } catch (e) {
      setRunning(false);
      setError(e?.message || "Failed to start camera");
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return (
    <div className="grid gap-4 md:gap-6">
      <Card className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-[color:var(--text)]">QR Scanner</div>
            <div className="text-xs text-[color:var(--muted)] mt-0.5">
              Fast check-ins with camera scanning
            </div>
          </div>
          <div className="flex items-center gap-2">
            {running ? (
              <Button variant="danger" onClick={stop}>
                Stop
              </Button>
            ) : (
              <Button variant="primary" onClick={start} className="gap-2">
                <Camera className="h-4 w-4" />
                Start scanning
              </Button>
            )}
            <Button variant="ghost" onClick={() => (running ? start() : null)} disabled={!running}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <div className="grid gap-3">
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
