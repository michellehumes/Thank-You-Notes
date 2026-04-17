import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import EmailCapture from "@/components/EmailCapture";
import type { GiftGuide } from "@/lib/giftGuides";
import { listProducts } from "@/lib/giftGuides";

export default function GiftGuidePage({ guide, crumb }: { guide: GiftGuide; crumb: { label: string; href: string } }) {
  const items = listProducts(guide);

  return (
    <>
      <Header />
      <main className="flex-1" style={{ background: "var(--color-cream)" }}>
        {/* Hero / intro */}
        <section className="bg-white border-b border-mid-gray py-12 sm:py-16">
          <div className="mx-auto max-w-[1100px] px-6">
            <nav className="text-xs text-text-light mb-6 font-heading tracking-wide">
              <Link href="/" className="hover:text-charcoal transition">Home</Link>
              <span className="mx-2">/</span>
              <Link href={crumb.href} className="hover:text-charcoal transition">{crumb.label}</Link>
              <span className="mx-2">/</span>
              <span className="text-charcoal">{guide.name}</span>
            </nav>
            <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink mb-3 block">
              {guide.eyebrow}
            </span>
            <h1
              className="font-display font-extrabold text-charcoal mb-5"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              {guide.name}
            </h1>
            <p className="text-charcoal text-base leading-relaxed max-w-[720px] mb-4">
              {guide.shortDescription}
            </p>
            <p className="text-text-light text-sm leading-relaxed max-w-[720px]">
              {guide.intro}
            </p>
            <p className="text-sm text-pink font-heading font-semibold mt-6">
              {items.length} product{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </section>

        {/* Products */}
        <section className="py-14">
          <div className="mx-auto max-w-[1200px] px-6">
            {items.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-text-light mb-6">
                  We don&apos;t have products in this guide yet. Try our gift finder or browse best sellers.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Link
                    href="/gift-finder"
                    className="inline-flex items-center gap-2 bg-pink hover:bg-pink-hover text-white font-heading font-bold text-sm px-6 py-3 rounded-full transition-colors"
                  >
                    Try the Gift Finder →
                  </Link>
                  <Link
                    href="/collections/best-sellers"
                    className="inline-flex items-center gap-2 bg-white border border-mid-gray hover:border-charcoal text-charcoal font-heading font-bold text-sm px-6 py-3 rounded-full transition-colors"
                  >
                    Best Sellers
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Email capture */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-[720px] px-6 text-center">
            <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink mb-3 block">
              Free gift + 10% off
            </span>
            <h2
              className="font-heading font-extrabold text-charcoal mb-3"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.025em" }}
            >
              Get the free printable gift-tag pack
            </h2>
            <p className="text-text-light text-sm mb-6">
              Plus 10% off your first order. Delivered to your inbox in seconds.
            </p>
            <EmailCapture source={`guide_${guide.slug}`} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
