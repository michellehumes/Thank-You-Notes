import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Templates | Shelzy's Designs",
  description:
    "Browse digital spreadsheet templates, planners, and trackers. Budget tools, wedding planners, business templates, and more.",
  openGraph: {
    title: "Shop All Templates | Shelzy's Designs",
    description:
      "Browse digital spreadsheet templates, planners, and trackers. Budget tools, wedding planners, business templates, and more.",
    type: "website",
    siteName: "Shelzy's Designs",
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
