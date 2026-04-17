"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Shop All", href: "/shop" },
  { label: "Gift Finder", href: "/gift-finder" },
  { label: "For Mom", href: "/gifts-for/mom" },
  { label: "For Dad", href: "/gifts-for/dad" },
  { label: "Water Bottles", href: "/collections/water-bottles" },
  { label: "Wedding", href: "/collections/wedding" },
  { label: "Blog", href: "/blog" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-mid-gray">
      <div className="mx-auto max-w-[1200px] px-6 flex items-center justify-between h-16">

        {/* Wordmark */}
        <Link href="/" aria-label="Shelzy's Designs home" className="group flex items-center gap-3">
          {/* SD mark */}
          <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-pink group-hover:bg-pink-hover transition-colors">
            <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
              <text
                x="50%" y="54%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="Montserrat, sans-serif"
                fontWeight="800"
                fontSize="15"
                fill="white"
                letterSpacing="-0.5"
              >
                SD
              </text>
            </svg>
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-heading font-bold text-charcoal text-[1.05rem] tracking-tight leading-none">
              Shelzy&apos;s Designs
            </span>
            <span className="text-pink text-[10px] font-heading font-semibold tracking-widest uppercase mt-0.5">
              Personal gifts. Practical tools.
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-heading text-[11px] font-semibold tracking-widest uppercase text-text-light hover:text-charcoal transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-[1.5px] bg-charcoal transition-transform duration-200 origin-center ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-charcoal transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-charcoal transition-transform duration-200 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-96" : "max-h-0"}`}>
        <nav className="mx-auto max-w-[1200px] px-6 pb-6 pt-4 flex flex-col gap-5 border-t border-mid-gray">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="font-heading text-[11px] font-semibold tracking-widest uppercase text-text-light hover:text-charcoal transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
