"use client";

import { useState, useEffect } from "react";

interface WaitlistEntry {
  email: string;
  created?: { seconds: number; nanoseconds: number };
}

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [passkey, setPasskey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jwt, setJwt] = useState<string | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [fetching, setFetching] = useState(false);

  // On mount, check for JWT
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_jwt") : null;
    if (token) setJwt(token);
  }, []);

  // Fetch waitlist if logged in
  useEffect(() => {
    if (!jwt) return;
    setFetching(true);
    fetch("/api/waitlist", {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch waitlist");
        return res.json();
      })
      .then((data) => setWaitlist(data.waitlist || []))
      .catch((err) => setError(err.message || "Failed to fetch waitlist"))
      .finally(() => setFetching(false));
  }, [jwt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, passkey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("admin_jwt", data.token);
      setJwt(data.token);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (jwt) {
    return (
      <div className="min-h-screen h-screen max-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-100 p-0">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg flex flex-col items-center gap-4 overflow-auto max-h-[90vh]">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Waitlist Emails</h1>
          {fetching ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-xs">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse mt-2">
              <thead>
                <tr>
                  <th className="py-2 px-2 border-b text-gray-700 font-semibold">Email</th>
                  <th className="py-2 px-2 border-b text-gray-700 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {waitlist.length === 0 ? (
                  <tr><td colSpan={2} className="text-center text-gray-400 py-4">No entries yet.</td></tr>
                ) : (
                  waitlist.map((entry, i) => (
                    <tr key={entry.email + i} className="odd:bg-gray-50 even:bg-white">
                      <td className="py-2 px-2 text-gray-900">{entry.email}</td>
                      <td className="py-2 px-2 text-gray-600 text-xs">
                        {entry.created ? new Date(entry.created.seconds * 1000).toLocaleString() : ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen max-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-100 p-0">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs sm:max-w-sm flex flex-col items-center gap-4"
        style={{ minWidth: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300 text-base shadow placeholder-gray-400 text-gray-700"
        />
        <input
          type="password"
          required
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          minLength={6}
          placeholder="6-digit passkey"
          value={passkey}
          onChange={e => setPasskey(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-base shadow placeholder-gray-400 text-gray-700 tracking-widest text-center"
        />
        <button
          type="submit"
          disabled={loading || passkey.length !== 6}
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-5 py-2 rounded-full shadow-lg text-base font-semibold hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed w-full"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <span className="text-red-500 text-xs text-center w-full">{error}</span>}
        <span className="block w-full text-xs text-gray-400 mt-2 text-center">Admins only. Passkey required.</span>
      </form>
    </div>
  );
}
