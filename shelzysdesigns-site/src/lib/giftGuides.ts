import { getPublishedProducts, type Product } from "@/data/products";

export interface GiftGuide {
  slug: string;
  name: string;
  shortDescription: string;
  intro: string; // 150-word keyword-rich intro paragraph
  metaDescription: string;
  eyebrow: string;
  filter: (p: Product) => boolean;
}

const hasTag = (p: Product, keywords: string[]) => {
  const tags = p.tags.map((t) => t.toLowerCase());
  const name = p.name.toLowerCase();
  const desc = p.description.toLowerCase();
  return keywords.some((kw) =>
    tags.some((t) => t.includes(kw)) || name.includes(kw) || desc.includes(kw)
  );
};

// ── Gifts-for guides (recipient) ────────────────────────────
export const recipientGuides: Record<string, GiftGuide> = {
  mom: {
    slug: "mom",
    name: "Gifts for Mom",
    eyebrow: "Shop by recipient",
    shortDescription: "Thoughtful gifts and digital tools for the mom who does it all.",
    intro:
      "Finding the right gift for Mom doesn't have to be complicated. Whether she's the one keeping the family calendar running or she's finally carving out time for herself, the best gifts are the ones she'll actually use. Our Mother's Day collection pulls together personalized water bottles with permanent sublimation printing, digital budget planners for the mom who's getting her finances in order, meal planners, ADHD-friendly life dashboards, and printable gift tags and coupon books she can keep forever. Every digital download is instant, so there's no waiting — pay today, print tonight. Every custom water bottle ships in 3–5 business days with free personalization. Handmade in small batches, built to last, and priced so you don't have to choose between thoughtful and affordable.",
    metaDescription:
      "Personalized gifts for Mom: custom water bottles, digital planners, printable coupon books, and Mother's Day tags. Instant downloads. Free personalization.",
    filter: (p) => hasTag(p, ["mom", "mother", "wife", "family"]) || p.category === "seasonal-gifts",
  },
  dad: {
    slug: "dad",
    name: "Gifts for Dad",
    eyebrow: "Shop by recipient",
    shortDescription: "Practical personalized gifts and printables dads will actually use.",
    intro:
      "Dads are famously hard to shop for — but they're easy to delight once you stop trying to top last year's tie. Our gifts for Dad lean into the everyday: a personalized water bottle for the gym, the garage, or the grill, with his name printed on permanently so it never peels. Digital budget planners for the dad running household finances. Coupon books and gift tags he can print at home for Father's Day. Wedding and graduation planners for milestone years. Every template opens in Excel or Google Sheets, every bottle ships in 3–5 business days, and every purchase comes with free personalization. Instant downloads mean no waiting — the perfect gift when you remembered Father's Day the night before.",
    metaDescription:
      "Personalized gifts for Dad: custom water bottles, budget planners, coupon books, and Father's Day printables. Instant downloads. Free personalization.",
    filter: (p) => hasTag(p, ["dad", "father", "husband", "grill", "bbq"]) || p.category === "seasonal-gifts",
  },
  grad: {
    slug: "grad",
    name: "Gifts for the Graduate",
    eyebrow: "Shop by recipient",
    shortDescription: "Planners, trackers, and gifts for new grads starting their next chapter.",
    intro:
      "Graduation is the most practical gift-giving moment of the year — and the one most people overcomplicate. New grads don't need more stuff; they need tools that help them launch. Our gifts for the graduate collection pulls together first-apartment checklists, budget planners built for entry-level salaries, job-search command centers, debt payoff trackers, meal planners for tiny kitchens, and personalized water bottles they'll carry into every new building they walk into. All digital templates are instant-download and work in both Excel and Google Sheets. Custom water bottles ship in 3–5 business days with free personalization — perfect for the name, graduation year, or school mascot. Thoughtful, useful, and priced so you can gift multiple grads without thinking about it twice.",
    metaDescription:
      "Graduation gifts: apartment checklists, budget planners, job search trackers, and personalized water bottles. Instant downloads. Free personalization.",
    filter: (p) => hasTag(p, ["graduation", "grad", "student", "college", "apartment", "first-home"])
      || p.category === "productivity"
      || p.category === "budget-finance",
  },
};

// ── Occasion guides ────────────────────────────
export const occasionGuides: Record<string, GiftGuide> = {
  "mothers-day": {
    slug: "mothers-day",
    name: "Mother's Day Gifts",
    eyebrow: "Shop by occasion",
    shortDescription: "Personalized gifts and printables ready in time for Mother's Day.",
    intro:
      "Mother's Day sneaks up every year, and the best gifts don't need weeks of lead time. Our Mother's Day collection is built for two types of shoppers: the planner who orders a custom water bottle three weeks ahead, and the rest of us who remember the Saturday night before. Every printable — coupon books, gift tags, handmade-style cards — is instant download, ready to print from any home printer. Every custom water bottle ships in 3–5 business days with free permanent personalization that won't peel in the dishwasher. Digital planners for the mom rebuilding her budget, her schedule, or her sanity. Priced between $4 and $25 so you can bundle gifts for Mom, stepmom, mother-in-law, and grandma without blinking.",
    metaDescription:
      "Mother's Day gifts: personalized water bottles, printable coupon books, gift tags, and digital planners. Instant downloads. Free personalization.",
    filter: (p) => hasTag(p, ["mother", "mom", "mothers-day", "mothers day"])
      || (p.category === "seasonal-gifts" && hasTag(p, ["mom", "mother"])),
  },
  "fathers-day": {
    slug: "fathers-day",
    name: "Father's Day Gifts",
    eyebrow: "Shop by occasion",
    shortDescription: "Gifts Dad will actually use — printable and personalized.",
    intro:
      "Father's Day gets less attention than Mother's Day, which means it's the perfect holiday to actually think about what Dad would use. Our Father's Day collection focuses on gifts with a job to do: a personalized stainless steel water bottle for the gym or the garage, a BBQ planning template, a coupon book he can redeem for car washes and rounds of golf, a budget planner for the dad running household money. Every digital printable is instant download, ready to print on plain paper tonight. Every custom water bottle ships in 3–5 business days with free permanent personalization — no peeling, no fading, dishwasher safe. Under $30 for most items, so you can gift Dad, Grandpa, father-in-law, and stepdad without stretching.",
    metaDescription:
      "Father's Day gifts: personalized water bottles, printable coupon books, BBQ planners, and budget templates. Instant downloads. Free personalization.",
    filter: (p) => hasTag(p, ["father", "dad", "fathers-day", "fathers day", "bbq", "grill"])
      || (p.category === "seasonal-gifts" && hasTag(p, ["dad", "father"])),
  },
  graduation: {
    slug: "graduation",
    name: "Graduation Gifts",
    eyebrow: "Shop by occasion",
    shortDescription: "Launch gifts for the graduate — practical, personal, instantly available.",
    intro:
      "Graduation gifts land best when they help the grad actually launch. Our graduation collection skips the generic and goes straight to useful: first-apartment checklists so they don't forget a shower curtain, budget planners built for entry-level paychecks, job-search command centers to track applications and follow-ups, debt payoff trackers, and personalized water bottles with their graduation year printed on permanently. Every digital template opens in Excel and Google Sheets and downloads instantly — perfect for last-minute graduation parties. Custom water bottles ship in 3–5 business days with free personalization. Under $25 for most items so you can gift friends, cousins, nieces, nephews, and kids of friends without deciding whose graduation matters more.",
    metaDescription:
      "Graduation gifts: apartment checklists, budget planners, job search trackers, and personalized water bottles with graduation year.",
    filter: (p) => hasTag(p, ["graduation", "grad", "college", "apartment", "first-home"])
      || p.category === "productivity",
  },
  wedding: {
    slug: "wedding",
    name: "Wedding Gifts & Planning",
    eyebrow: "Shop by occasion",
    shortDescription: "Digital planners, personalized bottles, and printables for the whole wedding weekend.",
    intro:
      "Wedding season covers more ground than just the ceremony — there's the engagement party, the bridal shower, the bachelorette trip, the rehearsal, the welcome bags, and the day itself. Our wedding collection gives you one place to shop all of it: interactive wedding budget planners and vendor comparison templates for the couple, bachelorette and bridal shower games as printable PDFs, save-the-dates featuring hand-drawn city skylines, and personalized water bottles for the bridesmaids, groomsmen, and welcome bags. Every digital download is instant, works in Excel and Google Sheets, and is built from experience — not templates scraped from somewhere else. Water bottles ship in 3–5 business days with free permanent personalization, perfect for matching sets.",
    metaDescription:
      "Wedding gifts and planning: budget planners, bachelorette games, save-the-dates, and personalized bridesmaid water bottles. Instant downloads.",
    filter: (p) => p.category === "wedding" || p.category === "save-the-dates"
      || hasTag(p, ["wedding", "bridal", "bachelorette"]),
  },
  birthday: {
    slug: "birthday",
    name: "Birthday Gifts",
    eyebrow: "Shop by occasion",
    shortDescription: "Personalized gifts and printables for every birthday on your list.",
    intro:
      "Birthday gifts are where personalization actually matters. Generic gifts disappear; a bottle or planner with someone's name on it sticks around. Our birthday collection includes personalized stainless steel water bottles with permanent sublimation printing (their name, a birthday year, an inside joke), instant-download digital planners for friends who love systems, and printable party games and invitations for the person hosting. Every template works in Excel and Google Sheets. Every bottle ships in 3–5 business days with free personalization. Most items under $15 — so you can actually afford to personalize gifts for everyone's birthday this year without spreadsheets of your own.",
    metaDescription:
      "Personalized birthday gifts: custom water bottles, printable planners, party games, and invitations. Instant downloads. Free personalization.",
    filter: (p) => hasTag(p, ["birthday", "party"])
      || p.category === "party-events"
      || p.category === "water-bottles",
  },
};

// ── Price-band guides ────────────────────────────
export const priceGuides: Record<string, GiftGuide> = {
  "under-10": {
    slug: "under-10",
    name: "Gifts Under $10",
    eyebrow: "Shop by budget",
    shortDescription: "Thoughtful gifts and printables — all under $10.",
    intro:
      "Great gifts don't require a big budget — they require the right choice. Our under-$10 collection pulls together the most-loved instant-download digital planners, printable coupon books, gift tags, party games, and wedding planning templates across the shop. Everything is instant download, works in Excel or Google Sheets, and opens on any computer or tablet. Perfect for stocking stuffers, teacher gifts, last-minute Mother's or Father's Day gifts, bridal shower favors, and thoughtful just-because moments. Built from real use, not generic templates — the same thing you'd pay $20 for on a bigger site, priced for people who still want to gift multiple people this month.",
    metaDescription:
      "Gifts under $10: instant-download printable coupon books, gift tags, budget planners, and party games. Works in Excel and Google Sheets.",
    filter: (p) => p.price < 10,
  },
  "under-25": {
    slug: "under-25",
    name: "Gifts Under $25",
    eyebrow: "Shop by budget",
    shortDescription: "Personalized gifts and planners under $25.",
    intro:
      "Our under-$25 collection is where most gift shoppers land — the sweet spot for a personalized water bottle, a full digital planner bundle, or a curated printable pack. Custom stainless steel water bottles with permanent sublimation printing sit here with free personalization included; every bottle ships in 3–5 business days. Digital planners for budgeting, weddings, ADHD-friendly daily routines, meal planning, and job searching — all instant download, all under $25. Priced for people who want to gift real items, not filler, without overspending. Mix and match for bridesmaid boxes, teacher appreciation bundles, graduation gifts, and birthdays.",
    metaDescription:
      "Personalized gifts under $25: custom water bottles, digital planners, printable bundles. Instant downloads. Free personalization.",
    filter: (p) => p.price <= 25,
  },
};

export function listProducts(guide: GiftGuide): Product[] {
  return getPublishedProducts()
    .filter(guide.filter)
    .sort((a, b) => {
      // bestSellers first, then featured, then price asc
      if (a.bestSeller !== b.bestSeller) return a.bestSeller ? -1 : 1;
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.price - b.price;
    });
}
