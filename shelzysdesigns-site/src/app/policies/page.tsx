"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const tabs = ["Refund Policy", "Terms of Service", "Privacy Policy"] as const;

type Tab = (typeof tabs)[number];

const content: Record<Tab, string[]> = {
  "Refund Policy": [
    "Custom Water Bottles: Because every bottle is personalized to your specifications, we cannot accept returns or issue refunds for buyer's remorse. If your bottle arrives damaged or the personalization is incorrect, contact us within 7 days of delivery and we will replace it at no charge. Photos of the issue are required.",
    "Digital Templates: All sales of digital products are final once the file has been downloaded. Because our products are delivered instantly and digitally, we are unable to accept returns or issue refunds after download.",
    "If you experience a technical issue with a digital file -- it won't open, the download link is broken, or the content is incorrect -- contact us within 7 days of purchase at shelzysdesigns@outlook.com. We will provide a replacement file or store credit at our discretion.",
    "We do not offer refunds for digital products due to a change of mind, accidental purchase, or incompatibility with software you do not have. Please check the compatibility information listed on each product page before purchasing.",
    "For orders placed on Etsy, Etsy's buyer protection policy also applies.",
  ],
  "Terms of Service": [
    "By purchasing from Shelzy's Designs, you agree to the following terms. All products sold are digital downloads intended for personal use only.",
    "You may not redistribute, resell, share, or sublicense any purchased files. You may share a template with members of the same household or event (for example, sharing a wedding planner with your planning committee) but may not distribute it publicly or commercially.",
    "Commercial use, including using our templates to create products you sell to others, requires a separate commercial license. Contact us to discuss licensing options.",
    "We reserve the right to update these terms at any time. Continued use of our products constitutes acceptance of the current terms.",
    "These terms are governed by the laws of the State of New York.",
  ],
  "Privacy Policy": [
    "Shelzy's Designs collects only the information necessary to process your order and provide customer support. This includes your email address and payment information, which is processed securely through our payment processor.",
    "We do not sell, trade, or share your personal information with third parties for marketing purposes.",
    "We may use your email address to send order confirmations, download links, and occasional updates about new products. You may unsubscribe from marketing emails at any time.",
    "Our website uses standard analytics tools to understand traffic patterns and improve site performance. This data is aggregated and does not identify individual users.",
    "If you have questions about your data or wish to request deletion, contact us at shelzysdesigns@outlook.com.",
  ],
};

export default function PoliciesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Refund Policy");

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto py-16 px-6">
          <h1 className="text-4xl font-bold font-heading mb-10">Policies</h1>

          {/* Tab bar */}
          <div className="flex border-b border-mid-gray mb-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 mr-6 text-sm font-heading font-semibold uppercase tracking-wide transition ${
                  activeTab === tab
                    ? "text-pink border-b-2 border-pink"
                    : "text-text-light hover:text-charcoal"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="space-y-4 text-base leading-relaxed text-charcoal">
            {content[activeTab].map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
