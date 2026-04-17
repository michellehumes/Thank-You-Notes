import type { Metadata } from "next";
import { Montserrat, Inter, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import AnnouncementBar from "@/components/AnnouncementBar";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import {
  organizationSchema as orgSchema,
  websiteSchema,
} from "@/lib/schema";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Shelzy's Designs | Personalized Water Bottles and Digital Templates",
    template: "%s | Shelzy's Designs",
  },
  description:
    "Custom personalized water bottles with permanent sublimation printing, plus instant-download digital templates for budgeting, wedding planning, and organizing. Free personalization on every bottle.",
  metadataBase: new URL("https://shelzysdesigns.com"),
  openGraph: {
    siteName: "Shelzy's Designs",
    type: "website",
    images: [
      {
        url: "/product_images/personalized-water-bottle.jpg",
        width: 1200,
        height: 1200,
        alt: "Personalized Water Bottle -- Shelzy's Designs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/product_images/personalized-water-bottle.jpg"],
  },
  robots: { index: true, follow: true },
  other: { "p:domain_verify": "e3c1f8be645d6ac6344d51089de2c69a" },
};

const organizationSchema = orgSchema;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AnnouncementBar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {children}
        <ExitIntentPopup />
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`,
              }}
            />
          </>
        )}
        <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="afterInteractive" />
        {process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_ENABLED === "true" && (
          <Script
            src="https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
