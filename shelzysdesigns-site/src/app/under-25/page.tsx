import type { Metadata } from "next";
import GiftGuidePage from "@/components/GiftGuidePage";
import { priceGuides } from "@/lib/giftGuides";

const guide = priceGuides["under-25"];

export const metadata: Metadata = {
  title: `${guide.name} | Shelzy's Designs`,
  description: guide.metaDescription,
  openGraph: {
    title: `${guide.name} | Shelzy's Designs`,
    description: guide.metaDescription,
    type: "website",
    siteName: "Shelzy's Designs",
  },
};

export default function Under25Page() {
  return <GiftGuidePage guide={guide} crumb={{ label: "Shop by Budget", href: "/shop" }} />;
}
