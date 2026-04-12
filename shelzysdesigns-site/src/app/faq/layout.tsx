import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Shelzy's Designs",
  description:
    "Answers about file formats, instant downloads, refunds, formulas, and customizing your digital templates.",
  openGraph: {
    title: "FAQ | Shelzy's Designs",
    description:
      "Answers about file formats, instant downloads, refunds, formulas, and customizing your digital templates.",
    type: "website",
    siteName: "Shelzy's Designs",
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
