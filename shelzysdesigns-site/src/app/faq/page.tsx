"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const faqs = [
  // ── Water Bottle Questions ────────────────────────────────────────────
  {
    question: "How does the water bottle personalization work?",
    answer:
      "On any water bottle product page, enter the name or text you want, select a font style, and click Order on Etsy. Your personalization details are pre-filled in the message to seller on Etsy. We confirm your order before we print anything.",
  },
  {
    question: "How long does a custom water bottle take?",
    answer:
      "Production takes 3-5 business days after order confirmation. Standard shipping adds 3-7 business days. Expedited options are available at checkout on Etsy.",
  },
  {
    question: "Will the design fade or peel?",
    answer:
      "No. We use permanent sublimation printing -- the design is fused into the coating, not printed on top of it. It will not peel, crack, or fade with normal use.",
  },
  {
    question: "Are the water bottles dishwasher safe?",
    answer:
      "Hand washing is recommended to preserve the design and insulation properties long-term. The bottles are stainless steel and can handle a top-rack dishwasher cycle, but we recommend hand washing for longevity.",
  },
  {
    question: "Can I order water bottles in bulk for an event or team?",
    answer:
      "Yes. Contact us at the link below for bulk pricing on 10 or more bottles. We handle wedding parties, corporate orders, team gifts, and school groups.",
  },
  {
    question: "Can I return a personalized water bottle?",
    answer:
      "Because every bottle is made to order with your custom text, we cannot accept returns for buyer's remorse. If your bottle arrives damaged or the personalization is incorrect, contact us within 7 days and we will replace it at no charge.",
  },
  // ── Digital Template Questions ─────────────────────────────────────
  {
    question: "What file format are the templates in?",
    answer:
      "Most templates are .xlsx files that work in both Microsoft Excel (desktop and online) and Google Sheets. Some products are printable PDFs. The file format is listed on every product page.",
  },
  {
    question: "How do I open the file in Google Sheets?",
    answer:
      'Upload the .xlsx file to Google Drive, then right-click and select "Open with Google Sheets." All formulas and formatting will transfer.',
  },
  {
    question: "Do I get the file immediately?",
    answer:
      "Yes. All digital products are available for instant download after purchase. You'll receive a download link via email.",
  },
  {
    question: "Can I get a refund on a digital product?",
    answer:
      "Because these are digital downloads, we cannot offer refunds once the file has been downloaded. If you experience any issues with your file, please contact us and we'll make it right.",
  },
  {
    question: "Do the formulas work automatically?",
    answer:
      "Yes. Every template comes pre-built with formulas that auto-calculate. You just enter your data.",
  },
  {
    question: "Can I customize the templates?",
    answer:
      "Absolutely. The templates are fully editable. Change colors, add rows, rename tabs. It's your file.",
  },
  {
    question: "Do you offer bundles?",
    answer:
      "Yes! Check out our Bundles collection for discounted multi-template packages.",
  },
  {
    question: "I have a question about a specific product.",
    answer:
      "Email us at michelle.e.humes@gmail.com and we'll get back to you within 24 hours.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto py-16 px-6">
          <h1 className="text-4xl font-bold font-heading mb-10">
            Frequently Asked Questions
          </h1>

          <div>
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-mid-gray">
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between py-5 text-left gap-4"
                >
                  <span
                    className={`font-heading font-semibold text-base transition ${
                      openIndex === i ? "text-pink" : "text-charcoal"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    openIndex === i ? "max-h-40 pb-5" : "max-h-0"
                  }`}
                >
                  <p className="text-text-light leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
