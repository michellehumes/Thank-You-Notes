import type { Metadata } from "next";
import Link from "next/link";
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
    sub: "Premium stainless steel bottles with permanent sublimation printing. Free personalization on every order.",
    color: "bg-blue/80",
  },
  {
    name: "Budget + Finance",
    href: "/collections/budget-finance",
    sub: "Take control of your money with trackers, planners, and savings tools.",
    color: "bg-pink/80",
  },
  {
    name: "Wedding Planning",
    href: "/collections/wedding",
    sub: "Plan every detail, from guest lists to seating charts, without the stress.",
    color: "bg-teal/80",
  },
  {
    name: "Business Tools",
    href: "/collections/business",
    sub: "Run your side hustle or small business with clean, professional templates.",
    color: "bg-orange/80",
  },
];

const bottleSteps = [
  {
    num: 1,
    title: "Choose Your Bottle",
    desc: "Pick your size, color, and style. All bottles are premium stainless steel.",
  },
  {
    num: 2,
    title: "Add Personalization",
    desc: "Enter a name, phrase, or date. We print it permanently -- no peeling, ever.",
  },
  {
    num: 3,
    title: "Delivered in Days",
    desc: "Ships in 3-5 business days. Perfect for gifts, events, and everyday use.",
  },
];

const templateSteps = [
  {
    num: 1,
    title: "Choose Your Template",
    desc: "Browse our collection and pick the template that fits your needs.",
  },
  {
    num: 2,
    title: "Download Instantly",
    desc: "Get immediate access to your file right after checkout. No waiting.",
  },
  {
    num: 3,
    title: "Open and Customize",
    desc: "Open in Excel or Google Sheets and make it yours. All formulas included.",
  },
];

// Reviews: replace these placeholders with real verified customer reviews (e.g. from Etsy)
// until real reviews are available, this section should be hidden or replaced with an Etsy shop link
const reviews: { quote: string; name: string; source?: string }[] = [];

export default function Home() {
  const bestSellers = getBestSellers();

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────── */}
        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Text */}
            <div className="text-center md:text-left">
              <p className="text-pink font-heading font-semibold text-sm tracking-wide uppercase mb-3">
                Personalized Water Bottles + Digital Templates
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold text-charcoal leading-tight mb-5">
                Gifts They&apos;ll Love. Tools That Actually Work.
              </h1>
              <p className="text-text-light text-lg mb-8 max-w-lg mx-auto md:mx-0">
                Custom water bottles with permanent sublimation printing, plus
                instant-download templates for budgeting, wedding planning, and
                more. Free personalization on every bottle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/collections/water-bottles"
                  className="inline-block bg-pink hover:bg-pink-hover text-white font-heading font-semibold px-8 py-3.5 rounded-lg transition text-center"
                >
                  Shop Custom Bottles
                </Link>
                <Link
                  href="/shop"
                  className="inline-block border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-heading font-semibold px-8 py-3.5 rounded-lg transition text-center"
                >
                  Browse Templates
                </Link>
              </div>
            </div>

            {/* Decorative grid */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto md:mx-0 md:ml-auto">
              <div className="aspect-[4/5] rounded-2xl bg-pink/15" />
              <div className="aspect-[4/5] rounded-2xl bg-teal/20 translate-y-6" />
              <div className="aspect-[4/5] rounded-2xl bg-orange/15 -translate-y-6" />
              <div className="aspect-[4/5] rounded-2xl bg-blue/10" />
            </div>
          </div>
        </section>

        {/* ── Featured Collections ─────────────── */}
        <section className="py-16">
          <div className="mx-auto max-w-[1200px] px-6">
            <h2 className="font-heading text-3xl font-bold text-charcoal text-center mb-10">
              Featured Collections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {collections.map((col) => (
                <Link
                  key={col.href}
                  href={col.href}
                  className={`${col.color} rounded-2xl p-8 flex flex-col justify-end min-h-[200px] hover:opacity-90 transition`}
                >
                  <h3 className="font-heading text-xl font-bold text-white mb-2">
                    {col.name}
                  </h3>
                  <p className="text-white/80 text-sm">{col.sub}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────── */}
        <section className="bg-charcoal py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-6">
            <h2 className="font-heading text-3xl font-bold text-white text-center mb-4">
              How It Works
            </h2>
            <p className="text-white/60 text-center mb-12 max-w-md mx-auto">
              Two ways to shop. Both ridiculously easy.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Water Bottles Track */}
              <div>
                <p className="text-blue font-heading font-semibold text-sm tracking-wide uppercase text-center mb-8">
                  Custom Water Bottles
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                  {bottleSteps.map((step) => (
                    <div key={step.num} className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-blue text-white flex items-center justify-center font-heading font-bold text-xl mb-4">
                        {step.num}
                      </div>
                      <h3 className="font-heading font-semibold text-base text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-white/70 text-sm">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Templates Track */}
              <div>
                <p className="text-pink font-heading font-semibold text-sm tracking-wide uppercase text-center mb-8">
                  Digital Templates
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                  {templateSteps.map((step) => (
                    <div key={step.num} className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-pink text-white flex items-center justify-center font-heading font-bold text-xl mb-4">
                        {step.num}
                      </div>
                      <h3 className="font-heading font-semibold text-base text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-white/70 text-sm">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Best Sellers ─────────────────────── */}
        <section className="py-16">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-3xl font-bold text-charcoal">
                Best Sellers
              </h2>
              <Link
                href="/shop"
                className="font-heading text-sm font-semibold text-pink hover:text-pink-hover transition"
              >
                View All
              </Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 snap-x">
              {bestSellers.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[240px] max-w-[240px] flex-shrink-0 snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social Proof ─────────────────────── */}
        <section className="bg-light-gray py-16">
          <div className="mx-auto max-w-[1200px] px-6">
            <h2 className="font-heading text-3xl font-bold text-charcoal text-center mb-6">
              Loved by Customers on Etsy
            </h2>
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div
                    key={review.name}
                    className="bg-white rounded-xl p-6 shadow-sm"
                  >
                    <div className="flex gap-1 mb-4 text-orange">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-charcoal text-sm mb-4 leading-relaxed">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                    <p className="font-heading font-semibold text-sm text-charcoal">
                      {review.name}
                      {review.source && (
                        <span className="text-text-light font-normal ml-1">via {review.source}</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-text-light mb-6 max-w-md mx-auto">
                  See what customers are saying about Shelzy&apos;s Designs on our Etsy shop.
                </p>
                <a
                  href="https://www.etsy.com/shop/ShelzysDesigns#reviews"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border-2 border-charcoal text-charcoal font-heading font-semibold px-8 py-3 rounded-lg hover:bg-charcoal hover:text-white transition"
                >
                  Read Our Reviews on Etsy
                </a>
              </div>
            )}
          </div>
        </section>

        {/* ── Email Capture ────────────────────── */}
        <section className="bg-teal/10 py-16">
          <div className="mx-auto max-w-[600px] px-6 text-center">
            <h2 className="font-heading text-3xl font-bold text-charcoal mb-4">
              Get 15% Off Your First Order
            </h2>
            <p className="text-text-light mb-8">
              Sign up for early access to new templates, exclusive discounts, and
              planning tips delivered to your inbox.
            </p>
            <EmailCapture />
          </div>
        </section>

        {/* ── Brand Story ──────────────────────── */}
        <section className="py-16">
          <div className="mx-auto max-w-[700px] px-6 text-center">
            <h2 className="font-heading text-3xl font-bold text-charcoal mb-4">
              Designed for Real Life
            </h2>
            <p className="text-text-light leading-relaxed mb-8">
              Shelzy&apos;s Designs started with a simple idea: templates should
              be beautiful and actually useful. Every spreadsheet, planner, and
              tracker is built from personal experience, tested with real
              workflows, and designed to save you time, not add to your to-do
              list.
            </p>
            <Link
              href="/about"
              className="inline-block border-2 border-charcoal text-charcoal font-heading font-semibold px-8 py-3 rounded-lg hover:bg-charcoal hover:text-white transition"
            >
              Meet the Designer
            </Link>
          </div>
        </section>

        {/* ── Trust Badges ─────────────────────── */}
        <section className="border-t border-mid-gray py-8">
          <div className="mx-auto max-w-[1200px] px-6">
            <TrustBadges />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
