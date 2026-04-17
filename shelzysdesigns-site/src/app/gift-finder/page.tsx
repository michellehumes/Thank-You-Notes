import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GiftFinder from "@/components/GiftFinder";

export const metadata: Metadata = {
  title: "Gift Finder — Find the Perfect Personalized Gift",
  description:
    "Answer six quick questions and we'll match you with the right personalized gift, planner, or printable from Shelzy's Designs. Takes under a minute.",
  openGraph: {
    title: "Gift Finder — Find the Perfect Personalized Gift | Shelzy's Designs",
    description:
      "Answer six quick questions and we'll match you with the right personalized gift, planner, or printable.",
  },
};

export default function GiftFinderPage() {
  return (
    <>
      <Header />
      <main className="flex-1" style={{ background: "var(--color-cream)" }}>
        <GiftFinder />
      </main>
      <Footer />
    </>
  );
}
