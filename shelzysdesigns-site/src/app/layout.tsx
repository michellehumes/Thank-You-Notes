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
    "Custom personalized water bottles with permanent sublimation printing, plus instant-download digital templates for budgeting, wedding planning, and organizing. Free personalization on every bottle.",
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
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Shelzy's Designs",
  url: "https://shelzysdesigns.com",
  logo: "https://shelzysdesigns.com/shelzy_images/shelzy_01_img01.svg",
  description:
    "Digital spreadsheet templates, planners, and personalized water bottles designed for real life. Instant download. Free personalization.",
  sameAs: [
    "https://www.etsy.com/shop/ShelzysDesigns",
    "https://instagram.com/shelzysdesigns",
    "https://pinterest.com/shelzysdesigns",
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`,
          }}
        />
        {/* Lemon Squeezy checkout overlay — activates on links with class="lemonsqueezy-button" */}
        <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
