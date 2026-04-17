"use client";

import { useState } from "react";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [discountCode, setDiscountCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Your code is ready.");
        setDiscountCode(data.discountCode || "WELCOME15");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-teal flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="font-heading font-semibold text-charcoal text-lg mb-1">Check your inbox...</p>
        <p className="text-text-light text-sm mb-4">Your 15% off code is on its way.</p>
        <div className="inline-block bg-white border-2 border-dashed border-pink rounded-xl px-8 py-4">
          <p className="text-xs text-text-light uppercase tracking-widest font-heading font-semibold mb-1">Your 15% off code</p>
          <p className="font-heading font-bold text-3xl text-pink tracking-widest">{discountCode}</p>
          <p className="text-xs text-text-light mt-2">Use at checkout on your first order</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        required
        disabled={status === "loading"}
        className="flex-1 px-4 py-3 rounded-lg border border-mid-gray text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-pink disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === "loading" || !email}
        className="bg-pink hover:bg-pink-hover text-white font-heading font-semibold px-6 py-3 rounded-lg transition whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Sending…" : "Send My Code"}
      </button>
      {status === "error" && (
        <p className="w-full text-sm text-red-500 mt-1">{message}</p>
      )}
    </form>
  );
}
