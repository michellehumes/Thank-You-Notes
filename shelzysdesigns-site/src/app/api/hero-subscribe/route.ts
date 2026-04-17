import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/hero-subscribe
//
// Temporary capture endpoint for the homepage hero email signup.
// Klaviyo isn't live yet (Prompt 13). When it is, swap one of two things:
//
//   Option A (preferred): set HERO_CAPTURE_TARGET_URL to the Klaviyo /
//   WordPress endpoint. This file POSTs each new submission to that URL
//   and stops writing to the local CSV.
//
//   Option B: replace this file with a Klaviyo client integration.
//
// Local fallback (no env var set):
//   Appends to data/hero-email-captures.csv at the repo root.
//   Columns: email,timestamp_iso,source_page,consent_text,consent_at_iso
//   24-hour duplicate prevention is enforced by reading the CSV on each call.
//
// Note on durability: Vercel's serverless filesystem is read-only outside
// of /tmp, so the CSV path is intended for local dev or any host with a
// writable working directory. In production, set HERO_CAPTURE_TARGET_URL.
// ─────────────────────────────────────────────────────────────────────────────

const TARGET_URL = process.env.HERO_CAPTURE_TARGET_URL;
const CSV_PATH = path.join(process.cwd(), "data", "hero-email-captures.csv");
const CSV_HEADER = "email,timestamp_iso,source_page,consent_text,consent_at_iso\n";
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function ensureCsv(): Promise<void> {
  await fs.mkdir(path.dirname(CSV_PATH), { recursive: true });
  try {
    await fs.access(CSV_PATH);
  } catch {
    await fs.writeFile(CSV_PATH, CSV_HEADER, "utf8");
  }
}

async function isDuplicate(email: string): Promise<boolean> {
  try {
    const contents = await fs.readFile(CSV_PATH, "utf8");
    const lines = contents.split("\n").slice(1); // skip header
    const cutoff = Date.now() - DEDUP_WINDOW_MS;
    for (const line of lines) {
      if (!line.trim()) continue;
      // Naive parse — first two columns are email,timestamp_iso and neither
      // contains commas in our writes.
      const [storedEmail, storedTs] = line.split(",");
      if (!storedEmail || !storedTs) continue;
      if (storedEmail.toLowerCase() === email.toLowerCase()) {
        const ts = Date.parse(storedTs);
        if (!isNaN(ts) && ts > cutoff) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

async function appendToCsv(row: {
  email: string;
  timestamp: string;
  source: string;
  consentText: string;
  consentAt: string;
}): Promise<void> {
  await ensureCsv();
  const line =
    [
      csvEscape(row.email),
      csvEscape(row.timestamp),
      csvEscape(row.source),
      csvEscape(row.consentText),
      csvEscape(row.consentAt),
    ].join(",") + "\n";
  await fs.appendFile(CSV_PATH, line, "utf8");
}

async function forwardToTarget(payload: object): Promise<boolean> {
  if (!TARGET_URL) return false;
  try {
    const res = await fetch(TARGET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.error("[HERO_SUBSCRIBE] Forward failed:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email: string | undefined = body?.email;
    const source: string = body?.source || "homepage_hero";
    const consent: boolean = body?.consent === true;
    const consentText: string =
      body?.consent_text ||
      "I agree to receive marketing emails from Shelzy's Designs and accept the privacy policy.";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Consent is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date().toISOString();

    // Forwarding mode: Klaviyo / WP endpoint configured.
    if (TARGET_URL) {
      const forwarded = await forwardToTarget({
        email: normalizedEmail,
        source_page: source,
        timestamp_iso: now,
        consent_text: consentText,
        consent_at_iso: now,
      });
      if (!forwarded) {
        return NextResponse.json(
          { error: "Could not save right now. Please try again." },
          { status: 502 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Check your inbox -- your code is on the way.",
      });
    }

    // Local CSV mode.
    if (await isDuplicate(normalizedEmail)) {
      // Treat duplicates as success so the UX still confirms.
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: "Check your inbox -- your code is on the way.",
      });
    }

    await appendToCsv({
      email: normalizedEmail,
      timestamp: now,
      source,
      consentText,
      consentAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Check your inbox -- your code is on the way.",
    });
  } catch (err) {
    console.error("[HERO_SUBSCRIBE] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
