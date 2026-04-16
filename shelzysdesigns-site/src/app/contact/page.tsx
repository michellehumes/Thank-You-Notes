import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact | Shelzy's Designs",
  description:
    "Get in touch with Shelzy's Designs. Questions about your order, template issues, or bulk requests — we respond within 24 hours.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-2xl mx-auto py-16 px-6">
          <h1 className="text-4xl font-bold font-heading text-charcoal mb-4">
            Contact Us
          </h1>
          <p className="text-text-light text-lg mb-10 leading-relaxed">
            Questions about your order, a template that isn&apos;t working, or a
            bulk request? We respond within 24 hours.
          </p>

          <div className="space-y-6">
            <div className="bg-light-gray rounded-xl p-6">
              <h2 className="font-heading font-semibold text-charcoal mb-1">
                Email
              </h2>
              <a
                href="mailto:hello@shelzysdesigns.com"
                className="text-pink hover:text-pink-hover transition text-sm"
              >
                hello@shelzysdesigns.com
              </a>
              <p className="text-text-light text-sm mt-2">
                Best for order issues, file downloads, and general questions.
              </p>
            </div>

            <div className="bg-light-gray rounded-xl p-6">
              <h2 className="font-heading font-semibold text-charcoal mb-1">
                Etsy Messages
              </h2>
              <a
                href="https://www.etsy.com/shop/ShelzysDesignsStore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink hover:text-pink-hover transition text-sm"
              >
                Shelzy&apos;s Designs on Etsy
              </a>
              <p className="text-text-light text-sm mt-2">
                If you purchased on Etsy, messaging us there keeps everything in
                one place.
              </p>
            </div>

            <div className="bg-light-gray rounded-xl p-6">
              <h2 className="font-heading font-semibold text-charcoal mb-1">
                Bulk and Custom Orders
              </h2>
              <p className="text-text-light text-sm">
                Need 10+ of the same template, a custom design, or a corporate
                license? Email us with your requirements and we&apos;ll get back
                to you with pricing.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-mid-gray">
            <p className="text-text-light text-sm">
              Check our{" "}
              <Link href="/faq" className="text-pink hover:underline">
                FAQ page
              </Link>{" "}
              first — most questions about downloads, file formats, and refunds
              are answered there.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
