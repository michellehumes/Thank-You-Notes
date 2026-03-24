import Link from "next/link";

const shopLinks = [
  { label: "Shop All", href: "/shop" },
  { label: "Templates", href: "/collections/templates" },
  { label: "Planners", href: "/collections/planners" },
  { label: "Wedding", href: "/collections/wedding" },
  { label: "Bundles", href: "/collections/bundles" },
];

const helpLinks = [
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
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
              Templates that actually work.
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
            <ul className="space-y-2">
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
