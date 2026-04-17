import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewStars from "@/components/ReviewStars";

export const metadata: Metadata = {
  title: "About | Shelzy's Designs",
  description:
    "Meet Michelle, the designer behind Shelzy's Designs — personalized water bottles and digital planners made for real life. 500+ five-star reviews on Etsy.",
  openGraph: {
    title: "About | Shelzy's Designs",
    description:
      "Meet Michelle, the designer behind Shelzy's Designs — personalized water bottles and digital planners made for real life.",
    type: "website",
    siteName: "Shelzy's Designs",
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section
          className="py-20 sm:py-28"
          style={{ background: "var(--color-charcoal)" }}
        >
          <div className="mx-auto max-w-[1000px] px-6 text-center">
            <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink mb-5 block">
              Designed by Shelzy
            </span>
            <h1
              className="font-display font-extrabold text-white leading-[1.05] mb-6"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
            >
              Real tools for<br />
              <span className="text-pink hand-underline">real life.</span>
            </h1>
            <p className="text-white/70 leading-relaxed max-w-[560px] mx-auto">
              Shelzy&apos;s Designs started with a simple frustration — and a
              stubborn refusal to settle for templates that looked pretty but
              didn&apos;t actually do anything.
            </p>
            <div className="flex items-center justify-center gap-3 mt-8">
              <ReviewStars size="md" showCount={false} className="text-white" />
              <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-white/60">
                4.9 · 500+ reviews on Etsy
              </span>
            </div>
          </div>
        </section>

        {/* ── Story ─────────────────────────────────────────────── */}
        <section className="py-20" style={{ background: "var(--color-cream)" }}>
          <div className="mx-auto max-w-[720px] px-6">
            <div className="space-y-6 text-lg leading-relaxed text-charcoal">
              <p>
                I&apos;m Michelle. I started Shelzy&apos;s Designs because I
                kept running into the same problem: the things I wanted either
                didn&apos;t exist or weren&apos;t made well enough.
              </p>

              <p>
                The water bottles came first. I wanted something I could
                actually give as a gift — personalized, quality, not the kind
                that fades after two washes. So I started making them.
                Permanent sublimation printing, real stainless steel, names and
                designs that hold up. Every bottle ships with free
                personalization because that&apos;s the whole point.
              </p>

              <p>
                The templates came from the same place. I was tired of
                downloading &ldquo;planners&rdquo; that looked nice but
                didn&apos;t actually do anything. No formulas. No automation.
                Just empty cells with pretty fonts.
              </p>

              <p>
                So I built what I actually wanted: spreadsheets with real
                formulas, smart dashboards, and layouts that make sense the
                second you open them. Every template in this shop is something
                I&apos;ve used, tested, and refined — from budgets that
                auto-calculate to wedding planners that keep every vendor,
                guest, and deadline in one place.
              </p>

              <p>
                Whether you&apos;re looking for a personalized gift, organizing
                your finances, or planning the biggest day of your life,
                there&apos;s a Shelzy&apos;s Designs product for that.
              </p>
            </div>
          </div>
        </section>

        {/* ── Values / What makes us different ─────────────────── */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-[1100px] px-6">
            <div className="text-center mb-14">
              <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink mb-3 block">
                Why Shelzy&apos;s
              </span>
              <h2
                className="font-heading font-extrabold text-charcoal mb-3"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", letterSpacing: "-0.025em" }}
              >
                What makes this shop different
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Built from real use",
                  body:
                    "Every template started as a tool I needed myself. If it doesn't survive my own life, it doesn't make it to the shop.",
                },
                {
                  title: "No peeling, ever",
                  body:
                    "Water bottles use permanent sublimation printing on stainless steel — dishwasher safe, years of use, no fading.",
                },
                {
                  title: "You get me, not a bot",
                  body:
                    "Every customer message reaches me. I help with customization, file formats, and answers within the day.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl p-7"
                  style={{ background: "var(--color-cream)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                >
                  <h3 className="font-heading font-bold text-charcoal text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-text-light text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="py-20 bg-pink">
          <div className="mx-auto max-w-[720px] px-6 text-center">
            <h2
              className="font-heading font-extrabold text-white leading-tight mb-5"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", letterSpacing: "-0.025em" }}
            >
              Find something made<br />for your life
            </h2>
            <p className="text-white/75 mb-8">
              Browse the shop or take the 60-second gift finder.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-white/90 text-pink font-heading font-bold text-sm tracking-wide transition-colors rounded-full"
              >
                Browse the Shop
              </Link>
              <Link
                href="/gift-finder"
                className="inline-flex items-center justify-center px-8 py-4 border-[1.5px] border-white/40 hover:border-white text-white font-heading font-semibold text-sm tracking-wide transition-all rounded-full"
              >
                Find the Right Gift
              </Link>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 text-xs text-white/60 justify-center">
              <a
                href="https://instagram.com/shelzysdesigns"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Instagram @shelzysdesigns
              </a>
              <a
                href="https://pinterest.com/shelzysdesigns"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Pinterest @shelzysdesigns
              </a>
              <a
                href="https://www.etsy.com/shop/ShelzysDesignsStore"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Etsy @ShelzysDesignsStore
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
