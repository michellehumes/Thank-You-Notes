import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/data/blog-posts";

export const runtime = "edge";

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  "budget-finance": { bg: "#fb5887", text: "#fff", label: "Budget + Finance" },
  wedding:          { bg: "#8adbde", text: "#2d2d2d", label: "Wedding" },
  productivity:     { bg: "#3ca4d7", text: "#fff", label: "Productivity" },
  business:         { bg: "#fe8c43", text: "#fff", label: "Business" },
  etsy:             { bg: "#fb5887", text: "#fff", label: "Etsy" },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  const post = slug ? getBlogPostBySlug(slug) : null;

  const headline = post?.headline ?? "Shelzy's Designs";
  const category = post?.category ?? "budget-finance";
  const cat = categoryColors[category] ?? categoryColors["budget-finance"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#fefefe",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            width: "100%",
            height: "8px",
            background: "linear-gradient(90deg, #fb5887 0%, #fe8c43 50%, #8adbde 100%)",
            display: "flex",
          }}
        />

        {/* Decorative circle top-right */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: cat.bg,
            opacity: 0.12,
            display: "flex",
          }}
        />

        {/* Decorative circle bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background: "#3ca4d7",
            opacity: 0.1,
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "52px 72px 52px 72px",
          }}
        >
          {/* Top row: Wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Logo mark */}
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#fb5887",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "22px",
                fontWeight: 700,
              }}
            >
              S
            </div>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#2d2d2d",
                letterSpacing: "-0.3px",
              }}
            >
              Shelzy&apos;s Designs
            </span>
          </div>

          {/* Category pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "auto",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: cat.bg,
                color: cat.text,
                fontSize: "17px",
                fontWeight: 700,
                padding: "8px 20px",
                borderRadius: "100px",
                display: "flex",
              }}
            >
              {cat.label}
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: headline.length > 60 ? "44px" : "52px",
              fontWeight: 800,
              color: "#2d2d2d",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              maxWidth: "920px",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {headline}
          </div>

          {/* Bottom: URL */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "36px",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "3px",
                background: "#fb5887",
                borderRadius: "2px",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: "18px",
                color: "#666666",
                fontWeight: 500,
              }}
            >
              shelzysdesigns.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
