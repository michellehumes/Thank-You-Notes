"use client";

import { useState } from "react";

// Compact hero-section email capture.
// Sits below the two primary CTAs and reads as secondary.
// POSTs to /api/hero-subscribe.

export default function HeroEmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/hero-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "homepage_hero",
          consent: true,
          consent_text:
            "I agree to receive marketing emails from Shelzy's Designs and accept the privacy policy.",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Connection error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        className="mt-6 max-w-md mx-auto md:mx-0"
        role="status"
        aria-live="polite"
      >
        <p className="font-heading text-sm font-semibold text-charcoal">
          Check your inbox -- your code is on the way.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 max-w-md mx-auto md:mx-0">
      <p className="font-heading text-sm font-semibold text-charcoal mb-1">
        Get the free printable gift-tag pack + 10% off
      </p>
      <p className="text-text-light text-xs mb-3">
        Delivered the second you sign up. Plus new templates twice a month.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2"
        noValidate
      >
        <label htmlFor="hero-email" className="sr-only">
          Email address
        </label>
        <input
          id="hero-email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === "loading"}
          className="flex-1 min-w-0 px-3 py-2.5 rounded-md border border-mid-gray text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-pink disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email}
          className="bg-pink hover:bg-pink-hover text-white font-heading font-semibold text-sm px-4 py-2.5 rounded-md transition whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Sending..." : "Send my code"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
