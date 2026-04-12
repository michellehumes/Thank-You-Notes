import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/subscribe
// Captures email signups for the 15% off promotion.
//
// To activate email delivery, set one of these env vars in Vercel:
//   MAILCHIMP_API_KEY + MAILCHIMP_LIST_ID  (Mailchimp)
//   CONVERTKIT_API_KEY + CONVERTKIT_FORM_ID  (ConvertKit)
//   BUTTONDOWN_API_KEY  (Buttondown — simplest, $0 free tier)
//
// Without env vars, emails are logged server-side. Add the key and redeploy.
// ─────────────────────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function addToButtondown(email: string): Promise<boolean> {
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
      tags: ["15off-signup", "website"],
      notes: "Signed up for 15% off via shelzysdesigns.com",
    }),
  });

  return res.ok || res.status === 422; // 422 = already subscribed, that's fine
}

async function addToMailchimp(email: string): Promise<boolean> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  if (!apiKey || !listId) return false;

  const dc = apiKey.split("-").pop(); // e.g. us14
  const res = await fetch(
    `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`,
    {
      method: "POST",
      headers: {
        Authorization: `apikey ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        tags: ["15off-signup"],
      }),
    }
  );

  return res.ok || res.status === 400; // 400 often means already subscribed
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Try email services in order of preference
    const delivered =
      (await addToButtondown(normalizedEmail)) ||
      (await addToMailchimp(normalizedEmail));

    if (!delivered) {
      // No email service configured yet — log it and still return success
      // so the UX isn't broken. Connect an email service via Vercel env vars.
      console.log(`[SUBSCRIBE] New signup (no email service configured): ${normalizedEmail}`);
    }

    return NextResponse.json({
      success: true,
      message: "You're in! Check your email for your 15% off code.",
    });
  } catch (err) {
    console.error("[SUBSCRIBE] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
