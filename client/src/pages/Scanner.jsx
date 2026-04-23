import { useState } from "react";
import { QrReader } from "react-qr-reader";
import API from "../api/api";

export default function Scanner() {
  const [result, setResult] = useState("");

  const handleScan = async (data) => {
    if (data) {
      try {
        let memberId = data.text;

        // Try to parse if QR data is JSON
        try {
          const parsedData = JSON.parse(data.text);
          memberId = parsedData.memberId;
        } catch (e) {
          // If not JSON, use the text as is
        }

        const res = await API.post("/attendance/checkin", {
          memberId: memberId,
        });

        setResult(res.data.status + " - " + res.data.reason);
      } catch (err) {
        console.error("Scan error:", err);
        setResult("Error: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Scan QR</h2>

      <QrReader
        onResult={(result, error) => {
          if (!!result) handleScan(result);
        }}
        constraints={{ facingMode: "environment" }}
      />

      <p>{result}</p>
    </div>
  );
}
