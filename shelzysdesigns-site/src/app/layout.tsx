import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Shelzy's Designs | Personalized Water Bottles and Digital Templates",
  description:
    "Custom personalized water bottles with permanent sublimation printing, plus instant-download digital templates for budgeting, planning, and organizing. Free personalization on every bottle.",
  metadataBase: new URL("https://shelzysdesigns.com"),
  openGraph: {
    siteName: "Shelzy's Designs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Shelzy's Designs",
      url: "https://shelzysdesigns.com",
      description:
        "Digital templates, planners, and trackers designed to simplify your life.",
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
        {/* Lemon Squeezy checkout overlay — activates on links with class="lemonsqueezy-button" */}
        <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
