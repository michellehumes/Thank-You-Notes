import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Shelzy's Designs",
  description:
    "Questions about custom water bottles, digital templates, instant downloads, personalization, and more. Answered.",
  openGraph: {
    title: "FAQ | Shelzy's Designs",
    description:
      "Questions about custom water bottles, digital templates, instant downloads, personalization, and more. Answered.",
    type: "website",
    siteName: "Shelzy's Designs",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does the water bottle personalization work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On any water bottle product page, enter the name or text you want, select a font style, and click Order on Etsy. Your personalization details are pre-filled in the message to seller on Etsy. We confirm your order before we print anything.",
      },
    },
    {
      "@type": "Question",
      name: "How long does a custom water bottle take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Production takes 3-5 business days after order confirmation. Standard shipping adds 3-7 business days. Expedited options are available at checkout on Etsy.",
      },
    },
    {
      "@type": "Question",
      name: "Will the design fade or peel?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. We use permanent sublimation printing -- the design is fused into the coating, not printed on top of it. It will not peel, crack, or fade with normal use.",
      },
    },
    {
      "@type": "Question",
      name: "What file format are the templates in?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most templates are .xlsx files that work in both Microsoft Excel and Google Sheets. Some products are printable PDFs. The file format is listed on every product page.",
      },
    },
    {
      "@type": "Question",
      name: "Do I get the file immediately?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All digital products are available for instant download after purchase. You'll receive a download link via email.",
      },
    },
    {
      "@type": "Question",
      name: "Can I get a refund on a digital product?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Because these are digital downloads, we cannot offer refunds once the file has been downloaded. If you experience any issues with your file, please contact us and we'll make it right.",
      },
    },
  ],
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
