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
    sub: "Premium stainless steel. Permanent sublimation. Free personalization.",
    bg: "#FDE8EF",
    accent: "var(--color-pink)",
    num: "01",
  },
  {
    name: "Budget + Finance",
    href: "/collections/budget-finance",
    sub: "Take control of your money with trackers, planners, and savings tools.",
    bg: "#E8F4FB",
    accent: "var(--color-blue)",
    num: "02",
  },
  {
    name: "Wedding Planning",
    href: "/collections/wedding",
    sub: "Plan every detail — from guest lists to seating charts.",
    bg: "#EDF8F8",
    accent: "var(--color-teal)",
    num: "03",
  },
  {
    name: "Business Tools",
    href: "/collections/business",
    sub: "Run your side hustle with clean, professional templates.",
    bg: "#FEF2E8",
    accent: "var(--color-orange)",
    num: "04",
  },
];

const bottleSteps = [
  { num: "01", title: "Choose Your Bottle", desc: "Pick your size, color, and style. All bottles are premium stainless steel." },
  { num: "02", title: "Add Personalization", desc: "Enter a name, phrase, or date. We print it permanently — no peeling, ever." },
  { num: "03", title: "Delivered in Days", desc: "Ships in 3–5 business days. Perfect for gifts, events, and everyday use." },
];

const templateSteps = [
  { num: "01", title: "Choose Your Template", desc: "Browse our collection and pick the template that fits your needs." },
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

const occasions = [
  { label: "Birthdays 🎂", href: "/collections/gifts-for-her" },
  { label: "Weddings 💍", href: "/collections/wedding" },
  { label: "Graduation 🎓", href: "/collections/water-bottles" },
  { label: "Just Because 🌸", href: "/collections/best-sellers" },
];

export default function Home() {
  const bestSellers = getBestSellers();

  return (
    <>
      <Header />
      <main className="flex-1">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{
            background: "var(--color-cream)",
            paddingTop: "clamp(56px, 7vw, 100px)",
            paddingBottom: "clamp(56px, 7vw, 100px)",
          }}
        >
          <div className="mx-auto max-w-[1200px] px-6 grid grid-cols-1 md:grid-cols-[1fr_400px] gap-12 md:gap-20 items-center">

            {/* Text */}
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-5 animate-fade-in">
                <span className="inline-block w-8 h-px bg-pink" />
                <span className="font-heading text-[10px] font-semibold tracking-[0.2em] uppercase text-pink">
                  500+ five-star Etsy reviews
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-heading font-extrabold text-charcoal leading-[1.05] mb-5 animate-slide-up delay-100"
                style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.25rem)", letterSpacing: "-0.025em" }}
              >
                Personal gifts.<br />
                <span className="text-pink">Practical</span> tools.
              </h1>

              {/* Body */}
              <p
                className="text-text-light leading-relaxed mb-8 max-w-[480px] animate-slide-up delay-200"
                style={{ fontSize: "1.0625rem" }}
              >
                Custom water bottles with permanent sublimation printing, plus
                instant-download templates for budgeting, wedding planning, and
                everything in between. Free personalization on every bottle.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10 animate-slide-up delay-300">
                <Link
                  href="/collections/water-bottles"
                  className="inline-flex items-center justify-center px-7 py-3.5 bg-pink hover:bg-pink-hover text-white font-heading font-semibold text-sm transition-colors"
                >
                  Shop Custom Bottles →
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-7 py-3.5 border border-mid-gray hover:border-charcoal text-charcoal font-heading font-semibold text-sm transition-colors"
                >
                  Browse Templates
                </Link>
              </div>

              {/* Email */}
              <div className="animate-slide-up delay-400">
                <p className="font-heading text-[10px] font-semibold tracking-widest uppercase text-text-light mb-3">
                  Get 15% off your first order
                </p>
                <EmailCapture />
              </div>
            </div>

            {/* Product image grid */}
            <div className="relative grid grid-cols-2 gap-3 max-w-sm mx-auto md:mx-0 md:ml-auto">
              {[
                { href: "/products/personalized-water-bottle", src: "/product_images/personalized-water-bottle.jpg", alt: "Personalized Water Bottle", delay: "delay-100", nudge: "" },
                { href: "/products/wedding-water-bottle-set", src: "/product_images/wedding-water-bottle-set.jpg", alt: "Wedding Water Bottle Set", delay: "delay-200", nudge: "mt-5" },
                { href: "/products/monthly-budget-tracker", src: "/product_images/monthly-budget-tracker.jpg", alt: "Monthly Budget Tracker", delay: "delay-300", nudge: "-mt-5" },
                { href: "/products/coastal-bridal-shower-games", src: "/product_images/coastal-bridal-shower-games.jpg", alt: "Coastal Bridal Shower Games", delay: "delay-400", nudge: "" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`aspect-square overflow-hidden group border border-mid-gray hover:border-pink bg-white transition-all animate-scale-in ${item.delay} ${item.nudge}`}
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

              {/* Free personalization badge */}
              <div
                className="absolute -bottom-3 -right-2 hidden md:block animate-fade-in delay-500"
                style={{
                  background: "var(--color-pink)",
                  color: "white",
                  fontFamily: "var(--font-heading)",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  padding: "6px 10px",
                }}
              >
                ✓ Free personalization
              </div>
            </div>
          </div>
        </section>

        {/* ── COLLECTIONS ──────────────────────────────────── */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="font-heading font-bold text-charcoal" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}>
                Shop by Category
              </h2>
              <span className="font-heading text-[10px] font-semibold tracking-widest uppercase text-text-light">
                4 Collections
              </span>
            </div>

            {/* 4-column grid with thin dividers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-mid-gray">
              {collections.map((col) => (
                <Link
                  key={col.href}
                  href={col.href}
                  className="group flex flex-col justify-between p-7 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
                  style={{ background: col.bg, minHeight: "230px" }}
                >
                  {/* Large number */}
                  <span
                    className="font-heading font-extrabold leading-none opacity-15 group-hover:opacity-10 transition-opacity"
                    style={{ fontSize: "3.5rem", color: "var(--color-charcoal)" }}
                  >
                    {col.num}
                  </span>

                  {/* Content */}
                  <div>
                    <h3
                      className="font-heading font-bold text-charcoal mb-2 leading-snug group-hover:text-pink transition-colors"
                      style={{ fontSize: "0.9375rem" }}
                    >
                      {col.name}
                    </h3>
                    <p className="text-text-light text-xs leading-relaxed mb-4">{col.sub}</p>
                    <span
                      className="inline-block font-heading text-[9px] font-bold tracking-widest uppercase transition-colors"
                      style={{ color: col.accent }}
                    >
                      Explore →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────── */}
        <section className="py-16 sm:py-20" style={{ background: "var(--color-light-gray)" }}>
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="text-center mb-14">
              <h2
                className="font-heading font-bold text-charcoal mb-3"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}
              >
                Two ways to shop
              </h2>
              <p className="font-heading text-[10px] font-semibold tracking-widest uppercase text-text-light">
                Both ridiculously easy
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Bottles */}
              <div>
                <div className="flex items-center gap-3 mb-8 pb-3 border-b border-mid-gray">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink" />
                  <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink">
                    Custom Water Bottles
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  {bottleSteps.map((step) => (
                    <div key={step.num}>
                      <span
                        className="block font-heading font-extrabold leading-none mb-3"
                        style={{ fontSize: "2.25rem", color: "rgba(251,88,135,0.2)" }}
                      >
                        {step.num}
                      </span>
                      <h3 className="font-heading font-semibold text-charcoal text-sm mb-1.5">{step.title}</h3>
                      <p className="text-xs text-text-light leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Templates */}
              <div>
                <div className="flex items-center gap-3 mb-8 pb-3 border-b border-mid-gray">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                  <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-text-light">
                    Digital Templates
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  {templateSteps.map((step) => (
                    <div key={step.num}>
                      <span
                        className="block font-heading font-extrabold leading-none mb-3"
                        style={{ fontSize: "2.25rem", color: "rgba(138,219,222,0.4)" }}
                      >
                        {step.num}
                      </span>
                      <h3 className="font-heading font-semibold text-charcoal text-sm mb-1.5">{step.title}</h3>
                      <p className="text-xs text-text-light leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BEST SELLERS ─────────────────────────────────── */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="flex items-baseline justify-between mb-8">
              <h2
                className="font-heading font-bold text-charcoal"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}
              >
                Best Sellers
              </h2>
              <Link
                href="/shop"
                className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink hover:text-pink-hover transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x scroll-smooth">
              {bestSellers.map((product) => (
                <div key={product.id} className="min-w-[220px] max-w-[220px] flex-shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GIFT OCCASIONS ────────────────────────────────── */}
        <section className="py-16 sm:py-20" style={{ background: "#FEF0F4" }}>
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Text */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-block w-6 h-px bg-pink" />
                  <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink">
                    Personalized gifts
                  </span>
                </div>
                <h2
                  className="font-heading font-bold text-charcoal mb-5 leading-tight"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", letterSpacing: "-0.02em" }}
                >
                  A gift they&apos;ll<br />actually use
                </h2>
                <p className="text-text-light leading-relaxed mb-8 max-w-[420px]">
                  A custom water bottle with their name, a date, or whatever makes it
                  theirs — permanently printed, never peeling.
                </p>
                <Link
                  href="/collections/water-bottles"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-pink hover:bg-pink-hover text-white font-heading font-semibold text-sm transition-colors"
                >
                  Shop Custom Bottles →
                </Link>
              </div>

              {/* Occasion tiles */}
              <div className="grid grid-cols-2 gap-3">
                {occasions.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group bg-white border border-mid-gray hover:border-pink hover:shadow-sm p-5 flex items-center justify-between transition-all"
                  >
                    <span className="font-heading font-semibold text-sm text-charcoal group-hover:text-pink transition-colors">
                      {item.label}
                    </span>
                    <span className="text-text-light group-hover:text-pink text-sm transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── REVIEWS ──────────────────────────────────────── */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="flex items-baseline gap-4 mb-12">
              <h2
                className="font-heading font-bold text-charcoal"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}
              >
                What customers say
              </h2>
              <span className="font-heading text-[10px] font-semibold tracking-widest uppercase text-text-light">
                via Etsy
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-mid-gray">
              {reviews.map((review, i) => (
                <div
                  key={review.name}
                  className="p-8 flex flex-col"
                  style={{ background: i === 1 ? "var(--color-light-gray)" : "white" }}
                >
                  {/* Oversized quote mark */}
                  <span
                    className="block font-heading font-extrabold leading-none mb-3 text-pink opacity-20"
                    style={{ fontSize: "4rem" }}
                  >
                    &ldquo;
                  </span>
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="12" height="12" viewBox="0 0 24 24" fill="var(--color-orange)" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="flex-1 text-sm text-charcoal leading-relaxed mb-6">{review.quote}</p>
                  <div>
                    <p className="font-heading font-semibold text-sm text-charcoal">{review.name}</p>
                    <p className="font-heading text-[10px] tracking-wide text-text-light mt-0.5">{review.product}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BRAND STORY + EMAIL ───────────────────────────── */}
        <section className="bg-charcoal py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
              {/* Story */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="inline-block w-6 h-px bg-pink" />
                  <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink">
                    Our story
                  </span>
                </div>
                <h2
                  className="font-heading font-bold text-white mb-5 leading-tight"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", letterSpacing: "-0.02em" }}
                >
                  Designed for<br />real life
                </h2>
                <p className="text-white/55 leading-relaxed mb-8">
                  Shelzy&apos;s Designs started with a simple idea: templates should
                  be beautiful and actually useful. Every spreadsheet, planner, and
                  tracker is built from personal experience — designed to save you
                  time, not add to your to-do list.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border border-white/20 hover:border-white/50 text-white font-heading font-semibold text-sm px-7 py-3.5 transition-colors"
                >
                  Meet the designer →
                </Link>
              </div>

              {/* Email capture card */}
              <div className="bg-white/5 border border-white/10 p-8">
                <h3 className="font-heading font-bold text-white text-xl mb-2">
                  Get 15% off your first order
                </h3>
                <p className="text-white/50 text-sm mb-7">
                  Plus new templates and planning tips — twice a month.
                </p>
                <EmailCapture />
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST BADGES ─────────────────────────────────── */}
        <section className="bg-white border-t border-mid-gray py-7">
          <div className="mx-auto max-w-[1200px] px-6">
            <TrustBadges />
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
