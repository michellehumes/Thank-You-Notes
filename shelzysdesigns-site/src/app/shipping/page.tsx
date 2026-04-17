import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Shipping Policy | Shelzy's Designs",
  description:
    "Shipping timelines for custom water bottles and digital template downloads from Shelzy's Designs.",
  openGraph: {
    title: "Shipping Policy | Shelzy's Designs",
    description:
      "Shipping timelines for custom water bottles and digital template downloads from Shelzy's Designs.",
    type: "website",
    siteName: "Shelzy's Designs",
  },
};

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto py-16 px-6">
          <h1 className="text-4xl font-bold font-heading mb-10">
            Shipping Policy
          </h1>

          <div className="space-y-10 text-base leading-relaxed text-charcoal">

            <div>
              <h2 className="font-heading text-xl font-bold mb-3">Digital Templates</h2>
              <p>
                All digital products are delivered instantly via download link after purchase. No shipping required. You will receive an email with your download link immediately after checkout.
              </p>
              <p className="mt-3">
                If you do not receive your download link within 15 minutes, check your spam folder or contact us at{" "}
                <a href="/contact" className="text-pink hover:underline">our contact page</a>.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold mb-3">Custom Water Bottles</h2>
              <p>
                All water bottle orders are personalized to order. Because each bottle is made specifically for you, we do not ship from stock.
              </p>

              <div className="mt-4 bg-light-gray rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-pink font-heading font-bold text-sm uppercase tracking-wide min-w-[120px]">Production</span>
                  <span>3-5 business days after order confirmation</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-pink font-heading font-bold text-sm uppercase tracking-wide min-w-[120px]">Standard Ship</span>
                  <span>3-7 business days (USPS First Class or Ground)</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-pink font-heading font-bold text-sm uppercase tracking-wide min-w-[120px]">Expedited</span>
                  <span>2-3 business days shipping available at checkout (additional cost)</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-pink font-heading font-bold text-sm uppercase tracking-wide min-w-[120px]">Total Time</span>
                  <span>Allow 6-12 business days from order to delivery (standard)</span>
                </div>
              </div>

              <p className="mt-4 text-text-light text-sm">
                We ship from the United States. International shipping is available on select orders -- contact us before ordering to confirm availability and rates.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold mb-3">Order Confirmation</h2>
              <p>
                For personalized bottles, we will confirm your personalization details before production begins. If anything looks off, we will reach out before we print.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold mb-3">Tracking</h2>
              <p>
                All physical orders include tracking. You will receive a tracking number via Etsy notifications when your order ships.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold mb-3">Questions</h2>
              <p>
                For order status, delivery issues, or rush order requests, visit our{" "}
                <a href="/contact" className="text-pink hover:underline">contact page</a>.
              </p>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
