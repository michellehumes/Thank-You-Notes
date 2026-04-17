interface ReviewStarsProps {
  rating?: number;       // default 4.9
  count?: number;        // default undefined
  size?: "sm" | "md";    // default sm
  showCount?: boolean;   // default true
  className?: string;
}

export default function ReviewStars({
  rating = 4.9,
  count,
  size = "sm",
  showCount = true,
  className = "",
}: ReviewStarsProps) {
  const px = size === "md" ? 16 : 12;
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full || (i === full && hasHalf);
          return (
            <svg
              key={i}
              width={px}
              height={px}
              viewBox="0 0 24 24"
              fill={filled ? "var(--color-orange)" : "var(--color-mid-gray)"}
              aria-hidden="true"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          );
        })}
      </span>
      {showCount && (
        <span
          className="font-heading font-semibold text-text-light"
          style={{ fontSize: size === "md" ? "0.75rem" : "0.6875rem" }}
        >
          {rating.toFixed(1)}
          {count !== undefined ? ` · ${count.toLocaleString()}` : ""}
        </span>
      )}
    </span>
  );
}
