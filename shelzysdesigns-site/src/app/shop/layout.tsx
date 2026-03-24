import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Templates + Water Bottles | Shelzy's Designs",
  description:
    "Browse 60+ instant-download spreadsheet templates, digital planners, and personalized water bottles. Budget trackers, wedding planners, business dashboards, ADHD tools, meal planners, and more. Download instantly and customize in Excel or Google Sheets.",
  openGraph: {
    title: "Shop All Templates + Water Bottles | Shelzy's Designs",
    description:
      "60+ instant-download spreadsheet templates and personalized water bottles. Budget trackers, wedding planners, business dashboards, and more.",
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
