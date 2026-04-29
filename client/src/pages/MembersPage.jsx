import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";
import {
  CreditCard,
  QrCode,
  Search,
  UserPlus,
  ChevronDown,
  Trophy,
  ShieldAlert,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { socket } from "../socket";

function memberStatusVariant(status) {
  const s = String(status || "ACTIVE").toUpperCase();
  if (s === "ACTIVE") return "success";
  if (s === "PAUSED") return "warning";
  if (s === "INACTIVE") return "danger";
  return "neutral";
}

export default function MembersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [memberType, setMemberType] = useState("ALL");

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    fullLegalName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    emergencyPhone: "",
    homeAddress: "",
  });
  const [adding, setAdding] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const [qrMember, setQrMember] = useState(null);

  const validateForm = () => {
    const errors = [];

    // Name validation
    if (!form.fullLegalName.trim()) {
      errors.push("Full legal name is required");
    } else if (form.fullLegalName.trim().length < 2) {
      errors.push("Full legal name must be at least 2 characters");
    }

    // Phone validation
    if (!form.phone.trim()) {
      errors.push("Primary phone is required");
    } else {
      const phoneRegex = /^[\d\s\+\-\(\)]{7,}$/;
      if (!phoneRegex.test(form.phone.trim())) {
        errors.push("Primary phone must be a valid phone number");
      }
    }

    // Email validation (if provided)
    if (form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        errors.push("Email must be a valid email address");
      }
    }

    // Emergency phone validation (if provided)
    if (form.emergencyPhone.trim()) {
      const phoneRegex = /^[\d\s\+\-\(\)]{7,}$/;
      if (!phoneRegex.test(form.emergencyPhone.trim())) {
        errors.push("Emergency phone must be a valid phone number");
      }
    }

    // Date of birth validation (if provided)
    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        errors.push("Date of birth cannot be in the future");
      }
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 13) {
        errors.push("Member must be at least 13 years old");
      }
    }

    return errors;
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const [membersRes, listsRes] = await Promise.all([
        API.get("/members"),
        API.get("/dashboard/lists?limit=50"),
      ]);

      const all = Array.isArray(membersRes.data) ? membersRes.data : [];
      const lists = listsRes.data || {};

      const riskSet = new Set(
        (lists.atRiskMembers || []).map((x) => String(x.memberId)),
      );
      const dueSet = new Set(
        (lists.paymentsDueMembers || []).map((x) => String(x.memberId)),
      );
      const newSet = new Set(
        (lists.newMembers || []).map((x) => String(x.memberId)),
      );

      setMembers(
        all.map((m) => ({
          ...m,
          paymentDue: dueSet.has(String(m._id)),
          isNew: newSet.has(String(m._id)),
        })),
      );
    } catch {
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();

    // Listen for updates
    socket.on("attendance:new", fetchMembers);
    socket.on("gamification:update", fetchMembers);
    socket.on("payment:update", fetchMembers);

    return () => {
      socket.off("attendance:new", fetchMembers);
      socket.off("gamification:update", fetchMembers);
      socket.off("payment:update", fetchMembers);
    };
  }, []);

  const filtered = useMemo(() => {
    const view = String(searchParams.get("view") || "");
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const name = String(m?.fullLegalName || m?.name || "").toLowerCase();
      const phone = String(m?.phone || "").toLowerCase();
      const email = String(m?.email || "").toLowerCase();
      const matchesQuery =
        !q || name.includes(q) || phone.includes(q) || email.includes(q);

      // Determine member category
      let category = "ACTIVE";
      if (m?.isBanned) category = "BANNED";
      else if (m?.hasFine) category = "FINED";
      else if (m?.subscriptionEnd && new Date(m.subscriptionEnd) < new Date()) category = "EXPIRED";

      const matchesMemberType = memberType === "ALL" || category === memberType;

      if (view === "atrisk") {
        return matchesQuery && matchesMemberType && (m?.isBanned || m?.hasFine);
      }
      if (view === "paymentsdue") {
        return matchesQuery && matchesMemberType && Boolean(m?.paymentDue);
      }
      if (view === "new") {
        return matchesQuery && matchesMemberType && Boolean(m?.isNew);
      }
      return matchesQuery && matchesMemberType;
    });
  }, [members, query, searchParams, memberType]);

  const handleAdd = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      setAdding(true);
      setError("");
      setFormErrors([]);
      await API.post("/members", {
        fullLegalName: form.fullLegalName.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        email: form.email.trim(),
        phone: form.phone.trim(),
        emergencyPhone: form.emergencyPhone.trim(),
        homeAddress: form.homeAddress.trim(),
      });
      setForm({
        fullLegalName: "",
        dateOfBirth: "",
        gender: "",
        email: "",
        phone: "",
        emergencyPhone: "",
        homeAddress: "",
      });
      setAddOpen(false);
      await fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="grid gap-4 md:gap-6">
      {error ? (
        <Card className="p-4 border border-danger-500/20">
          <div className="text-sm font-semibold text-danger-500">{error}</div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => navigate("/app/members/top")}
          className="text-left rounded-2xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] hover:bg-[color:var(--control-bg-hover)] px-4 py-3 transition flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-semibold text-[color:var(--muted)]">
              Top members
            </div>
            <div className="mt-1 text-sm font-bold text-[color:var(--text)]">
              View by streak
            </div>
          </div>
          <div className="rounded-2xl bg-[color:var(--brand-soft-bg)] border border-[color:var(--brand-soft-border)] p-2">
            <Trophy className="h-5 w-5 text-[color:var(--brand-ink)]" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => navigate("/app/members/at-risk")}
          className="text-left rounded-2xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] hover:bg-[color:var(--control-bg-hover)] px-4 py-3 transition flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-semibold text-[color:var(--muted)]">
              At-risk members
            </div>
            <div className="mt-1 text-sm font-bold text-[color:var(--text)]">
              Low activity members
            </div>
          </div>
          <div className="rounded-2xl bg-[color:var(--danger-soft-bg)] border border-[color:var(--danger-soft-border)] p-2">
            <ShieldAlert className="h-5 w-5 text-[color:var(--danger-ink)]" />
          </div>
        </button>
      </div>

      <Card className="relative z-20 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-[color:var(--text)]">
              Members
            </div>
            <div className="text-xs text-[color:var(--muted)] mt-0.5">
              Search, filter, and manage member QR codes.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={fetchMembers} disabled={loading}>
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={() => setAddOpen(true)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add member
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Search"
            placeholder="Name or phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            left={<Search className="h-4 w-4" />}
          />

          <Select
            label="Member Status"
            value={memberType}
            onChange={(val) => setMemberType(val)}
            options={[
              { value: "ALL", label: "All" },
              { value: "ACTIVE", label: "Active" },
              { value: "EXPIRED", label: "Expired" },
              { value: "BANNED", label: "Banned" },
              { value: "FINED", label: "Fined" },
            ]}
          />

          <div className="flex items-end justify-between gap-3">
            <div className="text-xs text-[color:var(--muted)]">
              Showing{" "}
              <span className="text-[color:var(--text)] font-semibold">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="text-[color:var(--text)] font-semibold">
                {members.length}
              </span>
            </div>
            <Button variant="ghost" onClick={fetchMembers}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="h-[170px] bg-[color:var(--control-bg)] animate-pulse"
            />
          ))
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="text-sm font-semibold text-[color:var(--text)]">
              No members found
            </div>
            <div className="mt-1 text-xs text-[color:var(--muted)]">
              Try adjusting your search or filters.
            </div>
          </Card>
        ) : (
          filtered.map((m) => (
            <button
              type="button"
              key={m._id}
              className="text-left glass p-5 transition hover:bg-[color:var(--control-bg)] hover:border-[color:var(--glass-border-strong)] hover:-translate-y-[1px] focus:outline-none focus-visible:focus-ring"
              onClick={() => navigate(`/app/member/${m._id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[color:var(--text)] truncate">
                    {m.fullLegalName || m.name}
                  </div>
                  <div className="mt-0.5 text-xs text-[color:var(--muted)] truncate">
                    {m.phone}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {m?.subscriptionEnd && new Date(m.subscriptionEnd) < new Date() && (
                    <Badge variant="danger">EXPIRED</Badge>
                  )}
                  <Badge
                    variant={
                      m?.isBanned ? "danger" : m?.hasFine ? "warning" : "success"
                    }
                  >
                    {m?.isBanned ? "BANNED" : m?.hasFine ? "FINED" : "ACTIVE"}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--control-bg)] border border-[color:var(--control-border)]">
                    {m.name?.slice?.(0, 1)?.toUpperCase?.() || "M"}
                  </span>
                  <span>Tap to view profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/app/payments?action=pay&memberId=${encodeURIComponent(m._id)}&memberName=${encodeURIComponent(m.fullLegalName || m.name || "")}`,
                      );
                    }}
                    className="gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Make payment
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrMember(m);
                    }}
                    className="gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    QR
                  </Button>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setFormErrors([]);
        }}
        title="Add member"
      >
        {formErrors.length > 0 ? (
          <div className="mb-4 space-y-2">
            {formErrors.map((err, i) => (
              <div
                key={i}
                className="rounded-xl border border-[color:var(--danger-soft-border)] bg-[color:var(--danger-soft-bg)] px-3 py-2 text-xs font-semibold text-[color:var(--danger-ink)]"
              >
                • {err}
              </div>
            ))}
          </div>
        ) : null}
        <div className="grid gap-3">
          <Input
            label="Full legal name"
            placeholder="e.g., Mohamed"
            value={form.fullLegalName}
            onChange={(e) => {
              setForm((p) => ({ ...p, fullLegalName: e.target.value }));
              setFormErrors([]);
            }}
            autoFocus
          />
          <Input
            label="Date of birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => {
              setForm((p) => ({ ...p, dateOfBirth: e.target.value }));
              setFormErrors([]);
            }}
          />
          <Select
            label="Gender"
            value={form.gender}
            onChange={(val) => {
              setForm((p) => ({ ...p, gender: val }));
              setFormErrors([]);
            }}
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
            placeholder="name@example.com"
            value={form.email}
            onChange={(e) => {
              setForm((p) => ({ ...p, email: e.target.value }));
              setFormErrors([]);
            }}
          />
          <Input
            label="Primary phone"
            placeholder="e.g., +94 7x xxx xxxx"
            value={form.phone}
            onChange={(e) => {
              setForm((p) => ({ ...p, phone: e.target.value }));
              setFormErrors([]);
            }}
          />
          <Input
            label="Emergency phone"
            placeholder="e.g., +94 7x xxx xxxx"
            value={form.emergencyPhone}
            onChange={(e) => {
              setForm((p) => ({ ...p, emergencyPhone: e.target.value }));
              setFormErrors([]);
            }}
          />
          <Input
            label="Home address"
            placeholder="Street, City, State"
            value={form.homeAddress}
            onChange={(e) => {
              setForm((p) => ({ ...p, homeAddress: e.target.value }));
              setFormErrors([]);
            }}
          />
          <div className="flex items-center justify-end gap-2 pt-4 mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                setAddOpen(false);
                setFormErrors([]);
              }}
              disabled={adding}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAdd} disabled={adding}>
              {adding ? "Adding…" : "Create member"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(qrMember)}
        onClose={() => setQrMember(null)}
        title={qrMember ? `QR Code • ${qrMember.name}` : "QR Code"}
        className="max-w-md"
      >
        {qrMember?.qrCode ? (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl bg-white p-4">
              <img
                src={qrMember.qrCode}
                alt="Member QR code"
                className="h-52 w-52 object-contain"
              />
            </div>
            <div className="text-xs text-[color:var(--muted)] text-center">
              Show this at the scanner for instant check-in.
            </div>
          </div>
        ) : (
          <div className="text-sm text-[color:var(--muted)]">
            No QR code available for this member yet.
          </div>
        )}
      </Modal>
    </div>
  );
}
