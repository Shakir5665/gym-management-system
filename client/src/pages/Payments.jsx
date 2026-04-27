import { useState } from "react";
import API from "../api/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Payments() {
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    try {
      setLoading(true);
      setMessage("");
      await API.post("/payments", {
        memberId,
        amount,
        type: "MONTHLY",
      });
      setMessage("Payment successful");
      setMemberId("");
      setAmount("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:gap-6 max-w-2xl">
      <Card className="p-5 md:p-6">
        <div className="text-sm font-bold text-white">Payments</div>
        <div className="mt-0.5 text-xs text-white/50">
          Record member payments (monthly).
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        {message ? (
          <div
            className={`mb-4 rounded-xl border px-3 py-2 text-xs font-semibold ${
              message === "Payment successful"
                ? "border-success-500/25 bg-success-500/10 text-green-200"
                : "border-danger-500/25 bg-danger-500/10 text-red-200"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="grid gap-3">
          <Input
            label="Member ID"
            placeholder="Paste member ID"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          />
          <Input
            label="Amount"
            placeholder="e.g., 999"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setMessage("")}>
              Clear
            </Button>
            <Button variant="primary" onClick={handlePayment} disabled={loading}>
              {loading ? "Processing…" : "Pay"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}