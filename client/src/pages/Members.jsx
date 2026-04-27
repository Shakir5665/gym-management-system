import { useEffect, useState } from "react";
import API from "../api/api";

export default function Members({ setSelectedMember }) {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const fetchMembers = async () => {
    const res = await API.get("/members");
    setMembers(res.data);
  };

  const addMember = async () => {
    if (!name || !phone) return;

    await API.post("/members", { name, phone });

    setName("");
    setPhone("");
    fetchMembers();
  };

  const handleSelect = (m) => {
    setSelectedId(m._id);
    setSelectedMember(m._id);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div>

      {/* 🔹 FORM */}
      <div className="mb-4 space-y-2">
        <input
          className="w-full p-2 rounded bg-gray-700 outline-none"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-2 rounded bg-gray-700 outline-none"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          onClick={addMember}
          className="w-full bg-blue-500 hover:bg-blue-600 p-2 rounded font-semibold"
        >
          Add Member
        </button>
      </div>

      {/* 🔹 MEMBER LIST */}
      <div className="space-y-3">
        {members.map((m) => (
          <div
            key={m._id}
            onClick={() => handleSelect(m)}
            className={`p-3 rounded cursor-pointer border transition ${
              selectedId === m._id
                ? "bg-blue-600 border-blue-400"
                : "bg-gray-700 border-gray-600 hover:bg-gray-600"
            }`}
          >
            <p className="font-semibold">{m.name}</p>

            <img
              src={m.qrCode}
              className="w-16 mt-2"
              alt="QR"
            />
          </div>
        ))}
      </div>
    </div>
  );
}