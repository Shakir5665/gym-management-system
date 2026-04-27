import { useEffect, useState } from "react";
import API from "../api/api";

export default function Members({ setSelectedMember }) {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [expandedQR, setExpandedQR] = useState(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/members");
      setMembers(res.data);
    } catch {
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required");
      return;
    }

    try {
      setAdding(true);
      setError("");

      await API.post("/members", { name, phone });

      setName("");
      setPhone("");
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const handleSelect = (m) => {
    setSelectedId(m._id);
    setSelectedMember(m._id);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* 🔹 FORM */}
      <div className="mb-6 pb-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Add Member</h3>

        {error && (
          <div className="mb-3 p-3 bg-red-500/20 text-red-300 rounded text-sm border border-red-500/50">
            {error}
          </div>
        )}

        <input
          className="w-full p-3 mb-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition text-white text-sm"
          placeholder="Member name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={adding}
        />

        <input
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition text-white text-sm"
          placeholder="Phone number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={adding}
        />

        <button
          onClick={addMember}
          disabled={adding}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-3 rounded-lg font-semibold transition text-sm"
        >
          {adding ? "Adding..." : "Add Member"}
        </button>
      </div>

      {/* 🔹 MEMBER LIST */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          Members ({members.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 text-sm mt-2">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No members yet</p>
            <p className="text-gray-500 text-sm">
              Add a member above to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m._id}
                onClick={() => handleSelect(m)}
                className={`p-4 rounded-lg cursor-pointer border transition ${
                  selectedId === m._id
                    ? "bg-blue-600/30 border-blue-500"
                    : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                }`}
              >
                <p className="font-semibold text-sm">{m.name}</p>
                <p className="text-gray-400 text-xs mt-1">📱 {m.phone}</p>

                {m.qrCode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedQR(expandedQR === m._id ? null : m._id);
                    }}
                    className="mt-2 text-blue-400 text-xs hover:text-blue-300 transition"
                  >
                    {expandedQR === m._id ? "Hide QR" : "Show QR Code"}
                  </button>
                )}

                {expandedQR === m._id && m.qrCode && (
                  <div className="mt-3 p-2 bg-gray-800 rounded">
                    <img src={m.qrCode} className="w-20 h-20" alt="QR" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
