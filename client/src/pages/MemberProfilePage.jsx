import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";
import AreaSpark from "../components/charts/AreaSpark";
import { ArrowLeft, Flame, ShieldAlert, Star, ChevronDown, Gavel, FileWarning, Ban, ShieldCheck, Receipt, CheckCircle, Edit3, Download, Mail } from "lucide-react";
import QRCode from "qrcode";
import { socket } from "../socket";

function churnVariant(prob) {
  if (prob === "HIGH") return "danger";
  if (prob === "MEDIUM") return "warning";
  if (prob === "LOW") return "success";
  return "neutral";
}

function formatMoneyLKR(amount) {
  const n = Number(amount || 0);
  return `${n.toLocaleString("en-LK", { maximumFractionDigits: 0 })} LKR`;
}

export default function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gymName } = useAuth();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const [game, setGame] = useState({});
  const [churnProb, setChurnProb] = useState("");
  const [trend, setTrend] = useState([]);
  const [activity, setActivity] = useState([]);
  const [payments, setPayments] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    fullLegalName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    emergencyPhone: "",
    homeAddress: "",
  });

  const [banOpen, setBanOpen] = useState(false);
  const [banForm, setBanForm] = useState({ reason: "", from: "", to: "" });

  const [fineOpen, setFineOpen] = useState(false);
  const [fineForm, setFineForm] = useState({ amount: "", reason: "" });
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState("");

  const downloadQrCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${member?.fullLegalName || member?.name || "member"}-qrcode.png`.replace(/\s+/g, "_");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function fetchAll() {
    try {
      setError("");
      const [mRes, gRes, rRes, tRes, aRes, pRes] = await Promise.all([
        API.get(`/members/${id}`),
        API.get(`/gamification/${id}`),
        API.get(`/churn/${id}`),
        API.get(`/attendance/trend/${id}?days=14`),
        API.get(`/members/${id}/activity?limit=20`),
        API.get(`/payments/member/${id}`),
      ]);

      setMember(mRes.data || null);
      setGame(gRes.data || {});
      setChurnProb(rRes.data?.probability || "");
      setTrend((tRes.data?.series || []).map((x) => x.count));
      setActivity(Array.isArray(aRes.data?.items) ? aRes.data.items : []);
      setPayments(Array.isArray(pRes.data) ? pRes.data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load member profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAll();

    if (id) {
      QRCode.toDataURL(JSON.stringify({ memberId: id }), {
        margin: 1,
        width: 200,
        color: { dark: "#000000", light: "#ffffff" },
      })
        .then((url) => {
          if (!cancelled) setQrCodeUrl(url);
        })
        .catch((err) => console.error("QR Gen Error:", err));
    }

    function onAttendance(payload) {
      if (!payload || payload.memberId !== id) return;
      if (!cancelled) fetchAll();
    }
    function onGame(payload) {
      if (!payload || payload.memberId !== id) return;
      if (!cancelled) fetchAll();
    }
    function onPayment(payload) {
      if (!payload || payload.memberId !== id) return;
      if (!cancelled) fetchAll();
    }

    socket.on("attendance:new", onAttendance);
    socket.on("gamification:update", onGame);
    socket.on("payment:update", onPayment);
    return () => {
      cancelled = true;
      socket.off("attendance:new", onAttendance);
      socket.off("gamification:update", onGame);
      socket.off("payment:update", onPayment);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!member) return;
    setEditForm({
      fullLegalName: member.fullLegalName || member.name || "",
      dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().slice(0, 10) : "",
      gender: member.gender || "",
      email: member.email || "",
      phone: member.phone || "",
      emergencyPhone: member.emergencyPhone || "",
      homeAddress: member.homeAddress || "",
    });
  }, [member]);

  async function handleSaveMember() {
    if (!editForm.fullLegalName.trim() || !editForm.phone.trim()) {
      setError("Full legal name and primary phone are required");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await API.put(`/members/${id}`, {
        fullLegalName: editForm.fullLegalName.trim(),
        dateOfBirth: editForm.dateOfBirth || undefined,
        gender: editForm.gender || undefined,
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        emergencyPhone: editForm.emergencyPhone.trim(),
        homeAddress: editForm.homeAddress.trim(),
      });
      setEditOpen(false);
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update member");
    } finally {
      setSaving(false);
    }
  }

  async function handleBan() {
    try {
      setSaving(true);
      await API.put(`/members/${id}/ban`, {
        banReason: banForm.reason,
        banFrom: banForm.from,
        banTo: banForm.to,
      });
      setBanOpen(false);
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to ban member");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnban() {
    try {
      setSaving(true);
      await API.put(`/members/${id}/unban`);
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to unban member");
    } finally {
      setSaving(false);
    }
  }

  async function handleFine() {
    try {
      setSaving(true);
      await API.put(`/members/${id}/fine`, {
        fineAmount: Number(fineForm.amount),
        fineReason: fineForm.reason,
      });
      setFineOpen(false);
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to fine member");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnfine() {
    try {
      setSaving(true);
      await API.put(`/members/${id}/unfine`);
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to unfine member");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendReminder() {
    try {
      setSaving(true);
      setError("");
      setReminderSuccess("");
      await API.post(`/members/${id}/send-reminder`);
      setReminderSuccess("Payment reminder email sent successfully!");
      setReminderOpen(false);
      // Auto hide success message after 5 seconds
      setTimeout(() => setReminderSuccess(""), 5000);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to send reminder");
    } finally {
      setSaving(false);
    }
  }


  const metricCard =
    "glass p-5 md:p-6 transition hover:border-[color:var(--glass-border-strong)] hover:bg-[color:var(--control-bg)] hover:-translate-y-[1px] will-change-transform";

  const activityRows = useMemo(() => activity.slice(0, 12), [activity]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-6 w-64 rounded bg-[color:var(--control-bg)] animate-pulse" />
        <div className="mt-4 h-24 rounded bg-[color:var(--control-bg)] animate-pulse" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-sm text-danger-500 font-semibold">{error}</div>
        <div className="mt-3">
          <Button variant="ghost" onClick={() => navigate("/app/members")}>
            Back to members
          </Button>
        </div>
      </Card>
    );
  }

  const latestPayment = payments?.[0];
  const isPaymentExpired = member?.subscriptionEnd && new Date(member.subscriptionEnd) < new Date();

  return (
    <div className="grid gap-4 md:gap-6">
      {(member?.isBanned || member?.hasFine || isPaymentExpired || reminderSuccess) && (
        <Card className="p-5 md:p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20 shadow-lg">
          <div className="flex flex-col gap-4">
            {reminderSuccess && (
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">{reminderSuccess}</span>
              </div>
            )}
            {member?.isBanned && (
              <div className="flex items-center gap-4 bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-red-500/30">
                <div className="p-3 bg-red-500/20 rounded-full shadow-inner">
                  <Gavel className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Account Banned</h3>
                  <p className="text-xs text-[color:var(--text)] mt-1">
                    <span className="font-semibold">Reason:</span> {member.banReason || "No reason provided"}
                  </p>
                  <p className="text-[11px] text-[color:var(--muted)] mt-1">
                    <span className="font-semibold">Period:</span> {member.banFrom ? new Date(member.banFrom).toLocaleDateString() : "-"} to {member.banTo ? new Date(member.banTo).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>
            )}
            {member?.hasFine && (
              <div className="flex items-center gap-4 bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-orange-500/30">
                <div className="p-3 bg-orange-500/20 rounded-full shadow-inner">
                  <FileWarning className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Active Fine</h3>
                  <p className="text-xs text-[color:var(--text)] mt-1">
                    <span className="font-semibold">Amount:</span> {formatMoneyLKR(member.fineAmount)}
                  </p>
                  <p className="text-[11px] text-[color:var(--muted)] mt-1">
                    <span className="font-semibold">Reason:</span> {member.fineReason || "No reason provided"}
                  </p>
                </div>
              </div>
            )}
            {isPaymentExpired && (
              <div className="flex items-center gap-4 bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-red-500/30">
                <div className="p-3 bg-red-500/20 rounded-full shadow-inner">
                  <Receipt className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Payment Expired</h3>
                  {latestPayment && (
                    <p className="text-xs text-[color:var(--text)] mt-1">
                      <span className="font-semibold">Last Paid:</span> {formatMoneyLKR(latestPayment.amount)}
                    </p>
                  )}
                  <p className="text-[11px] text-[color:var(--muted)] mt-1">
                    <span className="font-semibold">Expired On:</span> {new Date(member.subscriptionEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-xs text-[color:var(--muted)] hover:text-[color:var(--text)] transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="mt-3 text-sm text-[color:var(--muted)]">Member</div>
            <div className="text-2xl font-black tracking-tight text-[color:var(--text)] truncate">
              {member?.fullLegalName || member?.name || "Member"}
            </div>
            <div className="mt-1 text-xs text-[color:var(--subtle)] truncate">
              {member?.phone || " "}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
            {qrCodeUrl ? (
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="flex flex-col items-center p-1 rounded bg-white shadow-sm border border-[color:var(--control-border)] hover:scale-105 transition-transform"
                title="View QR Code"
              >
                <img src={qrCodeUrl} alt="Member QR Code" className="w-10 h-10 object-contain" />
              </button>
            ) : null}
            <div className="flex flex-row items-center justify-end gap-2 w-full sm:w-auto mt-3 sm:mt-0">
              <Button variant="danger" onClick={() => member?.isBanned ? handleUnban() : setBanOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl gap-1.5 transition-all">
                {member?.isBanned ? <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> : <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
                <span className="text-[11px] sm:text-sm font-semibold">{member?.isBanned ? "Unban" : "Ban"}</span>
              </Button>
              <Button variant="warning" onClick={() => member?.hasFine ? handleUnfine() : setFineOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl gap-1.5 transition-all">
                {member?.hasFine ? <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> : <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
                <span className="text-[11px] sm:text-sm font-semibold">{member?.hasFine ? "Unfine" : "Fine"}</span>
              </Button>
              <Button variant="solid" onClick={() => setEditOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl gap-1.5 transition-all">
                <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="text-[11px] sm:text-sm font-semibold">Edit</span>
              </Button>
              <Button
                variant="brand"
                onClick={() => setReminderOpen(true)}
                disabled={saving || !member?.email}
                className="flex-1 sm:flex-none flex items-center justify-center px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl gap-1.5 transition-all"
                title={!member?.email ? "No email address" : "Send email reminder"}
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="text-[11px] sm:text-sm font-semibold">Reminder</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <div className="text-sm font-bold text-[color:var(--text)]">Member details</div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2">
            <div className="text-[11px] text-[color:var(--muted)]">Full legal name</div>
            <div className="text-xs font-semibold text-[color:var(--text)]">
              {member?.fullLegalName || member?.name || "-"}
            </div>
          </div>
          <div className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2">
            <div className="text-[11px] text-[color:var(--muted)]">Date of birth</div>
            <div className="text-xs font-semibold text-[color:var(--text)]">
              {member?.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : "-"}
            </div>
          </div>
          <div className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2">
            <div className="text-[11px] text-[color:var(--muted)]">Gender</div>
            <div className="text-xs font-semibold text-[color:var(--text)]">{member?.gender || "-"}</div>
          </div>
          <div className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2">
            <div className="text-[11px] text-[color:var(--muted)]">Email</div>
            <div className="text-xs font-semibold text-[color:var(--text)]">{member?.email || "-"}</div>
          </div>
          <div className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2">
            <div className="text-[11px] text-[color:var(--muted)]">Primary phone</div>
            <div className="text-xs font-semibold text-[color:var(--text)]">{member?.phone || "-"}</div>
          </div>
          <div className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2">
            <div className="text-[11px] text-[color:var(--muted)]">Emergency phone</div>
            <div className="text-xs font-semibold text-[color:var(--text)]">
              {member?.emergencyPhone || "-"}
            </div>
          </div>
          <div className="md:col-span-2 rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2">
            <div className="text-[11px] text-[color:var(--muted)]">Home address</div>
            <div className="text-xs font-semibold text-[color:var(--text)]">
              {member?.homeAddress || "-"}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className={metricCard}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-[color:var(--muted)] font-semibold">Points</div>
              <div className="mt-2 text-4xl font-black tracking-tight text-[color:var(--text)]">
                {game?.points ?? 0}
              </div>
              <div className="mt-1 text-xs text-[color:var(--subtle)]">Total earned</div>
            </div>
            <div className="rounded-2xl bg-[color:var(--brand-soft-bg)] border border-[color:var(--brand-soft-border)] p-2.5">
              <Star className="h-5 w-5 text-[color:var(--brand-ink)]" />
            </div>
          </div>
        </div>

        <div className={metricCard}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-[color:var(--muted)] font-semibold">Streak</div>
              <div className="mt-2 text-4xl font-black tracking-tight text-[color:var(--text)]">
                {game?.streak ?? 0}
              </div>
              <div className="mt-1 text-xs text-[color:var(--subtle)]">Consecutive days</div>
            </div>
            <div className="rounded-2xl bg-[color:var(--warning-soft-bg)] border border-[color:var(--warning-soft-border)] p-2.5">
              <Flame className="h-5 w-5 text-[color:var(--warning-ink)]" />
            </div>
          </div>
        </div>

        <div className={metricCard}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-[color:var(--muted)] font-semibold">Churn Probability</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="text-3xl font-black tracking-tight text-[color:var(--text)]">
                  {churnProb || "N/A"}
                </div>
                <Badge variant={churnVariant(churnProb)}>{String(churnVariant(churnProb)).toUpperCase()}</Badge>
              </div>
              <div className="mt-1 text-xs text-[color:var(--subtle)]">Retention status</div>
            </div>
            <div className="rounded-2xl bg-[color:var(--danger-soft-bg)] border border-[color:var(--danger-soft-border)] p-2.5">
              <ShieldAlert className="h-5 w-5 text-[color:var(--danger-ink)]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2 p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-[color:var(--text)]">Activity History</div>
              <div className="text-xs text-[color:var(--muted)] mt-0.5">
                Recent check-ins and payments
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {activityRows.length === 0 ? (
              <div className="text-xs text-[color:var(--muted)]">No activity yet.</div>
            ) : (
              activityRows.map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[color:var(--text)]">
                      {row.type === "PAYMENT" ? "Payment" : "Check-in"}
                    </div>
                    <div className="text-[11px] text-[color:var(--muted)] truncate">
                      {new Date(row.at).toLocaleString()}
                      {row.type === "PAYMENT" ? ` • ${formatMoneyLKR(row.amount)}` : ""}
                      {row.type === "CHECKIN" && row.status ? ` • ${row.status}` : ""}
                    </div>
                  </div>
                  {row.type === "PAYMENT" ? (
                    <Badge variant="brand">PAID</Badge>
                  ) : (
                    <Badge variant={row.status === "SUCCESS" ? "success" : "danger"}>
                      {row.status === "SUCCESS" ? "OK" : "BLOCKED"}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="text-sm font-bold text-[color:var(--text)]">Attendance Trend</div>
          <div className="text-xs text-[color:var(--muted)] mt-0.5">Last 14 days</div>
          <div className="mt-4">
            <AreaSpark values={trend} accent="brand" className="rounded-xl" />
          </div>
        </Card>
      </div>

      <Card className="p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-[color:var(--text)]">Payment History</div>
            <div className="text-xs text-[color:var(--muted)] mt-0.5">Last payments</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                navigate(
                  `/app/payments?action=pay&memberId=${encodeURIComponent(id)}&memberName=${encodeURIComponent(member?.fullLegalName || member?.name || "")}`,
                )
              }
            >
              Make payment
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {payments.length === 0 ? (
            <div className="text-xs text-[color:var(--muted)]">No payments yet.</div>
          ) : (
            payments.slice(0, 8).map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[color:var(--text)]">
                    {formatMoneyLKR(p.amount)} • MONTHLY
                  </div>
                  <div className="text-[11px] text-[color:var(--muted)]">
                    {new Date(p.createdAt || p._id?.getTimestamp?.() || Date.now()).toLocaleDateString()}
                    {p.nextDueDate ? ` • next due ${new Date(p.nextDueDate).toLocaleDateString()}` : ""}
                  </div>
                </div>
                <Badge variant="success">PAID</Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit member details">
        <div className="grid gap-3">
          <Input
            label="Full legal name"
            value={editForm.fullLegalName}
            onChange={(e) => setEditForm((p) => ({ ...p, fullLegalName: e.target.value }))}
            autoFocus
          />
          <Input
            label="Date of birth"
            type="date"
            value={editForm.dateOfBirth}
            onChange={(e) => setEditForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
          />
          <Select
            label="Gender"
            value={editForm.gender}
            onChange={(val) => setEditForm((p) => ({ ...p, gender: val }))}
            options={[
              { value: "", label: "Select" },
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
              { value: "OTHER", label: "Other" },
              { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
            ]}
          />
          <Input
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
          />
          <Input
            label="Primary phone"
            value={editForm.phone}
            onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
          />
          <Input
            label="Emergency phone"
            value={editForm.emergencyPhone}
            onChange={(e) => setEditForm((p) => ({ ...p, emergencyPhone: e.target.value }))}
          />
          <Input
            label="Home address"
            value={editForm.homeAddress}
            onChange={(e) => setEditForm((p) => ({ ...p, homeAddress: e.target.value }))}
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveMember} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={banOpen} onClose={() => setBanOpen(false)} title="Ban Member">
        <div className="grid gap-3">
          <Input label="Reason" value={banForm.reason} onChange={(e) => setBanForm(p => ({ ...p, reason: e.target.value }))} autoFocus />
          <Input label="From Date" type="date" value={banForm.from} onChange={(e) => setBanForm(p => ({ ...p, from: e.target.value }))} />
          <Input label="To Date" type="date" value={banForm.to} onChange={(e) => setBanForm(p => ({ ...p, to: e.target.value }))} />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setBanOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="danger" onClick={handleBan} disabled={saving}>{saving ? "Saving..." : "Ban Member"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={fineOpen} onClose={() => setFineOpen(false)} title="Fine Member">
        <div className="grid gap-3">
          <Input label="Amount" type="number" value={fineForm.amount} onChange={(e) => setFineForm(p => ({ ...p, amount: e.target.value }))} autoFocus />
          <Input label="Reason" value={fineForm.reason} onChange={(e) => setFineForm(p => ({ ...p, reason: e.target.value }))} />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setFineOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="warning" onClick={handleFine} disabled={saving}>{saving ? "Saving..." : "Apply Fine"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={qrModalOpen} onClose={() => setQrModalOpen(false)} title="Member QR Code">
        <div className="flex flex-col items-center justify-center p-6 gap-6">
          <div className="bg-white p-4 rounded-xl shadow-lg border border-[color:var(--control-border)]">
            <img src={qrCodeUrl} alt="Member QR Code Large" className="w-64 h-64 object-contain" />
          </div>
          <p className="text-sm font-semibold text-center text-[color:var(--text)]">
            {member?.fullLegalName || member?.name}
          </p>
          <div className="flex gap-3 w-full">
            <Button variant="ghost" onClick={() => setQrModalOpen(false)} className="flex-1">
              Close
            </Button>
            <Button variant="primary" onClick={downloadQrCode} className="flex-1 flex justify-center items-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={reminderOpen} onClose={() => setReminderOpen(false)} title="Email Reminder Preview">
        <div className="grid gap-4">
          <div className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--bg2)] p-4">
            <div className="text-[11px] text-[color:var(--muted)] uppercase font-bold tracking-wider mb-3">Message Preview</div>
            <div className="space-y-3 text-xs text-[color:var(--text)] leading-relaxed">
              <p>Hi <strong>{member?.fullLegalName || member?.name}</strong>,</p>
              <p>This is a formal reminder regarding your gym payment.</p>
              <div className="bg-[color:var(--control-bg)] p-3 rounded-lg border border-[color:var(--control-border)] space-y-1">
                <p>• <strong>Last Payment:</strong> {latestPayment ? new Date(latestPayment.createdAt).toLocaleDateString() : "N/A"}</p>
                <p>• <strong>Expiration:</strong> <span className="text-danger-500">{member?.subscriptionEnd ? new Date(member.subscriptionEnd).toLocaleDateString() : "N/A"}</span></p>
                <p>• <strong>Amount:</strong> {latestPayment ? formatMoneyLKR(latestPayment.amount) : "N/A"}</p>
              </div>
              <p>Please ensure your subscription is renewed to continue enjoying our facilities.</p>
              <p className="pt-2">Best regards,<br /><strong>{gymName || "Our Gym"}</strong></p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setReminderOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="brand" onClick={handleSendReminder} disabled={saving} className="gap-2">
              <Mail className="h-4 w-4" />
              {saving ? "Sending..." : "Confirm & Send"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

