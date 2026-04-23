import { useState } from "react";
import API from "../api/api";

export default function Payments() {
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");

  const handlePayment = async () => {
    await API.post("/payments", {
      memberId,
      amount,
      type: "MONTHLY"
    });

    alert("Payment successful");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Make Payment</h2>

      <input
        placeholder="Member ID"
        onChange={(e) => setMemberId(e.target.value)}
      />

      <input
        placeholder="Amount"
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={handlePayment}>Pay</button>
    </div>
  );
}