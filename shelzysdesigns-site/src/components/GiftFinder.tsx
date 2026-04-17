"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { findGifts, quizSchema, type QuizAnswers, type ScoredProduct } from "@/lib/giftFinder";

const questions = [
  { key: "recipient", label: "Who is it for?", options: quizSchema.recipient },
  { key: "occasion", label: "What's the occasion?", options: quizSchema.occasion },
  { key: "style", label: "What's their style?", options: quizSchema.style },
  { key: "format", label: "Digital or physical?", options: quizSchema.format },
  { key: "price", label: "What's the budget?", options: quizSchema.price },
  { key: "timing", label: "When do you need it?", options: quizSchema.timing },
] as const;

type Partial<T> = { [K in keyof T]?: T[K] };

export default function GiftFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [results, setResults] = useState<ScoredProduct[] | null>(null);

  const total = questions.length;
  const current = questions[step];

  function choose(value: string) {
    const nextAnswers = { ...answers, [current.key]: value } as Partial<QuizAnswers>;
    setAnswers(nextAnswers);

    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      const matches = findGifts(nextAnswers as QuizAnswers, 6);
      setResults(matches);
    }
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setResults(null);
  }

  // ── Results view ─────────────────────────────
  if (results) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="text-center mb-12">
          <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink mb-3 block">
            Your matches
          </span>
          <h1
            className="font-display font-extrabold text-charcoal mb-3"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
          >
            Gifts we picked for you
          </h1>
          <p className="text-text-light text-sm max-w-md mx-auto">
            Based on your answers — ranked from best match. Tap any to see it in full.
          </p>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-light mb-6">
              We didn&apos;t find a strong match. Browse best sellers instead?
            </p>
            <Link
              href="/collections/best-sellers"
              className="inline-flex items-center gap-2 bg-pink hover:bg-pink-hover text-white font-heading font-bold text-sm px-8 py-4 rounded-full transition-colors"
            >
              Shop Best Sellers →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {results.map(({ product }) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button
            onClick={reset}
            className="font-heading font-bold text-[11px] tracking-widest uppercase text-charcoal hover:text-pink transition-colors underline underline-offset-4"
          >
            ← Start over
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz view ────────────────────────────────
  const progress = ((step + 1) / total) * 100;

  return (
    <div className="mx-auto max-w-[720px] px-6 py-16 sm:py-24">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="font-heading text-[10px] font-bold tracking-widest uppercase text-pink">
            Question {step + 1} of {total}
          </span>
          <button
            onClick={reset}
            className="font-heading text-[10px] font-semibold tracking-widest uppercase text-text-light hover:text-charcoal transition-colors"
          >
            Reset
          </button>
        </div>
        <div className="h-1.5 bg-mid-gray rounded-full overflow-hidden">
          <div
            className="h-full bg-pink transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h1
        className="font-display font-extrabold text-charcoal mb-10 text-center"
        style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
      >
        {current.label}
      </h1>

      {/* Options */}
      <div className={`grid gap-4 ${current.options.length > 4 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
        {current.options.map((opt) => {
          const hasSub = "sub" in opt;
          return (
            <button
              key={opt.value}
              onClick={() => choose(opt.value)}
              className="group rounded-2xl bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-pink"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              <span className="block font-heading font-bold text-charcoal text-base group-hover:text-pink transition-colors">
                {opt.label}
              </span>
              {hasSub && (
                <span className="block text-text-light text-xs mt-1">{(opt as { sub: string }).sub}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Back button */}
      {step > 0 && (
        <div className="text-center mt-10">
          <button
            onClick={() => setStep(step - 1)}
            className="font-heading font-bold text-[11px] tracking-widest uppercase text-text-light hover:text-charcoal transition-colors"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
