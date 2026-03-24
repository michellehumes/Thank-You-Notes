"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Shop All", href: "/shop" },
  { label: "Water Bottles", href: "/collections/water-bottles" },
  { label: "Templates", href: "/collections/templates" },
  { label: "Planners", href: "/collections/planners" },
  { label: "Wedding", href: "/collections/wedding" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "About", href: "/about" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-mid-gray">
      <div className="mx-auto max-w-[1200px] px-6 flex items-center justify-between h-16">
        <Link href="/" className="font-heading font-bold text-charcoal text-xl">
          Shelzy&apos;s Designs
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-heading text-sm font-semibold uppercase tracking-wide text-charcoal hover:text-pink transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-charcoal transition-transform ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-charcoal transition-opacity ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-charcoal transition-transform ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile slide-down menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="mx-auto max-w-[1200px] px-6 pb-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="font-heading text-sm font-semibold uppercase tracking-wide text-charcoal hover:text-pink transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
