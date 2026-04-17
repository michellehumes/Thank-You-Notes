// ── JSON-LD schema helpers ────────────────────────────────

const SITE = "https://shelzysdesigns.com";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Shelzy's Designs",
  url: SITE,
  logo: `${SITE}/product_images/personalized-water-bottle.jpg`,
  description:
    "Personalized water bottles and digital planner templates designed for real life. Instant downloads. Free personalization on every bottle.",
  sameAs: [
    "https://www.etsy.com/shop/ShelzysDesignsStore",
    "https://instagram.com/shelzysdesigns",
    "https://pinterest.com/shelzysdesigns",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "500",
    bestRating: "5",
    worstRating: "1",
  },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Shelzy's Designs",
  url: SITE,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE}/shop?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const globalBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
    { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE}/shop` },
  ],
};

export function digitalProductFAQ(productName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I download this product after purchase?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `After checkout, ${productName} is delivered instantly by email as a downloadable file. You can also re-download anytime from your account link.`,
        },
      },
      {
        "@type": "Question",
        name: "What file format is the template?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Digital templates are delivered as Excel (.xlsx), Google Sheets (shared link), or PDF depending on the product. Full compatibility details are listed on each product page.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use this template on both desktop and mobile?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All templates work on desktop, laptop, tablet, and phone through Excel, Google Sheets, or any PDF reader.",
        },
      },
      {
        "@type": "Question",
        name: "Can I get a refund on a digital download?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Because digital products are delivered instantly and cannot be returned, sales are final. But if something isn't working, email Michelle directly and she'll make it right.",
        },
      },
    ],
  };
}

export function physicalProductFAQ(productName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How long does personalization and shipping take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${productName} is personalized in-house and ships in 3–5 business days via USPS.`,
        },
      },
      {
        "@type": "Question",
        name: "Will the personalization fade or peel?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All personalization uses permanent sublimation printing — dishwasher safe, scratch resistant, and built to last for years without fading or peeling.",
        },
      },
      {
        "@type": "Question",
        name: "Is personalization free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Free personalization is included on every custom water bottle. Add a name, phrase, date, or short custom text at checkout.",
        },
      },
    ],
  };
}
