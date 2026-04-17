interface TrustBadgesProps {
  variant?: "physical" | "digital" | "all";
}

const downloadIcon = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const penIcon = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const truckIcon = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 5v3h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const gridIcon = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);

const lockIcon = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const shieldIcon = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const physicalBadges = [
  { label: "Free Personalization", icon: penIcon },
  { label: "Ships in 3-5 Days", icon: truckIcon },
  { label: "Permanent Sublimation Print", icon: shieldIcon },
  { label: "Secure Checkout", icon: lockIcon },
];

const digitalBadges = [
  { label: "Instant Download", icon: downloadIcon },
  { label: "Excel + Google Sheets", icon: gridIcon },
  { label: "Secure Checkout", icon: lockIcon },
  { label: "Satisfaction Guaranteed", icon: shieldIcon },
];

const allBadges = [
  { label: "Instant Download", icon: downloadIcon },
  { label: "Free Personalization", icon: penIcon },
  { label: "Ships in 3-5 Days", icon: truckIcon },
  { label: "Excel + Google Sheets", icon: gridIcon },
  { label: "Secure Checkout", icon: lockIcon },
  { label: "Satisfaction Guaranteed", icon: shieldIcon },
];

export default function TrustBadges({ variant = "all" }: TrustBadgesProps) {
  const badges =
    variant === "physical"
      ? physicalBadges
      : variant === "digital"
      ? digitalBadges
      : allBadges;

  return (
    <div className="flex flex-wrap justify-center gap-8 py-8">
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex flex-col items-center text-center gap-2"
        >
          <div className="text-charcoal">{badge.icon}</div>
          <span className="text-text-light text-sm">{badge.label}</span>
        </div>
      ))}
    </div>
  );
}
