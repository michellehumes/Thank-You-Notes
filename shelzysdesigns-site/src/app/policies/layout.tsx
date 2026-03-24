import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Policies | Shelzy's Designs",
  description:
    "Refund policy, terms of service, and privacy policy for Shelzy's Designs digital products.",
  openGraph: {
    title: "Policies | Shelzy's Designs",
    description:
      "Refund policy, terms of service, and privacy policy for Shelzy's Designs digital products.",
    type: "website",
    siteName: "Shelzy's Designs",
  },
};

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
