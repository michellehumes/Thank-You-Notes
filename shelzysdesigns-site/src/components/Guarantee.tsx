interface GuaranteeProps {
  variant?: "digital" | "physical";
}

export default function Guarantee({ variant = "digital" }: GuaranteeProps) {
  const items =
    variant === "physical"
      ? [
          { label: "Permanent Print", sub: "No peeling, dishwasher safe" },
          { label: "Free Personalization", sub: "Included on every bottle" },
          { label: "Ships 3–5 Days", sub: "From our small studio" },
          { label: "Real Support", sub: "Michelle replies personally" },
        ]
      : [
          { label: "Instant Download", sub: "Delivered the moment you buy" },
          { label: "Lifetime Access", sub: "Re-download anytime" },
          { label: "Works Everywhere", sub: "Excel, Google Sheets, PDF" },
          { label: "Real Support", sub: "Michelle replies personally" },
        ];

  return (
    <div
      className="rounded-2xl p-6 sm:p-7 my-10"
      style={{ background: "var(--color-cream)", border: "1px solid var(--color-mid-gray)" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-pink)" aria-hidden="true">
          <path d="M12 1l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 1z" />
        </svg>
        <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink">
          Shelzy&apos;s Guarantee
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {items.map((item) => (
          <div key={item.label}>
            <p className="font-heading font-bold text-sm text-charcoal mb-1">{item.label}</p>
            <p className="text-text-light text-xs leading-relaxed">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
