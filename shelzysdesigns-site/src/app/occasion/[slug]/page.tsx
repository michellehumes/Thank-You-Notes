import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GiftGuidePage from "@/components/GiftGuidePage";
import { occasionGuides } from "@/lib/giftGuides";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = occasionGuides[slug];
  if (!guide) return { title: "Not Found" };
  return {
    title: `${guide.name} | Shelzy's Designs`,
    description: guide.metaDescription,
    openGraph: {
      title: `${guide.name} | Shelzy's Designs`,
      description: guide.metaDescription,
      type: "website",
      siteName: "Shelzy's Designs",
    },
  };
}

export function generateStaticParams() {
  return Object.keys(occasionGuides).map((slug) => ({ slug }));
}

export default async function OccasionGiftGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = occasionGuides[slug];
  if (!guide) notFound();

  return <GiftGuidePage guide={guide} crumb={{ label: "Shop by Occasion", href: "/shop" }} />;
}
