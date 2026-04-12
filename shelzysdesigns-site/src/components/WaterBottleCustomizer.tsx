"use client";

import { useState } from "react";

interface WaterBottleCustomizerProps {
  productName: string;
  etsyUrl: string;
  price: number;
}

export default function WaterBottleCustomizer({
  productName,
  etsyUrl,
  price,
}: WaterBottleCustomizerProps) {
  const [customText, setCustomText] = useState("");
  const [font, setFont] = useState("script");
  const [submitted, setSubmitted] = useState(false);

  const fontOptions = [
    { value: "script", label: "Script (Cursive)" },
    { value: "block", label: "Block (Bold Print)" },
    { value: "serif", label: "Serif (Classic)" },
    { value: "sans", label: "Sans-Serif (Modern)" },
  ];

  const handleOrderOnEtsy = () => {
    // Build Etsy URL with personalization note in the message
    const note = encodeURIComponent(
      `Personalization: ${customText} | Font style: ${fontOptions.find(f => f.value === font)?.label ?? font}`
    );
    const finalUrl = etsyUrl.includes("?")
      ? `${etsyUrl}&message_to_seller=${note}`
      : `${etsyUrl}?message_to_seller=${note}`;
    window.open(finalUrl, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };

  return (
    <div className="bg-light-gray rounded-xl p-6 mb-6">
      <h3 className="font-heading font-bold text-charcoal text-lg mb-1">
        Personalize Your Bottle
      </h3>
      <p className="text-text-light text-sm mb-5">
        Your customization is permanently fused into the coating. No peeling, no fading.
      </p>

      {/* Name / Text field */}
      <div className="mb-4">
        <label className="block font-heading font-semibold text-sm text-charcoal mb-2">
          Name or Custom Text
          <span className="text-pink ml-1">*</span>
        </label>
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="e.g. Sarah, The Smith Family, Bride Squad"
          maxLength={40}
          className="w-full border border-mid-gray rounded-lg px-4 py-3 text-charcoal font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent bg-white"
        />
        <p className="text-text-light text-xs mt-1">{customText.length}/40 characters</p>
      </div>

      {/* Font style */}
      <div className="mb-5">
        <label className="block font-heading font-semibold text-sm text-charcoal mb-2">
          Font Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {fontOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFont(option.value)}
              className={`text-sm px-3 py-2.5 rounded-lg border font-body transition ${
                font === option.value
                  ? "border-pink bg-pink text-white font-semibold"
                  : "border-mid-gray bg-white text-charcoal hover:border-pink"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Note about process */}
      <div className="flex gap-3 bg-white rounded-lg p-3 mb-5 border border-mid-gray">
        <span className="text-orange text-lg flex-shrink-0">ℹ</span>
        <p className="text-text-light text-xs leading-relaxed">
          You will complete your order on Etsy. Your personalization details above will be pre-filled in the message to seller. Production takes 3-5 business days after order confirmation.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={handleOrderOnEtsy}
        disabled={!customText.trim()}
        className={`w-full font-heading font-semibold text-center py-4 rounded-lg transition text-white ${
          customText.trim()
            ? "bg-pink hover:bg-pink-hover cursor-pointer"
            : "bg-mid-gray cursor-not-allowed"
        }`}
      >
        {customText.trim()
          ? `Order on Etsy — $${price.toFixed(2)}`
          : "Enter your personalization above"}
      </button>

      {submitted && (
        <p className="text-center text-sm text-teal mt-3 font-semibold">
          Opening Etsy with your personalization details...
        </p>
      )}

      <p className="text-center text-xs text-text-light mt-3">
        Free personalization on every bottle. Questions?{" "}
        <a href="/contact" className="text-pink hover:underline">
          Contact us
        </a>
      </p>
    </div>
  );
}
