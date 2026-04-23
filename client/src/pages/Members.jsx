import { useEffect, useState } from "react";
import API from "../api/api";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const fetchMembers = async () => {
    try {
      const res = await API.get("/members");
      setMembers(res.data);
    } catch (err) {
      setError("Failed to fetch members: " + err.message);
      console.error(err);
    }
  };

  const addMember = async () => {
    if (!name || !phone) {
      setError("Please enter both name and phone");
      return;
    }
    try {
      await API.post("/members", { name, phone });
      setName("");
      setPhone("");
      setError("");
      fetchMembers();
    } catch (err) {
      setError(
        "Failed to add member: " + err.response?.data?.message || err.message,
      );
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Members</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter phone"
      />
      <button onClick={addMember}>Add Member</button>

      <ul>
        {members.map((m) => (
          <li key={m._id}>
            {m.name}
            <br />
            <img src={m.qrCode} width="100" alt="QR" />
          </li>
        ))}
      </ul>
    </div>
  );
}
