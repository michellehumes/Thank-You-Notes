import Link from "next/link";

const shopLinks = [
  { label: "Shop All", href: "/shop" },
  { label: "Custom Water Bottles", href: "/collections/water-bottles" },
  { label: "Best Sellers", href: "/collections/best-sellers" },
  { label: "Gifts for Her", href: "/collections/gifts-for-her" },
  { label: "Wedding Planning", href: "/collections/wedding" },
  { label: "Templates", href: "/collections/templates" },
];

const helpLinks = [
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Refund Policy", href: "/policies" },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white py-16">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-heading font-bold text-lg mb-2">
              Shelzy&apos;s Designs
            </p>
            <p className="text-white/60 text-sm">
              Custom water bottles + digital templates. Personalized for real life.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="font-heading font-semibold text-sm uppercase tracking-wide mb-4">
              Shop
            </p>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="font-heading font-semibold text-sm uppercase tracking-wide mb-4">
              Help
            </p>
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="font-heading font-semibold text-sm uppercase tracking-wide mb-4">
              Connect
            </p>
            <ul className="space-y-2 mb-6">
              <li>
                <a
                  href="https://instagram.com/shelzysdesigns"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white text-sm transition"
                >
                  Instagram @shelzysdesigns
                </a>
              </li>
              <li>
                <a
                  href="https://pinterest.com/shelzysdesigns"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white text-sm transition"
                >
                  Pinterest @shelzysdesigns
                </a>
              </li>
            </ul>

            <p className="font-heading font-semibold text-sm uppercase tracking-wide mb-3">
              Also find us on
            </p>
            <a
              href="https://www.etsy.com/shop/ShelzysDesignsStore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition border border-white/20 hover:border-white/60 rounded-full px-4 py-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9.16 5.36c0-.15.02-.22.34-.22h5.48c.96 0 1.48.81 1.87 2.36l.31 1.22h.93c.16-2.95.29-4.24.29-4.24s-1.99.22-3.16.22H8.03l-2.52-.08v.98l.85.15c.6.1.74.22.79.77 0 0 .05 1.62.05 4.29 0 2.66-.05 4.26-.05 4.26-.05.5-.19.68-.79.78l-.85.16v.98l2.52-.08h4.4c1.17 0 3.9.08 3.9.08.07-.73.46-4.02.52-4.38h-.87l-.88 1.97c-.68 1.53-1.68 1.66-2.78 1.66h-1.68c-1.1 0-1.61-.43-1.61-1.37V12.5s1.68 0 2.23.05c.86.07 1.05.48 1.15 1.03l.16.93h1V9.6h-1l-.16.9c-.1.56-.29.97-1.15 1.03-.55.05-2.23.05-2.23.05Z" />
              </svg>
              Shelzy&apos;s Designs on Etsy
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-sm">
          <p>&copy; 2026 Shelzy&apos;s Designs. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/policies" className="hover:text-white transition">
              Terms
            </Link>
            <span>|</span>
            <Link href="/policies" className="hover:text-white transition">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
