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
    <footer className="bg-charcoal text-white">
      <div className="mx-auto max-w-[1200px] px-6 pt-16 pb-10">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-pink flex items-center justify-center flex-shrink-0">
                <span className="font-heading font-bold text-white text-xs tracking-tight">SD</span>
              </div>
              <span className="font-heading font-bold text-white text-sm">Shelzy&apos;s Designs</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed font-body">
              Personal gifts. Practical tools.<br />
              Designed for real life.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="font-heading font-semibold text-[10px] tracking-widest uppercase text-white/30 mb-5">
              Shop
            </p>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/55 hover:text-white transition-colors font-body">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="font-heading font-semibold text-[10px] tracking-widest uppercase text-white/30 mb-5">
              Help
            </p>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/55 hover:text-white transition-colors font-body">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="font-heading font-semibold text-[10px] tracking-widest uppercase text-white/30 mb-5">
              Connect
            </p>
            <ul className="space-y-3 mb-7">
              {[
                { label: "Instagram", href: "https://instagram.com/shelzysdesigns" },
                { label: "Pinterest", href: "https://pinterest.com/shelzysdesigns" },
              ].map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-white/55 hover:text-white transition-colors font-body">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="https://www.etsy.com/shop/ShelzysDesignsStore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-heading font-semibold text-white/60 hover:text-white border border-white/15 hover:border-white/40 px-3 py-1.5 transition-all tracking-wide"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9.16 5.36c0-.15.02-.22.34-.22h5.48c.96 0 1.48.81 1.87 2.36l.31 1.22h.93c.16-2.95.29-4.24.29-4.24s-1.99.22-3.16.22H8.03l-2.52-.08v.98l.85.15c.6.1.74.22.79.77 0 0 .05 1.62.05 4.29 0 2.66-.05 4.26-.05 4.26-.05.5-.19.68-.79.78l-.85.16v.98l2.52-.08h4.4c1.17 0 3.9.08 3.9.08.07-.73.46-4.02.52-4.38h-.87l-.88 1.97c-.68 1.53-1.68 1.66-2.78 1.66h-1.68c-1.1 0-1.61-.43-1.61-1.37V12.5s1.68 0 2.23.05c.86.07 1.05.48 1.15 1.03l.16.93h1V9.6h-1l-.16.9c-.1.56-.29.97-1.15 1.03-.55.05-2.23.05-2.23.05Z" />
              </svg>
              Find us on Etsy
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/30 text-xs font-heading">
          <p>&copy; 2026 Shelzy&apos;s Designs</p>
          <div className="flex gap-6">
            <Link href="/policies" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/policies" className="hover:text-white/60 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
