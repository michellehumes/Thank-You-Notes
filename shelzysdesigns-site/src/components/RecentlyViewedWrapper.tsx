"use client";

import { useEffect } from "react";
import RecentlyViewed, { trackProductView } from "@/components/RecentlyViewed";

export default function RecentlyViewedWrapper({ currentSlug }: { currentSlug: string }) {
  useEffect(() => {
    trackProductView(currentSlug);
  }, [currentSlug]);

  return <RecentlyViewed currentSlug={currentSlug} />;
}
