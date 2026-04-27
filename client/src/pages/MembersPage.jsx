import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { QrCode, Search, UserPlus } from "lucide-react";

function memberStatusVariant(status) {
  const s = String(status || "ACTIVE").toUpperCase();
  if (s === "ACTIVE") return "success";
  if (s === "PAUSED") return "warning";
  if (s === "INACTIVE") return "danger";
  return "neutral";
}

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [adding, setAdding] = useState(false);

  const [qrMember, setQrMember] = useState(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/members");
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const name = String(m?.name || "").toLowerCase();
      const phone = String(m?.phone || "").toLowerCase();
      const matchesQuery = !q || name.includes(q) || phone.includes(q);

      const s = String(m?.status || "ACTIVE").toUpperCase();
      const matchesStatus = status === "ALL" || s === status;
      return matchesQuery && matchesStatus;
    });
  }, [members, query, status]);

  const handleAdd = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      setError("Name and phone are required");
      return;
    }
    try {
      setAdding(true);
      setError("");
      await API.post("/members", { name: newName.trim(), phone: newPhone.trim() });
      setNewName("");
      setNewPhone("");
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

      <Card className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white">Members</div>
            <div className="text-xs text-white/50 mt-0.5">
              Search, filter, and manage member QR codes.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={() => setAddOpen(true)} className="gap-2">
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

          <label className="block">
            <div className="mb-1.5 text-xs font-semibold text-white/80">Status</div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl bg-white/[0.06] border border-white/10 hover:border-white/14 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="ALL" className="bg-bg-2">
                All
              </option>
              <option value="ACTIVE" className="bg-bg-2">
                Active
              </option>
              <option value="PAUSED" className="bg-bg-2">
                Paused
              </option>
              <option value="INACTIVE" className="bg-bg-2">
                Inactive
              </option>
            </select>
          </label>

          <div className="flex items-end justify-between gap-3">
            <div className="text-xs text-white/50">
              Showing <span className="text-white/80 font-semibold">{filtered.length}</span> of{" "}
              <span className="text-white/80 font-semibold">{members.length}</span>
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
            <Card key={i} className="h-[170px] bg-white/[0.05] animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="text-sm font-semibold text-white">No members found</div>
            <div className="mt-1 text-xs text-white/50">Try adjusting your search or filters.</div>
          </Card>
        ) : (
          filtered.map((m) => (
            <button
              type="button"
              key={m._id}
              className="text-left glass p-5 transition hover:bg-white/[0.08] hover:border-white/16 hover:-translate-y-[1px] focus:outline-none focus-visible:focus-ring"
              onClick={() => {
                localStorage.setItem("selectedMemberId", m._id);
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{m.name}</div>
                  <div className="mt-0.5 text-xs text-white/50 truncate">{m.phone}</div>
                </div>
                <Badge variant={memberStatusVariant(m.status)}>
                  {String(m.status || "ACTIVE").toUpperCase()}
                </Badge>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/6 border border-white/10">
                    {m.name?.slice?.(0, 1)?.toUpperCase?.() || "M"}
                  </span>
                  <span>Tap to set as active</span>
                </div>
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
            </button>
          ))
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add member">
        <div className="grid gap-3">
          <Input
            label="Full name"
            placeholder="e.g., Ayesha Khan"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <Input
            label="Phone"
            placeholder="e.g., +91 98xxxxxxx"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)} disabled={adding}>
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
            <div className="text-xs text-white/50 text-center">
              Show this at the scanner for instant check-in.
            </div>
          </div>
        ) : (
          <div className="text-sm text-white/70">
            No QR code available for this member yet.
          </div>
        )}
      </Modal>
    </div>
  );
}

