import { products, type Product } from "@/data/products";

export type Recipient = "mom" | "dad" | "grad" | "partner" | "friend" | "self";
export type Occasion = "mothers-day" | "fathers-day" | "graduation" | "wedding" | "birthday" | "just-because";
export type Style = "practical" | "sentimental" | "playful";
export type Format = "digital" | "physical" | "any";
export type Price = "under-10" | "10-25" | "25-plus";
export type Timing = "need-now" | "planning-ahead";

export interface QuizAnswers {
  recipient: Recipient;
  occasion: Occasion;
  style: Style;
  format: Format;
  price: Price;
  timing: Timing;
}

function tagMatches(tags: string[], keywords: string[]): number {
  const lower = tags.map((t) => t.toLowerCase());
  let hits = 0;
  for (const kw of keywords) {
    if (lower.some((t) => t.includes(kw))) hits += 1;
  }
  return hits;
}

function scoreRecipient(p: Product, r: Recipient): number {
  const t = p.tags.map((x) => x.toLowerCase());
  const name = p.name.toLowerCase();
  switch (r) {
    case "mom":
      return tagMatches(t, ["mom", "mother", "wife", "family"]) * 3
        + (p.category === "budget-finance" ? 1 : 0)
        + (p.category === "seasonal-gifts" ? 2 : 0)
        + (name.includes("mom") || name.includes("mother") ? 4 : 0);
    case "dad":
      return tagMatches(t, ["dad", "father", "grill", "bbq", "husband"]) * 3
        + (p.category === "business" ? 1 : 0)
        + (name.includes("dad") || name.includes("father") ? 4 : 0);
    case "grad":
      return tagMatches(t, ["graduation", "grad", "student", "college", "apartment"]) * 3
        + (p.category === "seasonal-gifts" ? 2 : 0)
        + (p.category === "productivity" ? 1 : 0)
        + (name.includes("graduat") ? 4 : 0);
    case "partner":
      return tagMatches(t, ["wedding", "couple", "anniversary", "love", "date"]) * 2
        + (p.category === "wedding" ? 2 : 0)
        + (p.category === "water-bottles" ? 2 : 0);
    case "friend":
      return tagMatches(t, ["birthday", "party", "bachelorette", "bridal"]) * 2
        + (p.category === "party-events" ? 2 : 0)
        + (p.category === "water-bottles" ? 2 : 0);
    case "self":
      return tagMatches(t, ["self", "productivity", "planner", "tracker", "adhd"]) * 2
        + (p.category === "productivity" ? 2 : 0)
        + (p.category === "budget-finance" ? 2 : 0);
  }
}

function scoreOccasion(p: Product, o: Occasion): number {
  const t = p.tags.map((x) => x.toLowerCase());
  const name = p.name.toLowerCase();
  switch (o) {
    case "mothers-day":
      return tagMatches(t, ["mother", "mom", "mothers-day"]) * 3
        + (p.category === "seasonal-gifts" ? 2 : 0)
        + (name.includes("mother") ? 4 : 0);
    case "fathers-day":
      return tagMatches(t, ["father", "dad", "fathers-day", "bbq", "grill"]) * 3
        + (name.includes("father") ? 4 : 0);
    case "graduation":
      return tagMatches(t, ["graduation", "grad", "college", "apartment", "first-home"]) * 3
        + (name.includes("graduat") ? 4 : 0);
    case "wedding":
      return (p.category === "wedding" ? 4 : 0)
        + (p.category === "save-the-dates" ? 3 : 0)
        + tagMatches(t, ["wedding", "bridal", "bachelorette"]) * 2;
    case "birthday":
      return tagMatches(t, ["birthday", "party"]) * 2
        + (p.category === "party-events" ? 2 : 0)
        + (p.category === "water-bottles" ? 2 : 0);
    case "just-because":
      return (p.bestSeller ? 2 : 0) + (p.featured ? 1 : 0);
  }
}

function scoreStyle(p: Product, s: Style): number {
  switch (s) {
    case "practical":
      return (["budget-finance", "productivity", "business", "education"].includes(p.category) ? 3 : 0);
    case "sentimental":
      return (["wedding", "seasonal-gifts", "save-the-dates", "water-bottles"].includes(p.category) ? 3 : 0);
    case "playful":
      return (["party-events", "water-bottles", "seasonal-gifts"].includes(p.category) ? 3 : 0);
  }
}

function scoreFormat(p: Product, f: Format): number {
  if (f === "any") return 0;
  const isPhysical = p.compatibility === "physical";
  if (f === "physical" && isPhysical) return 5;
  if (f === "digital" && !isPhysical) return 2;
  if (f === "physical" && !isPhysical) return -8;
  if (f === "digital" && isPhysical) return -8;
  return 0;
}

function scorePrice(p: Product, pr: Price): number {
  if (pr === "under-10" && p.price < 10) return 2;
  if (pr === "10-25" && p.price >= 10 && p.price <= 25) return 2;
  if (pr === "25-plus" && p.price > 25) return 2;
  // soft penalty for out-of-band
  if (pr === "under-10" && p.price >= 15) return -3;
  if (pr === "25-plus" && p.price < 15) return -2;
  return 0;
}

function scoreTiming(p: Product, t: Timing): number {
  const isPhysical = p.compatibility === "physical";
  if (t === "need-now" && !isPhysical) return 3; // instant downloads
  if (t === "need-now" && isPhysical) return -2;
  return 0;
}

export interface ScoredProduct {
  product: Product;
  score: number;
}

export function findGifts(answers: QuizAnswers, limit = 6): ScoredProduct[] {
  const pool = products.filter((p) => p.published !== false);
  const scored: ScoredProduct[] = pool.map((product) => {
    const score =
      scoreRecipient(product, answers.recipient) +
      scoreOccasion(product, answers.occasion) +
      scoreStyle(product, answers.style) +
      scoreFormat(product, answers.format) +
      scorePrice(product, answers.price) +
      scoreTiming(product, answers.timing) +
      (product.bestSeller ? 0.5 : 0) +
      (product.featured ? 0.25 : 0);
    return { product, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export const quizSchema = {
  recipient: [
    { value: "mom", label: "Mom" },
    { value: "dad", label: "Dad" },
    { value: "grad", label: "Graduate" },
    { value: "partner", label: "Partner" },
    { value: "friend", label: "Friend" },
    { value: "self", label: "Myself" },
  ] as const,
  occasion: [
    { value: "mothers-day", label: "Mother's Day" },
    { value: "fathers-day", label: "Father's Day" },
    { value: "graduation", label: "Graduation" },
    { value: "wedding", label: "Wedding" },
    { value: "birthday", label: "Birthday" },
    { value: "just-because", label: "Just Because" },
  ] as const,
  style: [
    { value: "practical", label: "Practical", sub: "They'll use it daily" },
    { value: "sentimental", label: "Sentimental", sub: "Something meaningful" },
    { value: "playful", label: "Playful", sub: "Fun and a little cheeky" },
  ] as const,
  format: [
    { value: "digital", label: "Digital download" },
    { value: "physical", label: "Physical item" },
    { value: "any", label: "Either is fine" },
  ] as const,
  price: [
    { value: "under-10", label: "Under $10" },
    { value: "10-25", label: "$10 – $25" },
    { value: "25-plus", label: "$25+" },
  ] as const,
  timing: [
    { value: "need-now", label: "Need it today" },
    { value: "planning-ahead", label: "Planning ahead" },
  ] as const,
};
