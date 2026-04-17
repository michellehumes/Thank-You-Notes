import { NextRequest, NextResponse } from "next/server";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function addToButtondown(email: string, source: string): Promise<boolean> {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) return false;

  const res = await fetch("https://api.buttondown.email/v1/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      tags: ["10off-signup", "gift-tag-pack", source],
      notes: `Signed up via ${source} on shelzysdesigns.com`,
    }),
  });

  return res.ok || res.status === 422;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, source = "homepage_hero" } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const discountCode = process.env.DISCOUNT_CODE || "WELCOME10";
    const downloadUrl = process.env.HERO_CAPTURE_TARGET_URL || null;

    const delivered = await addToButtondown(normalizedEmail, source);
    if (!delivered) {
      console.log(`[HERO-SUBSCRIBE] New signup (no email service): ${normalizedEmail} source=${source}`);
    }

    return NextResponse.json({
      success: true,
      discountCode,
      downloadUrl,
      message: "Check your inbox -- your code is on the way.",
    });
  } catch (err) {
    console.error("[HERO-SUBSCRIBE] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
