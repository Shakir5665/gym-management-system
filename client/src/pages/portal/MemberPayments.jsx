import { useState, useEffect } from "react";
import API from "../../api/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { CreditCard, Calendar } from "lucide-react";
import { socket } from "../../socket";
import { useAuth } from "../../context/AuthContext";

export default function MemberPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await API.get("/portal/payments");
      setPayments(res.data);
    } catch (err) {
      console.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();

    const onPaymentUpdate = (payload) => {
      if (user?.memberId && payload.memberId === user.memberId) {
        fetchPayments(true);
      }
    };

    socket.on("payment:update", onPaymentUpdate);
    return () => socket.off("payment:update", onPaymentUpdate);
  }, [user?.memberId]);

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="h-10 w-48 bg-white/5 rounded-xl" />
        <div className="grid gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

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
            <Card key={p._id} className="p-5 flex items-center justify-between border-white/5">
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
