import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About | Shelzy's Designs",
  description:
    "Meet the designer behind the spreadsheets. Templates with real formulas, smart dashboards, and layouts that work.",
  openGraph: {
    title: "About | Shelzy's Designs",
    description:
      "Meet the designer behind the spreadsheets. Templates with real formulas, smart dashboards, and layouts that work.",
    type: "website",
    siteName: "Shelzy's Designs",
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto py-16 px-6">
          <h1 className="text-4xl font-bold font-heading mb-8">
            Meet the Designer Behind the Spreadsheets
          </h1>

          <div className="space-y-6 text-lg leading-relaxed text-charcoal">
            <p>
              I&apos;m Michelle, and I believe the right template can change
              your week.
            </p>

            <p>
              I started Shelzy&apos;s Designs because I was tired of downloading
              &ldquo;planners&rdquo; that looked pretty but didn&apos;t actually
              do anything. No formulas. No automation. Just empty cells with
              nice fonts.
            </p>

            <p>
              So I built what I actually wanted: spreadsheets with real formulas,
              smart dashboards, and layouts that make sense the second you open
              them.
            </p>

            <p>
              Every template in this shop is something I&apos;ve used, tested,
              and refined. From budgets that auto-calculate to wedding planners
              that keep every vendor, guest, and deadline in one place.
            </p>

            <p>
              Whether you&apos;re organizing your finances, launching a side
              hustle, or planning the biggest day of your life, there&apos;s a
              Shelzy&apos;s Designs template for that.
            </p>
          </div>

          <div className="mt-10">
            <Link
              href="/shop"
              className="inline-block bg-pink hover:bg-pink-hover text-white font-heading font-semibold text-sm uppercase tracking-wide px-8 py-3 rounded-lg transition"
            >
              Browse the Shop
            </Link>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 text-sm text-text-light">
            <a
              href="https://instagram.com/shelzysdesigns"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink transition"
            >
              Instagram @shelzysdesigns
            </a>
            <a
              href="https://pinterest.com/shelzysdesigns"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink transition"
            >
              Pinterest @shelzysdesigns
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
