"use client";

import { useState } from "react";

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-pink text-white text-sm font-heading font-semibold text-center py-2.5 px-10 relative">
      <span>
        New customers get 15% off &mdash; use code{" "}
        <span className="tracking-widest font-bold">WELCOME15</span> at checkout
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition text-lg leading-none"
      >
        &times;
      </button>
    </div>
  );
}
