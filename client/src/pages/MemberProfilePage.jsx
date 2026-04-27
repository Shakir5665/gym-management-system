import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";
import AreaSpark from "../components/charts/AreaSpark";
import { ArrowLeft, Flame, ShieldAlert, Star, ChevronDown } from "lucide-react";
import QRCode from "qrcode";
import { socket } from "../socket";

function riskVariant(risk) {
  if (risk === "HIGH") return "danger";
  if (risk === "MEDIUM") return "warning";
  if (risk === "LOW") return "success";
  return "neutral";
}

function formatMoneyLKR(amount) {
  const n = Number(amount || 0);
  return `${n.toLocaleString("en-LK", { maximumFractionDigits: 0 })} LKR`;
}

export default function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const [game, setGame] = useState({});
  const [risk, setRisk] = useState("");
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

  async function fetchAll() {
    try {
      setError("");
      const [mRes, gRes, rRes, tRes, aRes, pRes] = await Promise.all([
        API.get(`/members/${id}`),
        API.get(`/gamification/${id}`),
        API.get(`/retention/${id}`),
        API.get(`/attendance/trend/${id}?days=14`),
        API.get(`/members/${id}/activity?limit=20`),
        API.get(`/payments/member/${id}`),
      ]);

      setMember(mRes.data || null);
      setGame(gRes.data || {});
      setRisk(rRes.data?.risk || "");
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

  return (
    <div className="grid gap-4 md:gap-6">
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
              <div className="flex flex-col items-center p-1 rounded bg-white shadow-sm border border-[color:var(--control-border)]">
                <img src={qrCodeUrl} alt="Member QR Code" className="w-16 h-16 object-contain" />
              </div>
            ) : null}
            <Button variant="solid" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
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
              <div className="text-xs text-[color:var(--muted)] font-semibold">Risk</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="text-3xl font-black tracking-tight text-[color:var(--text)]">
                  {risk || "N/A"}
                </div>
                <Badge variant={riskVariant(risk)}>{String(riskVariant(risk)).toUpperCase()}</Badge>
              </div>
              <div className="mt-1 text-xs text-[color:var(--subtle)]">Retention level</div>
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
            <Button variant="ghost" onClick={() => {}} disabled>
              Send reminder
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                navigate(
                  `/app/payments?action=pay&memberId=${encodeURIComponent(id)}&memberName=${encodeURIComponent(member?.fullLegalName || member?.name || "")}`,
                )
              }
            >
              Mark payment
            </Button>
            <Button variant="ghost" onClick={() => {}} disabled>
              Add note
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
    </div>
  );
}

