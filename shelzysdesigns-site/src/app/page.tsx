import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import TrustBadges from "@/components/TrustBadges";
import { getBestSellers } from "@/data/products";
import EmailCapture from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "Shelzy's Designs | Personalized Gifts, Planners & Printables",
  description:
    "Personalized water bottles, digital planners, and printable gifts made for real life. 500+ five-star reviews. Free personalization. Instant downloads.",
  openGraph: {
    title: "Shelzy's Designs | Personalized Gifts, Planners & Printables",
    description:
      "Personalized water bottles, digital planners, and printable gifts made for real life. 500+ five-star reviews.",
    type: "website",
    siteName: "Shelzy's Designs",
  },
};

const occasions = [
  { label: "For Mom", emoji: "🌸", href: "/gifts-for/mom", tint: "#FDE8EF", accent: "var(--color-pink)" },
  { label: "For Dad", emoji: "🎣", href: "/gifts-for/dad", tint: "#E4F3FB", accent: "var(--color-blue)" },
  { label: "Graduation", emoji: "🎓", href: "/occasion/graduation", tint: "#FEF0E4", accent: "var(--color-orange)" },
  { label: "Wedding", emoji: "💍", href: "/collections/wedding", tint: "#E4F8F8", accent: "var(--color-teal)" },
  { label: "Birthday", emoji: "🎂", href: "/occasion/birthday", tint: "#FDE8EF", accent: "var(--color-pink)" },
  { label: "Just Because", emoji: "✨", href: "/collections/best-sellers", tint: "#F5F3F0", accent: "var(--color-charcoal)" },
];

const reviews: { quote: string; name: string; product: string }[] = [
  {
    quote:
      "I bought 14 water bottles for my Love Island themed Bach trip and they looked AMAZING!!! Exactly as pictured and all my friends are obsessed with them!",
    name: "Zobia",
    product: "Personalized Water Bottle",
  },
  {
    quote:
      "Customer service is superb. I asked how I could customise the ADHD planner and Shelzy was incredibly helpful. Would definitely recommend — absolutely top notch.",
    name: "Yvonne",
    product: "ADHD Life Dashboard",
  },
  {
    quote:
      "The seller was so easy to work with and made sure that these arrived on time for my wedding. I would recommend this shop to anyone!",
    name: "Courtney",
    product: "Wedding Order",
  },
];

export default function Home() {
  const bestSellers = getBestSellers().slice(0, 6);

  return (
    <>
      <Header />
      <main className="flex-1">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{
            background: "var(--color-charcoal)",
            paddingTop: "clamp(72px, 9vw, 120px)",
            paddingBottom: "clamp(72px, 9vw, 120px)",
          }}
        >
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(251,88,135,0.12) 0%, transparent 70%)" }}
          />

          <div className="relative mx-auto max-w-[1200px] px-6 grid grid-cols-1 md:grid-cols-[1fr_420px] gap-12 md:gap-16 items-center">
            <div>
              {/* Trust eyebrow with stars */}
              <div className="flex items-center gap-2 mb-6 animate-fade-in">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-orange)" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-white/60">
                  4.9 · 500+ reviews on Etsy
                </span>
              </div>

              {/* Headline — specific, 5-second clarity */}
              <h1
                className="font-display font-extrabold text-white leading-[1.02] mb-6 animate-slide-up delay-100"
                style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)" }}
              >
                Personalized gifts, planners &amp; printables{" "}
                <span className="text-pink hand-underline">made for real life.</span>
              </h1>

              <p
                className="leading-relaxed mb-8 max-w-[480px] animate-slide-up delay-200"
                style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem" }}
              >
                Custom water bottles you&apos;ll use forever, plus instant-download
                templates for budgeting, weddings, and everything between.
                Free personalization on every bottle.
              </p>

              {/* CTAs — one primary, one secondary to quiz */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10 animate-slide-up delay-300">
                <Link
                  href="/collections/best-sellers"
                  className="inline-flex items-center justify-center px-8 py-4 bg-pink hover:bg-pink-hover text-white font-heading font-bold text-sm tracking-wide transition-colors rounded-full"
                >
                  Shop Best Sellers →
                </Link>
                <Link
                  href="/gift-finder"
                  className="inline-flex items-center justify-center px-8 py-4 font-heading font-semibold text-sm tracking-wide transition-all rounded-full border-[1.5px] border-white/25 text-white/80 hover:border-white/60 hover:text-white"
                >
                  Find the Right Gift
                </Link>
              </div>

              {/* Hero capture — specific hook */}
              <div className="animate-slide-up delay-400">
                <p className="font-heading text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Free printable gift-tag pack + 10% off
                </p>
                <EmailCapture source="homepage_hero" />
              </div>
            </div>

            {/* Right — product grid */}
            <div className="relative grid grid-cols-2 gap-3 max-w-sm mx-auto md:mx-0 md:ml-auto">
              {[
                { href: "/products/personalized-water-bottle", src: "/product_images/personalized-water-bottle.jpg", alt: "Personalized Water Bottle", delay: "delay-100", nudge: "" },
                { href: "/products/wedding-water-bottle-set", src: "/product_images/wedding-water-bottle-set.jpg", alt: "Wedding Water Bottle Set", delay: "delay-200", nudge: "mt-6" },
                { href: "/products/monthly-budget-tracker", src: "/product_images/monthly-budget-tracker.jpg", alt: "Monthly Budget Tracker", delay: "delay-300", nudge: "-mt-6" },
                { href: "/products/coastal-bridal-shower-games", src: "/product_images/coastal-bridal-shower-games.jpg", alt: "Coastal Bridal Shower Games", delay: "delay-400", nudge: "" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`aspect-square overflow-hidden rounded-2xl bg-white group animate-scale-in ${item.delay} ${item.nudge} transition-transform duration-300 hover:-translate-y-1`}
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={400}
                    height={400}
                    priority
                    sizes="(max-width: 768px) 45vw, 195px"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                </Link>
              ))}

              <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap hidden md:flex items-center gap-2 rounded-full px-4 py-2 animate-fade-in delay-500"
                style={{ background: "var(--color-pink)", boxShadow: "0 4px 16px rgba(251,88,135,0.5)" }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="white" aria-hidden="true"><circle cx="5" cy="5" r="5"/></svg>
                <span className="text-white font-heading font-bold text-[9px] tracking-widest uppercase">
                  Free personalization included
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── BEST SELLERS — first thing under hero ─────────────── */}
        <section className="py-20 sm:py-24" style={{ background: "var(--color-cream)" }}>
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink mb-2 block">
                  Customer favorites
                </span>
                <h2
                  className="font-heading font-extrabold text-charcoal"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", letterSpacing: "-0.025em" }}
                >
                  Best Sellers
                </h2>
              </div>
              <Link
                href="/shop"
                className="font-heading font-bold text-[10px] tracking-widest uppercase text-pink hover:text-pink-hover transition-colors"
              >
                View all products →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* ── SHOP BY OCCASION — gift discovery ─────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="text-center mb-12">
              <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink mb-3 block">
                Shop by occasion
              </span>
              <h2
                className="font-heading font-extrabold text-charcoal mb-3"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", letterSpacing: "-0.025em" }}
              >
                Find the perfect gift
              </h2>
              <p className="text-text-light text-sm max-w-md mx-auto">
                Not sure what to get? Start with who it&apos;s for and we&apos;ll
                handle the rest.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {occasions.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5"
                  style={{
                    background: item.tint,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <span className="text-3xl mb-3" aria-hidden="true">{item.emoji}</span>
                  <span
                    className="font-heading font-bold text-sm text-charcoal transition-colors"
                    style={{ color: item.accent }}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/gift-finder"
                className="inline-flex items-center gap-2 font-heading font-bold text-sm text-charcoal underline-offset-4 hover:text-pink transition-colors"
                style={{ textDecoration: "underline" }}
              >
                Or try our 60-second gift finder →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOUNDER + EMAIL — trust through story ──────────────── */}
        <section className="py-20 sm:py-24" style={{ background: "var(--color-light-gray)" }}>
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div>
                <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink mb-4 block">
                  Designed by Shelzy
                </span>
                <h2
                  className="font-heading font-extrabold text-charcoal mb-5 leading-tight"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}
                >
                  Templates and gifts<br />made by someone<br />who actually uses them
                </h2>
                <p className="text-text-light leading-relaxed mb-4 max-w-[460px]">
                  Shelzy&apos;s Designs started with a simple frustration: templates
                  online either didn&apos;t exist for what I needed, or weren&apos;t
                  made well enough to matter.
                </p>
                <p className="text-text-light leading-relaxed mb-8 max-w-[460px]">
                  Every planner, tracker, and gift here is built from real use —
                  no fluff, no broken formulas, no peeling prints.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-charcoal hover:bg-black text-white font-heading font-bold text-sm px-8 py-4 rounded-full transition-colors"
                >
                  Meet Shelzy →
                </Link>
              </div>

              <div className="bg-white rounded-3xl p-8 sm:p-10" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.08)" }}>
                <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink mb-3 block">
                  Free Gift + 10% off
                </span>
                <h3 className="font-heading font-extrabold text-charcoal text-xl mb-2 leading-tight">
                  Get the free printable gift-tag pack
                </h3>
                <p className="text-text-light text-sm mb-7">
                  Plus 10% off your first order and new templates twice a month.
                </p>
                <EmailCapture source="homepage_founder" />
              </div>
            </div>
          </div>
        </section>

        {/* ── REVIEWS ──────────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="text-center mb-12">
              <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink mb-3 block">
                500+ five-star reviews
              </span>
              <h2
                className="font-heading font-extrabold text-charcoal mb-2"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", letterSpacing: "-0.025em" }}
              >
                Loved by customers
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <div
                  key={review.name}
                  className="rounded-2xl p-8 flex flex-col"
                  style={{
                    background: i === 1 ? "var(--color-charcoal)" : "var(--color-cream)",
                    boxShadow: i === 1 ? "0 8px 32px rgba(45,45,45,0.2)" : "none",
                  }}
                >
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-orange)" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p
                    className="flex-1 text-sm leading-relaxed mb-6"
                    style={{ color: i === 1 ? "rgba(255,255,255,0.75)" : "var(--color-text-light)" }}
                  >
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <div>
                    <p
                      className="font-heading font-bold text-sm"
                      style={{ color: i === 1 ? "white" : "var(--color-charcoal)" }}
                    >
                      {review.name}
                    </p>
                    <p
                      className="font-heading text-[10px] tracking-wide mt-0.5"
                      style={{ color: i === 1 ? "rgba(255,255,255,0.4)" : "var(--color-text-light)" }}
                    >
                      {review.product} · via Etsy
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST BADGES ─────────────────────────────────────── */}
        <section className="bg-white border-t border-mid-gray py-8">
          <div className="mx-auto max-w-[1200px] px-6">
            <TrustBadges />
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
