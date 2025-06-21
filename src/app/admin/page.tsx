"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [step, setStep] = useState<"email" | "otp" | "done">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setStep("otp");
    } else {
      setError("Not authorized or failed to send OTP.");
    }
    setLoading(false);
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("admin_jwt", data.token);
      setStep("done");
    } else {
      setError(data.error || "Invalid code");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-100">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        {step === "email" && (
          <form onSubmit={sendOtp} className="w-full flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="Admin email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300 text-lg shadow"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-7 py-3 rounded-full shadow-lg text-lg font-semibold hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
            {error && <span className="text-red-500 text-sm text-center">{error}</span>}
          </form>
        )}
        {step === "otp" && (
          <form onSubmit={verifyOtp} className="w-full flex flex-col gap-4">
            <input
              type="text"
              required
              placeholder="Enter OTP code"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className="px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300 text-lg shadow tracking-widest text-center"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-7 py-3 rounded-full shadow-lg text-lg font-semibold hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            {error && <span className="text-red-500 text-sm text-center">{error}</span>}
          </form>
        )}
        {step === "done" && (
          <div className="text-green-600 text-center font-semibold">Logged in! Reload to access dashboard.</div>
        )}
      </div>
    </div>
  );
}
