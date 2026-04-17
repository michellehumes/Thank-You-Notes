import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GiftGuidePage from "@/components/GiftGuidePage";
import { recipientGuides } from "@/lib/giftGuides";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = recipientGuides[slug];
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
  return Object.keys(recipientGuides).map((slug) => ({ slug }));
}

export default async function RecipientGiftGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = recipientGuides[slug];
  if (!guide) notFound();

  return <GiftGuidePage guide={guide} crumb={{ label: "Gifts for", href: "/shop" }} />;
}
