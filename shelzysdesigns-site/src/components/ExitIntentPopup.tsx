"use client";

import { useEffect, useState } from "react";
import EmailCapture from "./EmailCapture";

const STORAGE_KEY = "shelzys_popup_dismissed_at";
const DISMISS_DAYS = 7;

export default function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    // Respect prior dismissal
    try {
      const last = localStorage.getItem(STORAGE_KEY);
      if (last) {
        const days = (Date.now() - Number(last)) / (1000 * 60 * 60 * 24);
        if (days < DISMISS_DAYS) return;
      }
    } catch {}

    // Arm after 8s on page to avoid instant-fire on quick bounces
    const armTimer = setTimeout(() => setArmed(true), 8000);
    return () => clearTimeout(armTimer);
  }, []);

  useEffect(() => {
    if (!armed) return;

    // Desktop exit intent: cursor leaves viewport from the top
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) {
        setOpen(true);
      }
    }

    // Mobile fallback: fire after 45s on page
    const timeTimer = setTimeout(() => setOpen(true), 45000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timeTimer);
    };
  }, [armed]);

  function handleClose() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {}
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-popup-title"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-light-gray hover:bg-mid-gray flex items-center justify-center transition"
          aria-label="Close"
        >
          <svg className="w-4 h-4 text-charcoal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="text-center mb-5">
          <div className="inline-block bg-pink/10 text-pink text-xs font-heading font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            Wait -- don&apos;t leave yet
          </div>
          <h2 id="exit-popup-title" className="font-heading font-bold text-2xl text-charcoal mb-2">
            Get 15% off your first order
          </h2>
          <p className="text-text-light text-sm">
            Drop your email and we&apos;ll send your code plus first access to new templates and restocks.
          </p>
        </div>

        <EmailCapture />

        <p className="text-xs text-text-light text-center mt-4">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
