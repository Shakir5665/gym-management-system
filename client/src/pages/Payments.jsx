import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

function toDateInput(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function monthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: toDateInput(from), to: toDateInput(to) };
}

export default function Payments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [range, setRange] = useState(monthRange());
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loadingReport, setLoadingReport] = useState(true);
  const [message, setMessage] = useState("");
  const [reportError, setReportError] = useState("");
  const [payments, setPayments] = useState([]);

  const prefillMemberId = String(searchParams.get("memberId") || "");
  const prefillMemberName = String(searchParams.get("memberName") || "");
  const showPaymentForm =
    String(searchParams.get("action") || "").toLowerCase() === "pay";

  const loadReport = async (from = range.from, to = range.to) => {
    try {
      setLoadingReport(true);
      setReportError("");
      const res = await API.get(`/payments?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&limit=500`);
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setReportError(
        err.response?.data?.message || "Failed to load payment report",
      );
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  useEffect(() => {
    if (showPaymentForm) {
      setMemberId(prefillMemberId);
      setMessage("");
    }
  }, [showPaymentForm, prefillMemberId]);

  const handlePayment = async () => {
    if (!memberId.trim() || !amount.trim()) {
      setMessage("Member ID and amount are required");
      return;
    }
    try {
      setProcessing(true);
      setMessage("");
      await API.post("/payments", {
        memberId: memberId.trim(),
        amount: Number(amount),
        type: "MONTHLY",
      });
      setMessage("Payment successful");
      setAmount("");
      await loadReport();
      navigate("/app/payments", { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const totalCollected = useMemo(
    () => payments.reduce((sum, p) => sum + Number(p?.amount || 0), 0),
    [payments],
  );

  return (
    <div className="grid gap-4 md:gap-6">
      <Card className="p-5 md:p-6">
        <div className="text-sm font-bold text-[color:var(--text)]">
          Payments Report
        </div>
        <div className="mt-0.5 text-xs text-[color:var(--muted)]">
          Recent payments across all members.
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <Badge variant="brand">{payments.length} records</Badge>
            <span className="text-[color:var(--muted)]">
              Total Collected:{" "}
              <span className="font-semibold text-[color:var(--text)]">
                {`${totalCollected.toLocaleString("en-LK", {
                  maximumFractionDigits: 0,
                })} LKR`}
              </span>
            </span>
          </div>
          <div className="flex items-end gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="From"
                type="date"
                value={range.from}
                onChange={(e) => {
                  const newFrom = e.target.value;
                  setRange((p) => {
                    const newTo = new Date(p.to) < new Date(newFrom) ? newFrom : p.to;
                    return { from: newFrom, to: newTo };
                  });
                }}
              />
              <Input
                label="To"
                type="date"
                min={range.from}
                value={range.to}
                onChange={(e) => setRange((p) => ({ ...p, to: e.target.value }))}
              />
            </div>
            <Button variant="ghost" onClick={() => loadReport(range.from, range.to)}>
              Apply
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-[color:var(--muted)]">
            Latest entries first
          </div>
          <Button variant="ghost" onClick={loadReport}>
            Refresh
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {loadingReport ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-white/5"
              />
            ))
          ) : reportError ? (
            <div className="rounded-xl border border-[color:var(--danger-soft-border)] bg-[color:var(--danger-soft-bg)] px-3 py-2 text-xs font-semibold text-[color:var(--danger-ink)]">
              {reportError}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-xs text-[color:var(--muted)]">
              No payments yet.
            </div>
          ) : (
            payments.map((p) => (
              <div
                key={p._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-[color:var(--text)] truncate">
                    {p.memberName || "Unknown member"}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-[color:var(--muted)] truncate">
                    {p.memberPhone ? `${p.memberPhone} • ` : ""}
                    {new Date(p.createdAt).toLocaleString()}
                    {p.nextDueDate
                      ? ` • next due ${new Date(p.nextDueDate).toLocaleDateString()}`
                      : ""}
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[color:var(--text)] flex-shrink-0">
                  {`${Number(p.amount || 0).toLocaleString("en-LK", {
                    maximumFractionDigits: 0,
                  })} LKR`}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal
        open={showPaymentForm}
        onClose={() => navigate("/app/payments", { replace: true })}
        title={
          prefillMemberName
            ? `Make payment • ${prefillMemberName}`
            : "Make payment"
        }
        className="max-w-lg"
      >
        {message ? (
          <div
            className={`mb-4 rounded-xl border px-3 py-2 text-xs font-semibold ${
              message === "Payment successful"
                ? "border-[color:var(--success-soft-border)] bg-[color:var(--success-soft-bg)] text-[color:var(--success-ink)]"
                : "border-[color:var(--danger-soft-border)] bg-[color:var(--danger-soft-bg)] text-[color:var(--danger-ink)]"
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
          <div className="flex items-center justify-end gap-2 pt-4 mt-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/app/payments", { replace: true })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? "Processing…" : "Pay"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
