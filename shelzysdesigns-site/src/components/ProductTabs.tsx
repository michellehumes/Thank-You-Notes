"use client";

import { useState } from "react";

interface ProductTabsProps {
  category: string;
  compatibility: "excel" | "sheets" | "both" | "pdf" | "physical";
  productName: string;
}

const tabs = ["What's Included", "How It Works", "FAQ"] as const;
type Tab = (typeof tabs)[number];

function getIncludedItems(category: string): string[] {
  switch (category) {
    case "budget-finance":
      return [
        "Pre-built budget categories with auto-calculating formulas",
        "Monthly and yearly overview dashboards",
        "Expense tracking with visual breakdowns",
        "Savings goal tracker with progress bars",
        "Printable summary sheet for quick reference",
      ];
    case "business":
      return [
        "Revenue and expense tracking with built-in formulas",
        "Profit and loss summary dashboard",
        "Client or project management tabs",
        "Quarterly and annual reporting views",
        "Customizable fields to fit your business",
      ];
    case "productivity":
      return [
        "Daily, weekly, and monthly planning layouts",
        "Habit and goal tracking with visual progress",
        "Priority matrix for task management",
        "Notes and reflection sections",
        "Color-coded categories for easy organization",
      ];
    case "education":
      return [
        "Assignment and grade tracking with auto-calculations",
        "Semester overview and course planner",
        "Study schedule and exam prep sections",
        "GPA calculator with weighted grading",
        "Printable study checklist",
      ];
    case "wedding":
      return [
        "Full wedding planning timeline and checklist",
        "Budget tracker with vendor payment schedule",
        "Guest list manager with RSVP tracking",
        "Seating chart planner",
        "Day-of timeline and contact list",
      ];
    case "party-events":
      return [
        "Event planning checklist and timeline",
        "Budget tracker with category breakdowns",
        "Guest list with RSVP status tracking",
        "Vendor contact and payment tracker",
        "Decoration and supply planning sheets",
      ];
    case "save-the-dates":
      return [
        "High-resolution printable design files",
        "Multiple city skyline options",
        "Editable text fields for your details",
        "Print-at-home and professional print versions",
        "Matching envelope liner template",
      ];
    case "printables-bundles":
      return [
        "Multiple coordinated templates in one download",
        "Mix of planners, trackers, and organizational tools",
        "Consistent design across all included files",
        "Bonus quick-start guide",
        "Lifetime access to bundle updates",
      ];
    default:
      return [
        "Professionally designed template with clean layout",
        "Auto-calculating formulas built in",
        "Easy-to-follow instructions included",
        "Fully customizable fields and categories",
        "Printable version included",
      ];
  }
}

function getCompatibilityText(compatibility: string): string {
  switch (compatibility) {
    case "both":
      return "Excel (.xlsx) and Google Sheets";
    case "excel":
      return "Excel (.xlsx)";
    case "sheets":
      return "Google Sheets";
    case "pdf":
      return "PDF";
    default:
      return "Excel and Google Sheets";
  }
}

function getFormatAnswer(compatibility: string): string {
  switch (compatibility) {
    case "both":
      return "This template comes as an .xlsx file that works in both Microsoft Excel and Google Sheets. Just download and open in your preferred app.";
    case "excel":
      return "This template comes as an .xlsx file designed for Microsoft Excel. For the best experience, we recommend using Excel on desktop.";
    case "sheets":
      return "This template is built for Google Sheets. After purchase, you will receive a link to make your own copy.";
    case "pdf":
      return "This product is delivered as a high-resolution PDF file. You can print it at home or send it to a professional printer.";
    default:
      return "This template works with Excel and Google Sheets.";
  }
}

export default function ProductTabs({
  category,
  compatibility,
  productName,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("What's Included");

  const includedItems = getIncludedItems(category);
  const compatText = getCompatibilityText(compatibility);

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex border-b border-mid-gray">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-heading font-semibold transition ${
              activeTab === tab
                ? "text-pink border-b-2 border-pink"
                : "text-text-light hover:text-charcoal"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-8 px-2">
        {activeTab === "What's Included" && (
          <ul className="space-y-3">
            {includedItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-charcoal">
                <svg
                  className="w-5 h-5 text-pink flex-shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === "How It Works" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Purchase and Download",
                description:
                  "Complete your purchase and get instant access to your file. Check your email for the download link.",
              },
              {
                step: "2",
                title: `Open in ${compatText}`,
                description:
                  compatibility === "pdf"
                    ? "Open the PDF in any viewer or send it to your printer. No special software needed."
                    : "Open the file in your preferred spreadsheet app. All formulas and formatting are ready to go.",
              },
              {
                step: "3",
                title: "Start Using It",
                description:
                  "Fill in your own data and make it yours. Everything is set up so you can start right away.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-pink text-white flex items-center justify-center font-heading font-bold text-lg mx-auto mb-3">
                  {item.step}
                </div>
                <h4 className="font-heading font-semibold text-charcoal mb-2">
                  {item.title}
                </h4>
                <p className="text-text-light text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "FAQ" && (
          <div className="space-y-6">
            <div>
              <h4 className="font-heading font-semibold text-charcoal mb-2">
                What file format will I receive?
              </h4>
              <p className="text-text-light text-sm">
                {getFormatAnswer(compatibility)}
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-charcoal mb-2">
                Can I customize the {productName}?
              </h4>
              <p className="text-text-light text-sm">
                {compatibility === "pdf"
                  ? "The text fields in this PDF are editable, so you can add your own details before printing. The overall design layout is fixed to keep everything looking polished."
                  : "Yes! All cells, categories, and labels are fully editable. You can adjust colors, rename tabs, and add or remove rows to fit your needs. The formulas will update automatically."}
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-charcoal mb-2">
                What is the refund policy?
              </h4>
              <p className="text-text-light text-sm">
                Because this is a digital product with instant delivery, all
                sales are final. If you experience any issues with your file, reach
                out to us and we will make it right.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
