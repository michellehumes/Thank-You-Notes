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
  title: "Shelzy's Designs | Personalized Water Bottles and Digital Templates",
  description:
    "Custom personalized water bottles with permanent sublimation printing, plus instant-download digital templates for budgeting, wedding planning, and organizing. Free personalization on every bottle.",
  openGraph: {
    title: "Shelzy's Designs | Personalized Water Bottles and Digital Templates",
    description:
      "Custom personalized water bottles with permanent sublimation printing, plus instant-download digital templates for budgeting, wedding planning, and organizing.",
    type: "website",
    siteName: "Shelzy's Designs",
  },
};

const collections = [
  {
    name: "Personalized Water Bottles",
    href: "/collections/water-bottles",
    sub: "Premium stainless steel. Permanent sublimation. Free personalization on every order.",
    bg: "#FDE8EF",
    dot: "var(--color-pink)",
    num: "01",
  },
  {
    name: "Budget + Finance",
    href: "/collections/budget-finance",
    sub: "Take control of your money with trackers, planners, and savings tools.",
    bg: "#E4F3FB",
    dot: "var(--color-blue)",
    num: "02",
  },
  {
    name: "Wedding Planning",
    href: "/collections/wedding",
    sub: "Plan every detail — from guest lists to seating charts — without the stress.",
    bg: "#E4F8F8",
    dot: "var(--color-teal)",
    num: "03",
  },
  {
    name: "Business Tools",
    href: "/collections/business",
    sub: "Run your side hustle or small business with professional templates.",
    bg: "#FEF0E4",
    dot: "var(--color-orange)",
    num: "04",
  },
];

const bottleSteps = [
  { num: "01", title: "Choose Your Bottle", desc: "Pick your size, color, and style. All bottles are premium stainless steel." },
  { num: "02", title: "Add Personalization", desc: "Enter a name, phrase, or date. We print it permanently — no peeling, ever." },
  { num: "03", title: "Delivered in Days", desc: "Ships in 3–5 business days. Perfect for gifts, events, and everyday use." },
];

const templateSteps = [
  { num: "01", title: "Choose a Template", desc: "Browse our collection and pick the template that fits your needs." },
  { num: "02", title: "Download Instantly", desc: "Get immediate access to your file right after checkout. No waiting." },
  { num: "03", title: "Open and Customize", desc: "Open in Excel or Google Sheets. All formulas included." },
];

const reviews: { quote: string; name: string; product: string }[] = [
  {
    quote: "I bought 14 water bottles for my Love Island themed Bach trip and they looked AMAZING!!! Exactly as pictured and all my friends are obsessed with them!",
    name: "Zobia",
    product: "Personalized Water Bottle",
  },
  {
    quote: "Customer service is superb. I asked how I could customise the ADHD planner and Shelzy was incredibly helpful. Would definitely recommend — absolutely top notch.",
    name: "Yvonne",
    product: "ADHD Life Dashboard",
  },
  {
    quote: "The seller was so easy to work with and made sure that these arrived on time for my wedding. I would recommend this shop to anyone!",
    name: "Courtney",
    product: "Wedding Order",
  },
];

export default function Home() {
  const bestSellers = getBestSellers();

  return (
    <>
      <Header />
      <main className="flex-1">

        {/* ── HERO — dark, dramatic ─────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{
            background: "var(--color-charcoal)",
            paddingTop: "clamp(72px, 9vw, 120px)",
            paddingBottom: "clamp(72px, 9vw, 120px)",
          }}
        >
          {/* Subtle pink glow top-right */}
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(251,88,135,0.12) 0%, transparent 70%)" }}
          />

          <div className="relative mx-auto max-w-[1200px] px-6 grid grid-cols-1 md:grid-cols-[1fr_420px] gap-12 md:gap-16 items-center">
            {/* Left */}
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-6 animate-fade-in">
                <span className="inline-flex items-center gap-1.5 bg-pink/15 text-pink rounded-full px-3 py-1.5 font-heading text-[10px] font-bold tracking-widest uppercase">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="var(--color-pink)" aria-hidden="true">
                    <circle cx="4" cy="4" r="4" />
                  </svg>
                  500+ five-star Etsy reviews
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-heading font-extrabold text-white leading-[1.0] mb-6 animate-slide-up delay-100"
                style={{ fontSize: "clamp(2.75rem, 6vw, 5rem)", letterSpacing: "-0.03em" }}
              >
                Personal gifts.<br />
                <span className="text-pink">Practical</span> tools.
              </h1>

              {/* Body */}
              <p
                className="leading-relaxed mb-8 max-w-[460px] animate-slide-up delay-200"
                style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.0625rem" }}
              >
                Custom water bottles with permanent sublimation printing, plus
                instant-download templates for budgeting, wedding planning, and
                everything in between. Free personalization on every bottle.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10 animate-slide-up delay-300">
                <Link
                  href="/collections/water-bottles"
                  className="inline-flex items-center justify-center px-8 py-4 bg-pink hover:bg-pink-hover text-white font-heading font-bold text-sm tracking-wide transition-colors rounded-full"
                >
                  Shop Custom Bottles →
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-8 py-4 font-heading font-semibold text-sm tracking-wide transition-all rounded-full"
                  style={{ border: "1.5px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.8)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.6)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; }}
                >
                  Browse Templates
                </Link>
              </div>

              {/* Email */}
              <div className="animate-slide-up delay-400">
                <p className="font-heading text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Get 15% off your first order
                </p>
                <EmailCapture />
              </div>
            </div>

            {/* Right — product grid floating on dark */}
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

              {/* Badge */}
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

        {/* ── COLLECTIONS ──────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="text-center mb-12">
              <h2
                className="font-heading font-extrabold text-charcoal mb-3"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", letterSpacing: "-0.025em" }}
              >
                Shop by Category
              </h2>
              <p className="text-text-light text-sm max-w-xs mx-auto">
                Something for every occasion — gifts and tools, all in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {collections.map((col) => (
                <Link
                  key={col.href}
                  href={col.href}
                  className="group flex flex-col rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5"
                  style={{
                    background: col.bg,
                    minHeight: "240px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.1)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)")}
                >
                  {/* Number */}
                  <span
                    className="font-heading font-extrabold leading-none mb-6 opacity-25"
                    style={{ fontSize: "3rem", color: "var(--color-charcoal)" }}
                  >
                    {col.num}
                  </span>

                  <div className="flex-1 flex flex-col justify-end">
                    <h3 className="font-heading font-bold text-charcoal leading-snug mb-2 group-hover:text-pink transition-colors" style={{ fontSize: "0.9375rem" }}>
                      {col.name}
                    </h3>
                    <p className="text-xs text-text-light leading-relaxed mb-5">{col.sub}</p>
                    <span
                      className="inline-flex items-center gap-1.5 font-heading font-bold text-[9px] tracking-widest uppercase transition-colors"
                      style={{ color: col.dot }}
                    >
                      Explore →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <section className="py-20 sm:py-24" style={{ background: "var(--color-charcoal)" }}>
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="text-center mb-16">
              <h2
                className="font-heading font-extrabold text-white mb-3"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", letterSpacing: "-0.025em" }}
              >
                Two ways to shop
              </h2>
              <p className="font-heading text-[10px] font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                Both ridiculously easy
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bottles card */}
              <div className="rounded-2xl p-8 sm:p-10" style={{ background: "rgba(251,88,135,0.1)", border: "1px solid rgba(251,88,135,0.2)" }}>
                <div className="flex items-center gap-2 mb-8">
                  <span className="w-2 h-2 rounded-full bg-pink" />
                  <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink">Custom Water Bottles</span>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  {bottleSteps.map((step) => (
                    <div key={step.num}>
                      <span className="block font-heading font-extrabold leading-none mb-3" style={{ fontSize: "2rem", color: "rgba(251,88,135,0.35)" }}>{step.num}</span>
                      <h3 className="font-heading font-semibold text-white text-sm mb-1.5">{step.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Templates card */}
              <div className="rounded-2xl p-8 sm:p-10" style={{ background: "rgba(138,219,222,0.08)", border: "1px solid rgba(138,219,222,0.2)" }}>
                <div className="flex items-center gap-2 mb-8">
                  <span className="w-2 h-2 rounded-full bg-teal" />
                  <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-teal">Digital Templates</span>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  {templateSteps.map((step) => (
                    <div key={step.num}>
                      <span className="block font-heading font-extrabold leading-none mb-3" style={{ fontSize: "2rem", color: "rgba(138,219,222,0.35)" }}>{step.num}</span>
                      <h3 className="font-heading font-semibold text-white text-sm mb-1.5">{step.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BEST SELLERS ─────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="flex items-center justify-between mb-10">
              <h2
                className="font-heading font-extrabold text-charcoal"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", letterSpacing: "-0.025em" }}
              >
                Best Sellers
              </h2>
              <Link href="/shop" className="font-heading font-bold text-[10px] tracking-widest uppercase text-pink hover:text-pink-hover transition-colors">
                View all →
              </Link>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 snap-x scroll-smooth">
              {bestSellers.map((product) => (
                <div key={product.id} className="min-w-[220px] max-w-[220px] flex-shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GIFT OCCASIONS ────────────────────────────────────── */}
        <section className="py-20 sm:py-24" style={{ background: "var(--color-light-gray)" }}>
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-pink text-white rounded-full px-3 py-1.5 font-heading text-[9px] font-bold tracking-widest uppercase mb-6">
                  ✦ Personalized gifts
                </span>
                <h2
                  className="font-heading font-extrabold text-charcoal mb-5 leading-tight"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}
                >
                  A gift they&apos;ll<br />actually use
                </h2>
                <p className="text-text-light leading-relaxed mb-8 max-w-[400px]">
                  A custom water bottle with their name, a date, or whatever makes
                  it theirs — permanently printed, never peeling.
                </p>
                <Link
                  href="/collections/water-bottles"
                  className="inline-flex items-center gap-2 bg-pink hover:bg-pink-hover text-white font-heading font-bold text-sm px-8 py-4 rounded-full transition-colors"
                >
                  Shop Custom Bottles →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Birthdays", emoji: "🎂", href: "/collections/gifts-for-her" },
                  { label: "Weddings", emoji: "💍", href: "/collections/wedding" },
                  { label: "Graduation", emoji: "🎓", href: "/collections/water-bottles" },
                  { label: "Just Because", emoji: "🌸", href: "/collections/best-sellers" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group bg-white rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)")}
                  >
                    <span className="text-3xl mb-3">{item.emoji}</span>
                    <span className="font-heading font-semibold text-sm text-charcoal group-hover:text-pink transition-colors">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── REVIEWS ──────────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="text-center mb-12">
              <h2
                className="font-heading font-extrabold text-charcoal mb-2"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", letterSpacing: "-0.025em" }}
              >
                Loved by Customers
              </h2>
              <p className="font-heading text-[10px] font-semibold tracking-widest uppercase text-text-light">
                500+ reviews on Etsy
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <div
                  key={review.name}
                  className="rounded-2xl p-8 flex flex-col"
                  style={{
                    background: i === 1 ? "var(--color-charcoal)" : "var(--color-light-gray)",
                    boxShadow: i === 1 ? "0 8px 32px rgba(45,45,45,0.2)" : "none",
                  }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-orange)" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p
                    className="flex-1 text-sm leading-relaxed mb-6"
                    style={{ color: i === 1 ? "rgba(255,255,255,0.7)" : "var(--color-text-light)" }}
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
                      style={{ color: i === 1 ? "rgba(255,255,255,0.35)" : "var(--color-text-light)" }}
                    >
                      {review.product} · via Etsy
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BRAND STORY + EMAIL ───────────────────────────────── */}
        <section className="py-20 sm:py-24 bg-pink">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div>
                <h2
                  className="font-heading font-extrabold text-white leading-tight mb-5"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}
                >
                  Designed for<br />real life
                </h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  Shelzy&apos;s Designs started with a simple idea: templates should
                  be beautiful and actually useful. Every spreadsheet, planner, and
                  tracker is built from personal experience — designed to save you
                  time, not add to your to-do list.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-pink font-heading font-bold text-sm px-8 py-4 rounded-full transition-colors"
                >
                  Meet the designer →
                </Link>
              </div>

              <div className="bg-white rounded-3xl p-8 sm:p-10" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}>
                <h3 className="font-heading font-extrabold text-charcoal text-xl mb-2">
                  Get 15% off your first order
                </h3>
                <p className="text-text-light text-sm mb-7">
                  Plus new templates and planning tips — twice a month.
                </p>
                <EmailCapture />
              </div>
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
