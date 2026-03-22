// ─────────────────────────────────────────────
// ShelzysDesigns.com — Product Catalog
// ─────────────────────────────────────────────

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  category:
    | "budget-finance"
    | "business"
    | "productivity"
    | "education"
    | "wedding"
    | "party-events"
    | "save-the-dates"
    | "printables-bundles"
    | "water-bottles";
  tags: string[];
  compatibility: "excel" | "sheets" | "both" | "pdf" | "physical";
  lemonSqueezyUrl: string;
  etsyUrl: string;
  featured: boolean;
  bestSeller: boolean;
  images: string[];
}

export interface Category {
  slug: string;
  name: string;
  description: string;
}

// ─────────────────────────────────────────────
// Full Product Catalog (54 products)
// ─────────────────────────────────────────────

export const products: Product[] = [
  // ── Budget + Finance ──────────────────────
  {
    id: 1,
    slug: "monthly-budget-tracker",
    name: "Monthly Budget Tracker",
    description:
      "Track your income, expenses, and savings goals month by month with a clean, visual budget tracker. Perfect for anyone ready to take control of their finances.",
    price: 5.99,
    category: "budget-finance",
    tags: ["budget", "finance", "monthly", "tracker", "savings"],
    compatibility: "both",
    lemonSqueezyUrl: "https://shelzysdesigns.lemonsqueezy.com/checkout/buy/1431179",
    etsyUrl: "https://www.etsy.com/listing/4450651293/monthly-budget-tracker-google-sheets",
    featured: true,
    bestSeller: true,
    images: ["/shelzy_images/shelzy_01_img01.svg"],
  },
  {
    id: 2,
    slug: "paycheck-budget-planner",
    name: "Paycheck Budget Planner",
    description:
      "Allocate every paycheck with intention using a structured paycheck-by-paycheck budgeting system. Ideal for biweekly or weekly pay schedules.",
    price: 5.99,
    category: "budget-finance",
    tags: ["budget", "paycheck", "biweekly", "planner"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4466923235/paycheck-budget-spreadsheet-biweekly",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_02_img01.svg"],
  },
  {
    id: 3,
    slug: "digital-cash-stuffing-system",
    name: "Digital Cash Stuffing System",
    description:
      "Bring the popular cash stuffing method into the digital world. Organize your money into virtual envelopes and watch your savings grow.",
    price: 5.99,
    category: "budget-finance",
    tags: ["cash stuffing", "envelopes", "budget", "savings"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4468749322/digital-cash-stuffing-budget-system",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_03_img01.svg"],
  },
  {
    id: 4,
    slug: "family-budget-planner",
    name: "Family Budget Planner",
    description:
      "Manage household finances as a team with a planner built for families. Track shared expenses, individual spending, and joint savings goals.",
    price: 5.99,
    category: "budget-finance",
    tags: ["family", "budget", "household", "planner"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4470666450/family-budget-spreadsheet-kids-expense",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_04_img01.svg"],
  },
  {
    id: 5,
    slug: "2026-annual-budget-planner",
    name: "2026 Annual Budget Planner",
    description:
      "Plan your entire year of finances in one place with monthly breakdowns, annual summaries, and goal tracking built for 2026.",
    price: 5.99,
    category: "budget-finance",
    tags: ["annual", "budget", "2026", "yearly", "planner"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4454684004/budget-spreadsheet-template-2026-monthly",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_05_img01.svg"],
  },
  {
    id: 6,
    slug: "debt-payoff-tracker",
    name: "Debt Payoff Tracker",
    description:
      "Visualize your path to debt freedom with a tracker that supports snowball and avalanche methods. Stay motivated as you watch balances drop.",
    price: 5.99,
    category: "budget-finance",
    tags: ["debt", "payoff", "snowball", "avalanche", "tracker"],
    compatibility: "both",
    lemonSqueezyUrl: "https://shelzysdesigns.lemonsqueezy.com/checkout/buy/1431199",
    etsyUrl: "https://www.etsy.com/listing/4472203453/debt-payoff-tracker-spreadsheet-snowball",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_06_img01.svg"],
  },
  {
    id: 7,
    slug: "debt-payoff-savings-tracker",
    name: "Debt Payoff + Savings Tracker",
    description:
      "Tackle debt and build savings at the same time. This dual-purpose tracker helps you balance paying down what you owe while growing your emergency fund.",
    price: 5.99,
    category: "budget-finance",
    tags: ["debt", "savings", "payoff", "tracker", "emergency fund"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4455440202/debt-payoff-savings-goal-tracker-google",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_07_img01.svg"],
  },

  // ── Business ──────────────────────────────
  {
    id: 8,
    slug: "small-business-planner-2026",
    name: "Small Business Planner 2026",
    description:
      "An all-in-one planner for small business owners covering revenue tracking, expense management, quarterly goals, and monthly reviews for 2026.",
    price: 7.99,
    category: "business",
    tags: ["business", "planner", "2026", "small business", "revenue"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4454785269/small-business-planner-spreadsheet-2026",
    featured: true,
    bestSeller: true,
    images: ["/shelzy_images/shelzy_08_img01.svg"],
  },
  {
    id: 9,
    slug: "side-hustle-income-expense-tracker",
    name: "Side Hustle Income + Expense Tracker",
    description:
      "Keep your side hustle finances organized with a dedicated income and expense tracker. Know exactly what you're earning after costs.",
    price: 5.99,
    category: "business",
    tags: ["side hustle", "income", "expense", "tracker", "freelance"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4444597633/side-hustle-income-expense-tracker-excel",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_09_img01.svg"],
  },
  {
    id: 10,
    slug: "12-month-side-hustle-log",
    name: "12-Month Side Hustle Log",
    description:
      "Log a full year of side hustle activity including hours worked, income earned, and monthly trends. Great for tax prep and goal setting.",
    price: 5.99,
    category: "business",
    tags: ["side hustle", "log", "12 month", "yearly", "income"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4470488179/12-month-side-hustle-log-excel",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_10_img01.svg"],
  },
  {
    id: 11,
    slug: "business-finance-net-worth-dashboard",
    name: "Business Finance + Net Worth Dashboard",
    description:
      "Get a high-level view of your business finances and personal net worth in one powerful dashboard. Track assets, liabilities, and cash flow.",
    price: 7.99,
    category: "business",
    tags: ["business", "finance", "net worth", "dashboard", "assets"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4464388900/business-finance-tracker-excel-google",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_11_img01.svg"],
  },
  {
    id: 12,
    slug: "etsy-seller-analytics-dashboard",
    name: "Etsy Seller Analytics Dashboard",
    description:
      "Analyze your Etsy shop performance with a dashboard that tracks sales, traffic, conversion rates, and revenue trends over time.",
    price: 7.99,
    category: "business",
    tags: ["etsy", "seller", "analytics", "dashboard", "ecommerce"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4438165509/etsy-seller-spreadsheet-google-sheets",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_12_img01.svg"],
  },
  {
    id: 13,
    slug: "etsy-seller-profit-calculator",
    name: "Etsy Seller Profit Calculator",
    description:
      "Calculate your true Etsy profit after fees, shipping, materials, and advertising costs. Stop guessing and start knowing your margins.",
    price: 5.99,
    category: "business",
    tags: ["etsy", "profit", "calculator", "fees", "margins"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4438165509/etsy-seller-spreadsheet-google-sheets",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_13_img01.svg"],
  },

  // ── Productivity + Life ───────────────────
  {
    id: 14,
    slug: "adhd-life-dashboard",
    name: "ADHD Life Dashboard",
    description:
      "A structured yet flexible life dashboard designed for ADHD brains. Manage tasks, habits, routines, and priorities without the overwhelm.",
    price: 7.99,
    category: "productivity",
    tags: ["adhd", "dashboard", "productivity", "habits", "routines"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4466870305/adhd-life-dashboard-planner-google",
    featured: true,
    bestSeller: true,
    images: ["/shelzy_images/shelzy_14_img01.svg"],
  },
  {
    id: 15,
    slug: "project-goal-tracker",
    name: "Project + Goal Tracker",
    description:
      "Break big projects into actionable steps and track your progress toward personal or professional goals with built-in milestone tracking.",
    price: 5.99,
    category: "productivity",
    tags: ["project", "goals", "tracker", "milestones", "planning"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4455457091/project-goal-tracker-google-sheets",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_15_img01.svg"],
  },
  {
    id: 16,
    slug: "moving-day-planner",
    name: "Moving Day Planner",
    description:
      "Take the chaos out of moving with a step-by-step planner covering timelines, checklists, inventory, and budget tracking for your move.",
    price: 5.99,
    category: "productivity",
    tags: ["moving", "planner", "checklist", "relocation", "organizing"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4466932488/moving-planner-checklist-spreadsheet",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_16_img01.svg"],
  },
  {
    id: 17,
    slug: "vacation-trip-planner",
    name: "Vacation Trip Planner",
    description:
      "Plan your dream vacation from start to finish with itinerary templates, packing lists, budget tracking, and booking organizers.",
    price: 5.99,
    category: "productivity",
    tags: ["vacation", "trip", "travel", "planner", "itinerary"],
    compatibility: "both",
    lemonSqueezyUrl: "https://shelzysdesigns.lemonsqueezy.com/checkout/buy/1431204",
    etsyUrl: "https://www.etsy.com/listing/4466832536/vacation-trip-planner-spreadsheet-budget",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_17_img01.svg"],
  },
  {
    id: 18,
    slug: "weekly-meal-planner",
    name: "Weekly Meal Planner",
    description:
      "Simplify your week with a meal planner that helps you plan breakfast, lunch, dinner, and snacks. Eat better and waste less food.",
    price: 5.99,
    category: "productivity",
    tags: ["meal", "planner", "weekly", "food", "cooking"],
    compatibility: "both",
    lemonSqueezyUrl: "https://shelzysdesigns.lemonsqueezy.com/checkout/buy/1431202",
    etsyUrl: "https://www.etsy.com/listing/4455422930/weekly-meal-planner-google-sheets",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_18_img01.svg"],
  },
  {
    id: 19,
    slug: "meal-planner-auto-grocery-list",
    name: "Meal Planner + Auto Grocery List",
    description:
      "Plan your meals and automatically generate a grocery list based on your recipes. Save time at the store and stick to your budget.",
    price: 5.99,
    category: "productivity",
    tags: ["meal", "planner", "grocery", "auto", "recipes", "shopping"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4455422930/weekly-meal-planner-google-sheets",
    featured: true,
    bestSeller: true,
    images: ["/shelzy_images/shelzy_19_img01.svg"],
  },
  {
    id: 20,
    slug: "workout-tracker",
    name: "Workout Tracker",
    description:
      "Log your workouts, track sets, reps, and personal records over time. Stay consistent and see your fitness progress at a glance.",
    price: 5.99,
    category: "productivity",
    tags: ["workout", "fitness", "tracker", "exercise", "gym"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4455432592/workout-tracker-google-sheets-gym",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_20_img01.svg"],
  },
  {
    id: 21,
    slug: "kids-chore-chart-routine-tracker",
    name: "Kids Chore Chart + Routine Tracker",
    description:
      "Help kids build responsibility with a fun, visual chore chart and daily routine tracker. Customize tasks and reward milestones.",
    price: 5.99,
    category: "productivity",
    tags: ["kids", "chores", "routine", "tracker", "parenting"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4455450716/kids-chore-chart-daily-routine-reward",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_21_img01.svg"],
  },
  {
    id: 22,
    slug: "home-cleaning-organization-planner",
    name: "Home Cleaning + Organization Planner",
    description:
      "Keep your home spotless with a cleaning schedule, room-by-room checklists, and decluttering guides. Works for daily, weekly, and seasonal routines.",
    price: 5.99,
    category: "productivity",
    tags: ["cleaning", "organization", "home", "planner", "declutter"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4455371770/home-organization-planner-2026-cleaning",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_22_img01.svg"],
  },

  // ── Education ─────────────────────────────
  {
    id: 23,
    slug: "student-academic-planner-2026",
    name: "Student Academic Planner 2026",
    description:
      "Stay on top of assignments, exams, and deadlines with an academic planner built for the 2026 school year. Includes GPA tracking and study schedules.",
    price: 5.99,
    category: "education",
    tags: ["student", "academic", "planner", "2026", "school", "GPA"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4455378310/2026-student-planner-spreadsheet-grade",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_23_img01.svg"],
  },
  {
    id: 24,
    slug: "teacher-planner-2026",
    name: "Teacher Planner 2026",
    description:
      "Organize lesson plans, grading, parent communication, and classroom schedules in one place. Designed by educators, for educators.",
    price: 5.99,
    category: "education",
    tags: ["teacher", "planner", "2026", "lessons", "classroom"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4455359615/teacher-planner-2026-google-sheets-excel",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_24_img01.svg"],
  },

  // ── Other Templates (category: productivity or business as appropriate) ──
  {
    id: 25,
    slug: "social-media-planner-2026",
    name: "Social Media Planner 2026",
    description:
      "Plan, schedule, and track your social media content across platforms for the entire year. Includes content calendars and analytics tracking.",
    price: 5.99,
    category: "business",
    tags: ["social media", "planner", "2026", "content", "marketing"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4455352356/2026-social-media-planner-spreadsheet",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_25_img01.svg"],
  },
  {
    id: 26,
    slug: "social-media-content-planner",
    name: "Social Media Content Planner",
    description:
      "Brainstorm, batch, and organize your social media content with a planner that keeps your posting schedule consistent and strategic.",
    price: 5.99,
    category: "business",
    tags: ["social media", "content", "planner", "strategy", "batching"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4453348355/2026-social-media-content-planner-google",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_26_img01.svg"],
  },
  {
    id: 27,
    slug: "ugc-creator-media-kit",
    name: "UGC Creator Media Kit",
    description:
      "Land brand deals with a polished media kit template built for UGC creators. Showcase your stats, portfolio, and rates professionally.",
    price: 5.99,
    category: "business",
    tags: ["UGC", "creator", "media kit", "brand deals", "influencer"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4469948638/ugc-creator-media-kit-template-canva",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_27_img01.svg"],
  },
  {
    id: 28,
    slug: "rental-property-income-tracker",
    name: "Rental Property Income Tracker",
    description:
      "Track rental income, expenses, and ROI across multiple properties. Built for landlords and real estate investors who want clean records.",
    price: 5.99,
    category: "budget-finance",
    tags: ["rental", "property", "income", "real estate", "landlord"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4455461292/rental-property-income-tracker-google",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_28_img01.svg"],
  },
  {
    id: 29,
    slug: "pet-expense-tracker",
    name: "Pet Expense Tracker",
    description:
      "Keep track of vet bills, food, grooming, and all the other costs of pet parenthood. Know exactly what your furry friend costs each month.",
    price: 5.99,
    category: "budget-finance",
    tags: ["pet", "expense", "tracker", "vet", "animals"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4472387217/pet-expense-tracker-spreadsheet-dog-cat",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_29_img01.svg"],
  },
  {
    id: 30,
    slug: "babys-first-year-milestone-tracker",
    name: "Baby's First Year Milestone Tracker",
    description:
      "Capture every precious first with a milestone tracker covering development, feeding, sleep, and memorable moments throughout baby's first year.",
    price: 5.99,
    category: "productivity",
    tags: ["baby", "milestone", "tracker", "first year", "parenting"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4460558570/babys-first-year-milestone-tracker",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_30_img01.svg"],
  },
  {
    id: 31,
    slug: "co-parenting-schedule-planner",
    name: "Co-Parenting Schedule Planner",
    description:
      "Manage custody schedules, shared expenses, and communication logs in one organized planner. Reduce stress and keep things clear for everyone.",
    price: 5.99,
    category: "productivity",
    tags: ["co-parenting", "custody", "schedule", "planner", "family"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4472491170/co-parenting-schedule-planner-google",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_31_img01.svg"],
  },
  {
    id: 32,
    slug: "job-search-command-center",
    name: "Job Search Command Center",
    description:
      "Organize your entire job search with application tracking, interview prep, networking logs, and follow-up reminders all in one powerful dashboard.",
    price: 7.99,
    category: "productivity",
    tags: ["job search", "career", "applications", "interview", "tracker"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4455332835/complete-2026-job-search-tracker-excel",
    featured: true,
    bestSeller: true,
    images: ["/shelzy_images/shelzy_32_img01.svg"],
  },

  // ── Wedding ───────────────────────────────
  {
    id: 33,
    slug: "bridal-shower-planner",
    name: "Bridal Shower Planner",
    description:
      "Plan the perfect bridal shower with templates for guest lists, budgets, timelines, games, and decor. Make the bride-to-be's day special.",
    price: 5.99,
    category: "wedding",
    tags: ["bridal shower", "wedding", "planner", "party", "bride"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4439536794/bridal-shower-planner-spreadsheet-google",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_33_img01.svg"],
  },
  {
    id: 34,
    slug: "wedding-vendor-comparison-tool",
    name: "Wedding Vendor Comparison Tool",
    description:
      "Compare wedding vendors side by side across pricing, availability, reviews, and services. Make confident decisions without the spreadsheet headache.",
    price: 5.99,
    category: "wedding",
    tags: ["wedding", "vendor", "comparison", "planning", "quotes"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4458817296/wedding-vendor-tracker-budget",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_34_img01.svg"],
  },
  {
    id: 35,
    slug: "wedding-budget-tracker",
    name: "Wedding Budget Tracker",
    description:
      "Stay on budget for the big day with a detailed tracker covering every wedding expense category. See what you've spent vs. what's left at a glance.",
    price: 5.99,
    category: "wedding",
    tags: ["wedding", "budget", "tracker", "expenses", "planning"],
    compatibility: "both",
    lemonSqueezyUrl: "https://shelzysdesigns.lemonsqueezy.com/checkout/buy/1431197",
    etsyUrl: "https://www.etsy.com/listing/4458817296/wedding-vendor-tracker-budget",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_35_img01.svg"],
  },
  {
    id: 36,
    slug: "wedding-planning-checklist-budget",
    name: "Wedding Planning Checklist + Budget",
    description:
      "A comprehensive wedding checklist paired with a budget tracker so nothing falls through the cracks. Covers 12+ months of planning milestones.",
    price: 7.99,
    category: "wedding",
    tags: ["wedding", "checklist", "budget", "planning", "timeline"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4453351463/wedding-planning-checklist-budget",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_36_img01.svg"],
  },
  {
    id: 37,
    slug: "interactive-wedding-planner-dashboard",
    name: "Interactive Wedding Planner Dashboard",
    description:
      "The ultimate wedding planning experience with interactive dashboards for budgets, guest lists, seating charts, vendor management, and countdown timers.",
    price: 9.99,
    category: "wedding",
    tags: ["wedding", "dashboard", "interactive", "planner", "all-in-one"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4430861134/interactive-wedding-planner-dashboard",
    featured: true,
    bestSeller: true,
    images: ["/shelzy_images/shelzy_37_img01.svg"],
  },
  {
    id: 38,
    slug: "bachelorette-party-planner",
    name: "Bachelorette Party Planner",
    description:
      "Plan an unforgettable bachelorette party with templates for itineraries, budgets, guest lists, and activity planning.",
    price: 5.99,
    category: "wedding",
    tags: ["bachelorette", "party", "planner", "wedding", "celebration"],
    compatibility: "both",
    lemonSqueezyUrl: "https://shelzysdesigns.lemonsqueezy.com/checkout/buy/1431195",
    etsyUrl: "https://www.etsy.com/listing/4431620170/bachelorette-party-planner-spreadsheet",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_38_img01.svg"],
  },

  // ── Party + Events ────────────────────────
  {
    id: 39,
    slug: "graduation-party-planner",
    name: "Graduation Party Planner",
    description:
      "Celebrate the graduate with a planner covering guest lists, catering, decorations, budget, and day-of timelines. Make it a party to remember.",
    price: 5.99,
    category: "party-events",
    tags: ["graduation", "party", "planner", "celebration", "event"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/shop/ShelzysDesigns",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_39_img01.svg"],
  },
  {
    id: 40,
    slug: "easter-basket-budget-planner",
    name: "Easter Basket Budget Planner",
    description:
      "Plan and budget Easter baskets for the whole family without overspending. Track items, costs, and recipients in one simple planner.",
    price: 3.99,
    category: "party-events",
    tags: ["easter", "basket", "budget", "planner", "holiday"],
    compatibility: "both",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4472597131/easter-basket-budget-planner-spreadsheet",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_40_img01.svg"],
  },

  // ── Save the Dates ────────────────────────
  {
    id: 41,
    slug: "san-jose-skyline-save-the-date",
    name: "San Jose Skyline Save the Date",
    description:
      "A stunning save-the-date card featuring the San Jose skyline. Fully customizable with your names, date, and wedding details.",
    price: 4.99,
    category: "save-the-dates",
    tags: ["save the date", "san jose", "skyline", "wedding", "invitation"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4452708398/san-jose-skyline-save-the-date-hand",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_41_img01.svg"],
  },
  {
    id: 42,
    slug: "hillsboro-lighthouse-save-the-date",
    name: "Hillsboro Lighthouse Save the Date",
    description:
      "A beautiful save-the-date card featuring the Hillsboro Lighthouse. Personalize it with your wedding details for a coastal-inspired announcement.",
    price: 4.99,
    category: "save-the-dates",
    tags: ["save the date", "hillsboro", "lighthouse", "wedding", "coastal"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4458588248/the-hillsboro-club-hillsboro-beach-save",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_42_img01.svg"],
  },
  {
    id: 43,
    slug: "philadelphia-skyline-save-the-date",
    name: "Philadelphia Skyline Save the Date",
    description:
      "Announce your wedding with a save-the-date card showcasing the Philadelphia skyline. Customize with your names, date, and event details.",
    price: 4.99,
    category: "save-the-dates",
    tags: ["save the date", "philadelphia", "skyline", "wedding", "philly"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4452705060/philadelphia-skyline-save-the-date-hand",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_43_img01.svg"],
  },
  {
    id: 44,
    slug: "dallas-skyline-save-the-date",
    name: "Dallas Skyline Save the Date",
    description:
      "A sleek save-the-date card featuring the Dallas skyline. Add your wedding details for a Texas-inspired announcement your guests will love.",
    price: 4.99,
    category: "save-the-dates",
    tags: ["save the date", "dallas", "skyline", "wedding", "texas"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4452707708/dallas-skyline-save-the-date-hand-drawn",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_44_img01.svg"],
  },
  {
    id: 45,
    slug: "austin-skyline-save-the-date",
    name: "Austin Skyline Save the Date",
    description:
      "Share your wedding news with a save-the-date card featuring the Austin skyline. Fully editable with your names and ceremony details.",
    price: 4.99,
    category: "save-the-dates",
    tags: ["save the date", "austin", "skyline", "wedding", "texas"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4452708980/austin-skyline-save-the-date-hand-drawn",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_45_img01.svg"],
  },
  {
    id: 46,
    slug: "chicago-skyline-save-the-date",
    name: "Chicago Skyline Save the Date",
    description:
      "A gorgeous save-the-date card featuring the iconic Chicago skyline. Personalize with your wedding date and details for a memorable first impression.",
    price: 4.99,
    category: "save-the-dates",
    tags: ["save the date", "chicago", "skyline", "wedding", "windy city"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4452698201/chicago-skyline-save-the-date-hand-drawn",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_46_img01.svg"],
  },
  {
    id: 47,
    slug: "los-angeles-skyline-save-the-date",
    name: "Los Angeles Skyline Save the Date",
    description:
      "Set the tone for your big day with a save-the-date card featuring the Los Angeles skyline. Customize it with your wedding information.",
    price: 4.99,
    category: "save-the-dates",
    tags: ["save the date", "los angeles", "LA", "skyline", "wedding"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4452697625/los-angeles-skyline-save-the-date-hand",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_47_img01.svg"],
  },
  {
    id: 48,
    slug: "nyc-skyline-save-the-date",
    name: "NYC Skyline Save the Date",
    description:
      "Announce your wedding in style with a save-the-date card featuring the iconic New York City skyline. Fully customizable for your celebration.",
    price: 4.99,
    category: "save-the-dates",
    tags: ["save the date", "NYC", "new york", "skyline", "wedding"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4452692821/nyc-skyline-save-the-date-template-hand",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_48_img01.svg"],
  },

  // ── Printables + Bundles ──────────────────
  {
    id: 49,
    slug: "bachelorette-scavenger-hunt",
    name: "Bachelorette Scavenger Hunt",
    description:
      "A ready-to-print scavenger hunt game for bachelorette parties. Hilarious prompts and challenges that get everyone laughing and bonding.",
    price: 3.99,
    category: "printables-bundles",
    tags: ["bachelorette", "scavenger hunt", "game", "printable", "party"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4434199130/bachelorette-party-scavenger-hunt",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_49_img01.svg"],
  },
  {
    id: 50,
    slug: "villa-vibes-bachelorette-bundle",
    name: "Villa Vibes Bachelorette Bundle",
    description:
      "Everything you need for a luxury villa bachelorette weekend including itinerary templates, games, decor signs, and planning checklists.",
    price: 9.99,
    category: "printables-bundles",
    tags: ["bachelorette", "bundle", "villa", "luxury", "party"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4457898606/villa-vibes-bachelorette-party-bundle-23",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_50_img01.svg"],
  },
  {
    id: 51,
    slug: "st-patricks-day-kids-activity-bundle",
    name: "St. Patrick's Day Kids Activity Bundle",
    description:
      "Keep kids entertained with a bundle of St. Patrick's Day activities including coloring pages, word searches, and fun printable games.",
    price: 4.99,
    category: "printables-bundles",
    tags: ["st patricks day", "kids", "activities", "bundle", "printable"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4461345391/st-patricks-day-kids-activity-bundle",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_51_img01.svg"],
  },
  {
    id: 52,
    slug: "st-patricks-day-png-bundle",
    name: "St. Patrick's Day PNG Bundle",
    description:
      "A collection of high-quality St. Patrick's Day PNG graphics for crafters, print-on-demand sellers, and digital designers.",
    price: 3.99,
    category: "printables-bundles",
    tags: ["st patricks day", "PNG", "graphics", "bundle", "crafts"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4461340341/st-patricks-day-png-bundle-retro",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_52_img01.svg"],
  },
  {
    id: 53,
    slug: "40-day-lent-devotional-activity-bundle",
    name: "40-Day Lent Devotional Activity Bundle",
    description:
      "A meaningful 40-day Lent journey with daily devotionals, reflection prompts, and family-friendly activities to deepen your faith this season.",
    price: 4.99,
    category: "printables-bundles",
    tags: ["lent", "devotional", "faith", "bundle", "activities"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4461552541/40-days-lent-activity-bundle-for-kids",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_52_img01.svg"],
  },
  {
    id: 54,
    slug: "mothers-day-svg-bundle",
    name: "Mother's Day SVG Bundle",
    description:
      "A curated set of Mother's Day SVG cut files perfect for Cricut and Silhouette projects, t-shirts, mugs, and handmade gifts.",
    price: 3.99,
    category: "printables-bundles",
    tags: ["mothers day", "SVG", "cut files", "bundle", "cricut"],
    compatibility: "pdf",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/listing/4467420325/mothers-day-svg-bundle-mom-life-cut",
    featured: false,
    bestSeller: false,
    images: ["/shelzy_images/shelzy_52_img01.svg"],
  },

  // ── Water Bottles (Physical) ──────────────
  {
    id: 55,
    slug: "personalized-water-bottle",
    name: "Personalized Water Bottle",
    description:
      "A premium stainless steel water bottle with permanent sublimation printing. Your design is fused into the coating, not stuck on top. No peeling, no fading, no scratching. Free personalization on every bottle.",
    price: 34.99,
    category: "water-bottles",
    tags: ["water bottle", "personalized", "sublimation", "custom", "gift"],
    compatibility: "physical",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/shop/ShelzysDesigns",
    featured: true,
    bestSeller: true,
    images: [],
  },
  {
    id: 56,
    slug: "wedding-water-bottle-set",
    name: "Wedding Water Bottle Set",
    description:
      "Beautiful personalized bottles for bridesmaids, groomsmen, and the bridal party. Permanent sublimation printing means your bottles look perfect from the proposal box to the reception table. Wedding-ready in 5-7 business days.",
    price: 34.99,
    category: "water-bottles",
    tags: ["water bottle", "wedding", "bridesmaid", "personalized", "bridal party"],
    compatibility: "physical",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/shop/ShelzysDesigns",
    featured: true,
    bestSeller: false,
    images: [],
  },
  {
    id: 57,
    slug: "bachelorette-party-water-bottles",
    name: "Bachelorette Party Water Bottles",
    description:
      "Matching personalized bottles for the whole crew. Perfect for Nashville trips, beach weekends, lake houses, and girls' getaways. Customize with names, nicknames, or party themes. Bulk pricing available.",
    price: 34.99,
    category: "water-bottles",
    tags: ["water bottle", "bachelorette", "party", "personalized", "matching"],
    compatibility: "physical",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/shop/ShelzysDesigns",
    featured: false,
    bestSeller: false,
    images: [],
  },
  {
    id: 58,
    slug: "kids-personalized-water-bottle",
    name: "Kids Personalized Water Bottle",
    description:
      "Durable personalized bottles for school, sports, dance, and everyday adventures. Sublimation printing means the design survives backpacks, lunchboxes, and daily drops. Add any name or team design.",
    price: 29.99,
    category: "water-bottles",
    tags: ["water bottle", "kids", "school", "sports", "personalized"],
    compatibility: "physical",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/shop/ShelzysDesigns",
    featured: false,
    bestSeller: false,
    images: [],
  },
  {
    id: 59,
    slug: "corporate-bulk-water-bottles",
    name: "Corporate + Bulk Water Bottles",
    description:
      "Branded bottles for team retreats, conferences, employee appreciation, and client gifts. Professional quality with consistent branding. Bulk pricing for orders of 10 or more. Contact for a custom quote.",
    price: 29.99,
    category: "water-bottles",
    tags: ["water bottle", "corporate", "bulk", "branded", "business gifts"],
    compatibility: "physical",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/shop/ShelzysDesigns",
    featured: false,
    bestSeller: false,
    images: [],
  },
  {
    id: 60,
    slug: "holiday-water-bottle",
    name: "Holiday Water Bottle",
    description:
      "Limited edition holiday designs for Christmas, Valentine's Day, and seasonal celebrations. Personalized holiday bottles make perfect gifts for teachers, coworkers, family, and friends.",
    price: 34.99,
    category: "water-bottles",
    tags: ["water bottle", "holiday", "christmas", "gift", "seasonal"],
    compatibility: "physical",
    lemonSqueezyUrl: "#",
    etsyUrl: "https://www.etsy.com/shop/ShelzysDesigns",
    featured: false,
    bestSeller: false,
    images: [],
  },
];

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

const categories: Category[] = [
  {
    slug: "budget-finance",
    name: "Budget + Finance",
    description:
      "Take control of every dollar with smart budget trackers and finance planners",
  },
  {
    slug: "business",
    name: "Business Tools",
    description:
      "Run your business like a boss with profit calculators and planners",
  },
  {
    slug: "productivity",
    name: "Productivity + Life",
    description:
      "Organize your life with ADHD-friendly dashboards, meal planners, and more",
  },
  {
    slug: "education",
    name: "Education",
    description: "Academic and teacher planners built for the school year",
  },
  {
    slug: "wedding",
    name: "Wedding Planning",
    description: "Plan your perfect day, stress-free",
  },
  {
    slug: "party-events",
    name: "Party + Events",
    description: "Make every celebration unforgettable",
  },
  {
    slug: "save-the-dates",
    name: "Save the Dates",
    description:
      "Beautiful city skyline save-the-date cards for your big day",
  },
  {
    slug: "printables-bundles",
    name: "Printables + Bundles",
    description:
      "Curated bundles and printable activities at a discount",
  },
  {
    slug: "water-bottles",
    name: "Personalized Water Bottles",
    description:
      "Premium stainless steel water bottles with permanent sublimation printing. Free personalization on every bottle.",
  },
];

// ─────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getBestSellers(): Product[] {
  return products.filter((p) => p.bestSeller);
}

export function getAllCategories(): Category[] {
  return categories;
}
