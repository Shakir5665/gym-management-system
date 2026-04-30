import { useState, useEffect } from "react";
import API from "../../api/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { CreditCard, Calendar, ArrowUpRight } from "lucide-react";

export default function MemberPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await API.get("/portal/payments");
        setPayments(res.data);
      } catch (err) {
        console.error("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse text-[color:var(--muted)] font-bold">Loading Payments...</div>;

  return (
    <div className="grid gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-[color:var(--text)]">Payment History</h1>
        <p className="text-sm text-[color:var(--muted)] font-medium">Track your subscriptions and dues.</p>
      </div>

      <div className="grid gap-4">
        {payments.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2">
            <div className="text-[color:var(--muted)] italic">No payment records found.</div>
          </Card>
        ) : (
          payments.map((p) => (
            <Card key={p._id} className="p-5 flex items-center justify-between hover:bg-[color:var(--control-bg)]/40 transition">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/10">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-[color:var(--text)]">
                    {p.amount.toLocaleString()} LKR
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[color:var(--muted)] mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(p.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="success">Completed</Badge>
                <div className="hidden md:block text-[10px] font-bold text-[color:var(--subtle)] uppercase tracking-widest">
                  Ref: {p._id.slice(-8).toUpperCase()}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
