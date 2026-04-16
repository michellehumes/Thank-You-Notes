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

function CartIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-mid-gray">
      <div className="mx-auto max-w-[1200px] px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0"
          aria-label="Shelzy's Designs home"
        >
          <img
            src="/logo-script.png"
            alt=""
            aria-hidden="true"
            className="h-10 w-auto shrink-0"
          />
          <span className="hidden md:flex flex-col leading-tight">
            <span className="font-heading font-bold text-charcoal text-xl">
              Shelzy&apos;s Designs
            </span>
            <span className="text-[#E63A7E] text-[11px] font-medium tracking-[0.05em]">
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

        {/* Right side: cart + mobile hamburger */}
        <div className="flex items-center gap-3">
          {/* Cart icon */}
          <Link
            href="/shop"
            aria-label="Shop"
            className="text-charcoal hover:text-pink transition p-1"
          >
            <CartIcon />
          </Link>

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
