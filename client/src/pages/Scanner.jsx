import { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import API from "../api/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Camera, RefreshCcw } from "lucide-react";

export default function Scanner() {
  const [result, setResult] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
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
    }
  };

  const start = async () => {
    try {
      setError("");
      setResult("");

      if (!scannerRef.current) scannerRef.current = new Html5Qrcode(regionId);
      const config = { fps: 10, qrbox: { width: 260, height: 260 } };

      setRunning(true);
      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          try {
            const memberId = parseMemberId(decodedText);
            const res = await API.post("/attendance/checkin", { memberId });
            setResult(`${res.data?.status || "OK"} — ${res.data?.reason || "Checked in"}`);
          } catch (err) {
            setResult(`Error — ${err.response?.data?.message || err.message}`);
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
            <div className="text-sm font-bold text-white">QR Scanner</div>
            <div className="text-xs text-white/50 mt-0.5">Fast check-ins with camera scanning</div>
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
          <div
            id={regionId}
            className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40"
          />
          {error ? <div className="text-sm text-danger-500 font-semibold">{error}</div> : null}
          {result ? (
            <div className="flex items-center gap-2">
              <Badge variant={String(result).startsWith("Error") ? "danger" : "success"}>
                {String(result).startsWith("Error") ? "Error" : "Success"}
              </Badge>
              <div className="text-xs text-white/60">{result}</div>
            </div>
          ) : (
            <div className="text-xs text-white/50">
              Aim the camera at a member’s QR code to check them in.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
