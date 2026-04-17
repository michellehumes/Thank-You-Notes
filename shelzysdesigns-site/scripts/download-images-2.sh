#!/bin/bash
# Part 2: Budget, Business, Productivity product images

OUT="/Users/michellehumes/shelzysdesigns-site/public/product_images"
mkdir -p "$OUT"

download() {
  local slug="$1"
  local url="$2"
  local dest="$OUT/${slug}.jpg"
  if [ -f "$dest" ] && [ "$(wc -c < "$dest")" -gt 5000 ]; then
    echo "  SKIP  $slug"
    return
  fi
  local code
  code=$(curl -s -L -o "$dest" -w "%{http_code}" \
    -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120" \
    "$url")
  local size
  size=$(wc -c < "$dest" 2>/dev/null || echo 0)
  if [ "$code" = "200" ] && [ "$size" -gt 5000 ]; then
    echo "   OK   $slug (${size}B)"
  else
    echo "  ERR   $slug (HTTP $code, ${size}B)"
    rm -f "$dest"
  fi
}

echo "Downloading remaining product images..."

# Budget + Finance
download "monthly-budget-tracker"          "https://i.etsystatic.com/63598191/r/il/52bc20/7826954915/il_794xN.7826954915_22ok.jpg"
download "paycheck-budget-planner"         "https://i.etsystatic.com/63598191/r/il/00899d/7820188681/il_794xN.7820188681_2rqr.jpg"
download "digital-cash-stuffing-system"    "https://i.etsystatic.com/63598191/r/il/7aca50/7832528613/il_794xN.7832528613_c6d4.jpg"
download "family-budget-planner"           "https://i.etsystatic.com/63598191/r/il/1e3328/7796518682/il_794xN.7796518682_pe1r.jpg"
download "2026-annual-budget-planner"      "https://i.etsystatic.com/63598191/r/il/0c5a3d/7826983125/il_794xN.7826983125_ebzm.jpg"
download "debt-payoff-tracker"             "https://i.etsystatic.com/63598191/r/il/4f838d/7808832654/il_794xN.7808832654_jjd8.jpg"
download "debt-payoff-savings-tracker"     "https://i.etsystatic.com/63598191/r/il/bfe4e5/7779193236/il_794xN.7779193236_3iq7.jpg"

# Business
download "small-business-planner-2026"     "https://i.etsystatic.com/63598191/r/il/f7a60f/7780746452/il_794xN.7780746452_t00i.jpg"
download "side-hustle-income-expense-tracker" "https://i.etsystatic.com/63598191/r/il/e35d7d/7780762044/il_794xN.7780762044_6ugx.jpg"
download "12-month-side-hustle-log"        "https://i.etsystatic.com/63598191/r/il/ab3828/7796586990/il_794xN.7796586990_6wp7.jpg"
download "business-finance-net-worth-dashboard" "https://i.etsystatic.com/63598191/r/il/8bbd4b/7802134872/il_794xN.7802134872_7pur.jpg"
download "etsy-seller-analytics-dashboard" "https://i.etsystatic.com/63598191/r/il/b39ea6/7827080499/il_794xN.7827080499_8t5s.jpg"
download "etsy-seller-profit-calculator"   "https://i.etsystatic.com/63598191/r/il/b39ea6/7827080499/il_794xN.7827080499_8t5s.jpg"

# Productivity
download "adhd-life-dashboard"             "https://i.etsystatic.com/63598191/r/il/9a8252/7819819061/il_794xN.7819819061_ihvq.jpg"
download "project-goal-tracker"            "https://i.etsystatic.com/63598191/r/il/ca4099/7827089847/il_794xN.7827089847_q5ij.jpg"
download "moving-day-planner"              "https://i.etsystatic.com/63598191/r/il/c4fd4b/7772269076/il_794xN.7772269076_gtiu.jpg"

# Save the dates (from page 2 - san jose already done; others need direct listing access)
# Using san jose image as placeholder for other save-the-dates with same style
download "hillsboro-lighthouse-save-the-date"    "https://i.etsystatic.com/63598191/r/il/8909a3/7724863045/il_794xN.7724863045_ig80.jpg"
download "philadelphia-skyline-save-the-date"    "https://i.etsystatic.com/63598191/r/il/8909a3/7724863045/il_794xN.7724863045_ig80.jpg"
download "dallas-skyline-save-the-date"          "https://i.etsystatic.com/63598191/r/il/8909a3/7724863045/il_794xN.7724863045_ig80.jpg"
download "austin-skyline-save-the-date"          "https://i.etsystatic.com/63598191/r/il/8909a3/7724863045/il_794xN.7724863045_ig80.jpg"
download "chicago-skyline-save-the-date"         "https://i.etsystatic.com/63598191/r/il/8909a3/7724863045/il_794xN.7724863045_ig80.jpg"
download "los-angeles-skyline-save-the-date"     "https://i.etsystatic.com/63598191/r/il/8909a3/7724863045/il_794xN.7724863045_ig80.jpg"
download "nyc-skyline-save-the-date"             "https://i.etsystatic.com/63598191/r/il/8909a3/7724863045/il_794xN.7724863045_ig80.jpg"

echo ""
ls "$OUT"/*.jpg 2>/dev/null | wc -l
echo "total jpg files"
