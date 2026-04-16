#!/bin/bash
# Downloads actual Etsy product images to public/shelzy_images/
# Format: curl -s -o DEST "URL"

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

echo "Downloading Etsy product images..."

# Water Bottles
download "personalized-water-bottle"        "https://i.etsystatic.com/63598191/r/il/c9060d/7863448495/il_794xN.7863448495_3ia3.jpg"
download "wedding-water-bottle-set"         "https://i.etsystatic.com/63598191/c/1600/1600/14/0/il/48677e/7602553296/il_794xN.7602553296_o6qp.jpg"
download "bachelorette-party-water-bottles" "https://i.etsystatic.com/63598191/r/il/e292f2/7815691849/il_794xN.7815691849_aknd.jpg"
download "kids-personalized-water-bottle"   "https://i.etsystatic.com/63598191/r/il/373915/7784820992/il_794xN.7784820992_rdit.jpg"
download "corporate-bulk-water-bottles"     "https://i.etsystatic.com/63598191/r/il/a22057/7570978605/il_794xN.7570978605_2542.jpg"
download "holiday-water-bottle"             "https://i.etsystatic.com/63598191/r/il/76e93a/7699183101/il_794xN.7699183101_eujf.jpg"

# Budget + Finance
download "pet-expense-tracker"              "https://i.etsystatic.com/63598191/r/il/617c7d/7856534751/il_794xN.7856534751_ema8.jpg"
download "rental-property-income-tracker"   "https://i.etsystatic.com/63598191/r/il/80739c/7779181102/il_794xN.7779181102_evm0.jpg"
download "easter-basket-budget-planner"     "https://i.etsystatic.com/63598191/r/il/d3d446/7809188832/il_794xN.7809188832_k9rr.jpg"

# Productivity
download "co-parenting-schedule-planner"    "https://i.etsystatic.com/63598191/r/il/b741d7/7808776854/il_794xN.7808776854_9keh.jpg"
download "workout-tracker"                  "https://i.etsystatic.com/63598191/r/il/548001/7779078236/il_794xN.7779078236_aurc.jpg"
download "weekly-meal-planner"              "https://i.etsystatic.com/63598191/r/il/2674e6/7780724626/il_794xN.7780724626_q7qm.jpg"
download "meal-planner-auto-grocery-list"   "https://i.etsystatic.com/63598191/r/il/2674e6/7780724626/il_794xN.7780724626_q7qm.jpg"
download "vacation-trip-planner"            "https://i.etsystatic.com/63598191/r/il/c033ab/7819878571/il_794xN.7819878571_rdrc.jpg"
download "kids-chore-chart-routine-tracker" "https://i.etsystatic.com/63598191/r/il/c457dd/7780723684/il_794xN.7780723684_els6.jpg"
download "home-cleaning-organization-planner" "https://i.etsystatic.com/63598191/r/il/9b87d7/7827012633/il_794xN.7827012633_j5ix.jpg"

# Education
download "student-academic-planner-2026"   "https://i.etsystatic.com/63598191/r/il/0d328d/7780744520/il_794xN.7780744520_jsda.jpg"
download "teacher-planner-2026"             "https://i.etsystatic.com/63598191/r/il/ec47a7/7954125101/il_794xN.7954125101_396s.jpg"

# Business
download "social-media-planner-2026"       "https://i.etsystatic.com/63598191/r/il/66e7bd/7760796422/il_794xN.7760796422_3hqx.jpg"
download "social-media-content-planner"    "https://i.etsystatic.com/63598191/r/il/3fb140/7828692163/il_794xN.7828692163_o1k1.jpg"
download "ugc-creator-media-kit"           "https://i.etsystatic.com/63598191/r/il/62b537/7856760655/il_794xN.7856760655_96f5.jpg"
download "job-search-command-center"       "https://i.etsystatic.com/63598191/r/il/af56fb/7825839697/il_794xN.7825839697_954k.jpg"

# Wedding
download "bridal-shower-planner"           "https://i.etsystatic.com/63598191/r/il/5cdd38/7827088783/il_794xN.7827088783_1gyr.jpg"
download "wedding-vendor-comparison-tool"  "https://i.etsystatic.com/63598191/r/il/b1d17a/7827014685/il_794xN.7827014685_9rja.jpg"
download "wedding-budget-tracker"          "https://i.etsystatic.com/63598191/r/il/b1d17a/7827014685/il_794xN.7827014685_9rja.jpg"
download "wedding-planning-checklist-budget" "https://i.etsystatic.com/63598191/r/il/60f538/7828674575/il_794xN.7828674575_guxy.jpg"
download "bachelorette-party-planner"      "https://i.etsystatic.com/63598191/r/il/c9060d/7863448495/il_794xN.7863448495_3ia3.jpg"
download "wedding-planning-bundle"         "https://i.etsystatic.com/63598191/r/il/841c5f/7832943298/il_794xN.7832943298_98yn.jpg"
download "coastal-bridal-shower-games"     "https://i.etsystatic.com/63598191/r/il/e90aa2/7960599191/il_794xN.7960599191_byzq.jpg"

# Printables + Bundles
download "bachelorette-scavenger-hunt"     "https://i.etsystatic.com/63598191/r/il/d6eae6/7826943377/il_794xN.7826943377_o1st.jpg"
download "mothers-day-svg-bundle"          "https://i.etsystatic.com/63598191/r/il/46027b/7825390817/il_794xN.7825390817_calw.jpg"

# Save the Dates
download "san-jose-skyline-save-the-date"  "https://i.etsystatic.com/63598191/r/il/8909a3/7724863045/il_794xN.7724863045_ig80.jpg"

echo ""
echo "Done. Images in $OUT"
ls -la "$OUT" | grep -c ".jpg" && echo "jpg files downloaded"
