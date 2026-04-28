import { useState } from "react";
import API from "../api/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Mail, KeyRound, Lock } from "lucide-react";

export default function ForgotPassword({ onSuccess, onCancel }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const showMsg = (msg, type = "error") => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleSendOtp = async () => {
    if (!email) return showMsg("Email is required");
    try {
      setLoading(true);
      setMessage("");
      const res = await API.post("/auth/forgot-password", { email });
      showMsg(res.data.message, "success");
      setStep(2);
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return showMsg("OTP is required");
    try {
      setLoading(true);
      setMessage("");
      const res = await API.post("/auth/verify-otp", { email, otp });
      setResetToken(res.data.resetToken);
      showMsg("OTP verified successfully", "success");
      setStep(3);
    } catch (err) {
      showMsg(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) return showMsg("Password must be at least 6 characters");
    try {
      setLoading(true);
      setMessage("");
      await API.post("/auth/reset-password", { resetToken, newPassword });
      showMsg("Password reset successfully! You can now login.", "success");
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      {message && (
        <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
            messageType === "success"
              ? "bg-[color:var(--success-soft-bg)] text-[color:var(--success-ink)] border-[color:var(--success-soft-border)]"
              : "bg-[color:var(--danger-soft-bg)] text-[color:var(--danger-ink)] border-[color:var(--danger-soft-border)]"
          }`}>
          {message}
        </div>
      )}

      {step === 1 && (
        <>
          <div className="text-sm text-[color:var(--muted)] mb-2">Enter your email address to receive a 6-digit verification code.</div>
          <Input 
            label="Email" 
            placeholder="you@company.com" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={loading}
            left={<Mail className="h-4 w-4" />}
          />
          <Button onClick={handleSendOtp} disabled={loading} variant="primary" className="w-full mt-2">
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="text-sm text-[color:var(--muted)] mb-2">Enter the 6-digit code sent to <strong>{email}</strong></div>
          <Input 
            label="OTP Code" 
            placeholder="123456" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            disabled={loading}
            left={<KeyRound className="h-4 w-4" />}
            maxLength={6}
          />
          <Button onClick={handleVerifyOtp} disabled={loading} variant="primary" className="w-full mt-2">
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <div className="text-sm text-[color:var(--muted)] mb-2">Create a new, strong password.</div>
          <Input 
            label="New Password" 
            placeholder="••••••••" 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            disabled={loading}
            left={<Lock className="h-4 w-4" />}
          />
          <Button onClick={handleResetPassword} disabled={loading} className="w-full mt-2" variant="primary">
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </>
      )}

      <div className="text-center mt-2">
        <button onClick={onCancel} className="text-sm text-[color:var(--subtle)] hover:text-[color:var(--text)] font-semibold transition">
          Back to Login
        </button>
      </div>
    </div>
  );
}
