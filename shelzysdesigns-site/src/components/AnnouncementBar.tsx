"use client";

import { useState } from "react";

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative text-center py-2.5 px-10 bg-pink text-white">
      <p className="text-xs font-heading font-semibold tracking-widest uppercase">
        New customers &mdash; use{" "}
        <span className="font-bold border-b border-white/40">WELCOME15</span>{" "}
        for 15% off ✦
      </p>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
