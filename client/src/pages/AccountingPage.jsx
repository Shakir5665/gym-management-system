import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Pencil, Trash2 } from "lucide-react";

function toDateInput(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function monthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: toDateInput(from), to: toDateInput(to) };
}

function money(n) {
  return `${Number(n || 0).toLocaleString("en-LK", {
    maximumFractionDigits: 0,
  })} LKR`;
}

function formatRangeLabel(from, to) {
  const s = new Date(from);
  const e = new Date(to);
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return s.toLocaleString("en-IN", { month: "long", year: "numeric" });
  }
  return `${s.toLocaleDateString()} to ${e.toLocaleDateString()}`;
}

function buildPrintableHtml({ gymName, report, generatedAt }) {
  const rows = (report.expenseBreakdown || [])
    .map(
      (r) => `
      <tr>
        <td>${r.category}</td>
        <td>${money(r.amount)}</td>
        <td>${Number(r.pct || 0).toFixed(1)}%</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Gym Revenue Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
    h1, h2, h3, p { margin: 0; }
    .box { border: 2px solid #111; padding: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #111; padding: 8px; font-size: 12px; text-align: left; }
    .section { margin-top: 18px; }
    .title { text-align: center; margin-bottom: 12px; }
    .muted { color: #444; font-size: 12px; }
  </style>
</head>
<body>
  <div class="box">
    <div class="title">
      <h2>${gymName}</h2>
      <h1>GYM MONTHLY REVENUE REPORT</h1>
      <p>${formatRangeLabel(report.period.from, report.period.to)}</p>
    </div>
    <div class="section">
      <h3>KEY METRICS</h3>
      <table>
        <tr><td>New Members</td><td>${report.metrics.newMembers}</td></tr>
        <tr><td>Monthly Fees (Month End)</td><td>${money(report.metrics.monthlyFeesMonthEnd)}</td></tr>
        <tr><td>Total Expenses</td><td>${money(report.metrics.totalExpenses)}</td></tr>
        <tr><td>Net Profit</td><td>${money(report.metrics.netProfit)}</td></tr>
      </table>
    </div>
    <div class="section">
      <h3>EXPENSE DETAILS</h3>
      <table>
        <tr><th>Category</th><th>Amount</th><th>% of Total Expenses</th></tr>
        ${rows}
        <tr><th>TOTAL</th><th>${money(report.metrics.totalExpenses)}</th><th>100%</th></tr>
      </table>
    </div>
    <div class="section">
      <h3>REVENUE CALCULATION</h3>
      <table>
        <tr><td>Total Collected Revenue</td><td>${money(report.metrics.totalCollectedRevenue)}</td></tr>
        <tr><td>Total Expenses</td><td>(${money(report.metrics.totalExpenses)})</td></tr>
        <tr><th>NET PROFIT</th><th>${money(report.metrics.netProfit)}</th></tr>
      </table>
    </div>
    <p class="muted section">Report generated: ${new Date(generatedAt).toLocaleString()}</p>
  </div>
</body>
</html>`;
}

export default function AccountingPage() {
  const { gymName } = useAuth();
  const [range, setRange] = useState(monthRange());
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [spentAt, setSpentAt] = useState(toDateInput(new Date()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [report, setReport] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async (from = range.from, to = range.to) => {
    try {
      setLoading(true);
      setError("");
      const [rRes, eRes] = await Promise.all([
        API.get(`/accounting/report?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
        API.get(`/accounting/expenses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&limit=500`),
      ]);
      setReport(rRes.data);
      setExpenses(Array.isArray(eRes.data) ? eRes.data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load accounting data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveExpense = async () => {
    if (!reason.trim() || !amount) {
      setError("Expense reason and amount are required");
      return;
    }
    try {
      setSaving(true);
      setError("");

      const payload = {
        reason: reason.trim(),
        amount: Number(amount),
        spentAt,
      };

      if (editingId) {
        await API.put(`/accounting/expenses/${editingId}`, payload);
      } else {
        await API.post("/accounting/expenses", payload);
      }

      setReason("");
      setAmount("");
      setEditingId(null);
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingId(expense._id);
    setReason(expense.reason);
    setAmount(expense.amount);
    setSpentAt(toDateInput(expense.spentAt));
  };

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      setError("");
      await API.delete(`/accounting/expenses/${expenseToDelete._id}`);
      await fetchAll();
      if (editingId === expenseToDelete._id) {
        setEditingId(null);
        setReason("");
        setAmount("");
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete expense");
    } finally {
      setExpenseToDelete(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setReason("");
    setAmount("");
    setSpentAt(toDateInput(new Date()));
  };

  const printReport = () => {
    if (!report) return;
    const w = window.open("", "_blank", "width=1100,height=900");
    if (!w) return;
    const html = buildPrintableHtml({
      gymName: gymName || report.gymName || "Gym",
      report,
      generatedAt: report.generatedAt || new Date(),
    });
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const totals = useMemo(() => {
    const total = expenses.reduce((s, x) => s + Number(x.amount || 0), 0);
    return { total };
  }, [expenses]);

  return (
    <div className="grid gap-4 md:gap-6">
      {error ? (
        <Card className="p-4 border border-danger-500/25">
          <div className="text-xs font-semibold text-danger-500">{error}</div>
        </Card>
      ) : null}

      <Card className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-[color:var(--text)]">Accounting</div>
            <div className="text-xs text-[color:var(--muted)] mt-0.5">
              Manage gym expenses and print financial reports.
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 w-full md:w-auto mt-2 md:mt-0">
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
              <Input
                id="report-from"
                name="reportFrom"
                label="From"
                type="date"
                value={range.from}
                onChange={(e) => setRange((p) => ({ ...p, from: e.target.value }))}
              />
              <Input
                id="report-to"
                name="reportTo"
                label="To"
                type="date"
                value={range.to}
                onChange={(e) => setRange((p) => ({ ...p, to: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto mt-1 sm:mt-0">
              <Button variant="ghost" className="flex-1 sm:flex-none" onClick={() => fetchAll(range.from, range.to)}>
                Apply
              </Button>
              <Button variant="ghost" className="flex-1 sm:flex-none" onClick={printReport} disabled={!report}>
                Print report
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-5 md:p-6 lg:col-span-1">
          <div className="text-sm font-bold text-[color:var(--text)]">
            {editingId ? "Edit expense" : "Add expense"}
          </div>
          <div className="text-xs text-[color:var(--muted)] mt-0.5">
            {editingId ? "Update existing expense details." : "Add manual expense with your own reason."}
          </div>
          <div className="mt-4 grid gap-3">
            <Input
              id="expense-reason"
              name="expenseReason"
              label="Reason"
              placeholder="e.g., Rent, Utilities, Equipment repairs"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Input
              id="expense-amount"
              name="expenseAmount"
              label="Amount"
              type="number"
              min="0"
              placeholder="e.g., 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              id="expense-date"
              name="expenseDate"
              label="Date"
              type="date"
              value={spentAt}
              onChange={(e) => setSpentAt(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              {editingId && (
                <Button variant="ghost" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </Button>
              )}
              <Button variant="primary" onClick={handleSaveExpense} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Add expense"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-5 md:p-6 lg:col-span-2">
          <div className="text-sm font-bold text-[color:var(--text)]">Expense entries</div>
          <div className="text-xs text-[color:var(--muted)] mt-0.5">
            {expenses.length} entries • Total {money(totals.total)}
          </div>
          <div className="mt-4 space-y-2 max-h-[420px] overflow-auto pr-1">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-[color:var(--control-bg)] animate-pulse" />
              ))
            ) : expenses.length === 0 ? (
              <div className="text-xs text-[color:var(--muted)]">No expenses in selected range.</div>
            ) : (
              expenses.map((x) => (
                <div
                  key={x._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[color:var(--text)] truncate">{x.reason}</div>
                    <div className="text-[11px] text-[color:var(--muted)]">
                      {new Date(x.spentAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-[color:var(--text)]">{money(x.amount)}</div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditExpense(x)}
                        className="p-1.5 text-[color:var(--muted)] hover:text-brand-500 hover:bg-[color:var(--control-bg-hover)] rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(x)}
                        className="p-1.5 text-[color:var(--muted)] hover:text-danger-500 hover:bg-danger-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5 md:p-6">
        <div className="text-sm font-bold text-[color:var(--text)]">Report preview</div>
        <div className="text-xs text-[color:var(--muted)] mt-0.5">
          Matches the printable monthly revenue format.
        </div>
        {report ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            <div className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2">
              <div className="text-[11px] text-[color:var(--muted)]">New members</div>
              <div className="text-lg font-black text-[color:var(--text)]">{report.metrics.newMembers}</div>
            </div>
            <div className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2">
              <div className="text-[11px] text-[color:var(--muted)]">Monthly fees (month end)</div>
              <div className="text-lg font-black text-[color:var(--text)]">{money(report.metrics.monthlyFeesMonthEnd)}</div>
            </div>
            <div className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2">
              <div className="text-[11px] text-[color:var(--muted)]">Total expenses</div>
              <div className="text-lg font-black text-[color:var(--text)]">{money(report.metrics.totalExpenses)}</div>
            </div>
            <div className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2">
              <div className="text-[11px] text-[color:var(--muted)]">Collected revenue</div>
              <div className="text-lg font-black text-[color:var(--text)]">{money(report.metrics.totalCollectedRevenue)}</div>
            </div>
            <div className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2">
              <div className="text-[11px] text-[color:var(--muted)]">Net profit</div>
              <div className="text-lg font-black text-[color:var(--text)]">{money(report.metrics.netProfit)}</div>
            </div>
          </div>
        ) : null}
      </Card>

      <Modal
        open={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        title="Delete Expense"
      >
        <p className="text-sm text-[color:var(--text)]">
          Are you sure you want to permanently delete this expense?
          <br />
          <strong className="block mt-2 font-semibold">
            {expenseToDelete?.reason} - {money(expenseToDelete?.amount)}
          </strong>
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={() => setExpenseToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteExpense}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
