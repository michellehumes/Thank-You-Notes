"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Shop All", href: "/shop" },
  { label: "Water Bottles", href: "/collections/water-bottles" },
  { label: "Best Sellers", href: "/collections/best-sellers" },
  { label: "Gifts for Her", href: "/collections/gifts-for-her" },
  { label: "Wedding", href: "/collections/wedding" },
  { label: "Blog", href: "/blog" },
];

function LogoMark() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="w-9 h-9 flex-shrink-0"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="#E91E63" />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Montserrat, sans-serif"
        fontWeight="700"
        fontSize="19"
        fill="#ffffff"
        letterSpacing="-0.5"
      >
        SD
      </text>
    </svg>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-mid-gray">
      <div className="mx-auto max-w-[1200px] px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3" aria-label="Shelzy's Designs home">
          <LogoMark />
          <span className="hidden md:flex flex-col leading-tight">
            <span className="font-heading font-bold text-charcoal text-lg">
              Shelzy&apos;s Designs
            </span>
            <span className="text-pink text-xs font-medium">
              Personal gifts. Practical tools.
            </span>
          </span>
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

        {/* Right side: mobile hamburger */}
        <div className="flex items-center gap-3">
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
