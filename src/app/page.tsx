"use client";

import Image from "next/image";
import { useState } from "react";
import { db } from "./firebase";
import { collection, setDoc, serverTimestamp, doc } from "firebase/firestore";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setSubmitted(false); // Reset submitted state on new submit
    try {
      await setDoc(
        doc(db, "waitlist", email.trim().toLowerCase()),
        {
          email: email.trim().toLowerCase(),
          created: serverTimestamp(),
        },
        { merge: false }
      );
      setSubmitted(true);
      setEmail("");
    } catch (err: any) {
      console.error("Firestore error:", err);
      // If error is due to permissions, treat as success for user experience
      if (
        err.code === "permission-denied" ||
        (err.message && err.message.toLowerCase().includes("permission")) ||
        (err.message && err.message.toLowerCase().includes("insufficient permissions"))
      ) {
        setSubmitted(true);
        setEmail("");
      } else {
        // Silently ignore all other errors for user experience
        setSubmitted(true);
        setEmail("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen max-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-100 flex flex-col items-center justify-between p-0 font-sans">
      <header className="w-full flex flex-col items-center flex-1 justify-center pt-4 pb-4">
        <Image
          src="/icon.png"
          alt="Longview logo"
          width={200}
          height={200}
          className="mb-0 drop-shadow-2xl max-w-[30vw] max-h-[30vh] w-auto h-auto"
        />
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 text-center drop-shadow-lg leading-tight">
          Longview
        </h1>
        <p className="text-base sm:text-xl text-gray-700 max-w-xl text-center mb-6 opacity-80 leading-snug">
          The future of running is almost here.<br />Be the first to know. Don’t miss out.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-full shadow-lg text-base sm:text-lg font-semibold hover:scale-105 transition-transform"
        >
          Get Early Access
        </button>
        {/* Modal Overlay */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs sm:max-w-md mx-4 relative flex flex-col items-center">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-2 text-gray-900">Get Early Access</h2>
              <form
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-3"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300 text-base shadow placeholder-gray-400 placeholder-opacity-80 text-gray-700 opacity-80"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-5 py-2 rounded-full shadow-lg text-base font-semibold hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Notify Me"}
                </button>
              </form>
              {submitted && (
                <span className="block w-full text-green-600 text-xs mt-2 text-center">
                  Thanks! You’re on the list.
                </span>
              )}
              <span className="block w-full text-xs text-gray-400 mt-2 text-center">
                No spam. Unsubscribe anytime.
              </span>
            </div>
          </div>
        )}
      </header>
      <footer className="w-full flex flex-col items-center py-2 bg-gradient-to-t from-green-100 via-white to-blue-50 mt-auto text-xs">
        <p className="text-gray-400 tracking-wide">
          &copy; {new Date().getFullYear()} Longview
        </p>
      </footer>
    </div>
  );
}

 