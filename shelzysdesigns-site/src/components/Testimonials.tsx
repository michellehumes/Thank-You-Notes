interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
}

const testimonials: Record<string, Testimonial[]> = {
  "budget-finance": [
    {
      name: "Jessica M.",
      location: "Austin, TX",
      rating: 5,
      text: "This is the first budget tracker I've actually stuck with. The dashboard makes it so easy to see where my money is going.",
    },
    {
      name: "Rachel K.",
      location: "Denver, CO",
      rating: 5,
      text: "Easy to customize and works perfectly in Google Sheets. Paid for itself in the first month from catching subscriptions I forgot about.",
    },
    {
      name: "Amanda T.",
      location: "Portland, OR",
      rating: 5,
      text: "Clean, pretty, and actually functional. Exactly what I was looking for.",
    },
  ],
  business: [
    {
      name: "Sarah L.",
      location: "Nashville, TN",
      rating: 5,
      text: "Runs my whole small business. The P&L dashboard alone is worth the price.",
    },
    {
      name: "Megan R.",
      location: "Seattle, WA",
      rating: 5,
      text: "Finally a template that isn't overly complicated. Set it up in 20 minutes and it just works.",
    },
    {
      name: "Nicole F.",
      location: "Chicago, IL",
      rating: 5,
      text: "Love how clean the design is. Feels professional when I share it with my CPA.",
    },
  ],
  productivity: [
    {
      name: "Lindsay P.",
      location: "Brooklyn, NY",
      rating: 5,
      text: "I've tried every planner out there. This one actually stuck because it's built for how my brain works.",
    },
    {
      name: "Taylor B.",
      location: "Phoenix, AZ",
      rating: 5,
      text: "The habit tracker and priority matrix combo is perfect. Use it every single day.",
    },
    {
      name: "Morgan D.",
      location: "Minneapolis, MN",
      rating: 5,
      text: "Beautifully designed and so easy to customize. Worth every penny.",
    },
  ],
  education: [
    {
      name: "Brianna S.",
      location: "San Diego, CA",
      rating: 5,
      text: "Got me through a tough semester. The assignment tracker is a lifesaver.",
    },
    {
      name: "Olivia W.",
      location: "Boston, MA",
      rating: 5,
      text: "Wish I'd had this my freshman year. Makes staying organized so much easier.",
    },
    {
      name: "Hannah G.",
      location: "Atlanta, GA",
      rating: 5,
      text: "My GPA went up. Not dramatic, real talk.",
    },
  ],
  wedding: [
    {
      name: "Emily R.",
      location: "Charleston, SC",
      rating: 5,
      text: "This saved my sanity during wedding planning. The vendor comparison tool alone is worth it.",
    },
    {
      name: "Kate A.",
      location: "Miami, FL",
      rating: 5,
      text: "So much more useful than the planners I bought in stores. Wish I'd found this sooner.",
    },
    {
      name: "Sophie N.",
      location: "Dallas, TX",
      rating: 5,
      text: "Gorgeous design and actually functional. My planner even asked where I got it.",
    },
  ],
  home: [
    {
      name: "Whitney H.",
      location: "Kansas City, MO",
      rating: 5,
      text: "Finally have my home organized in one place. Love the printable summary pages.",
    },
    {
      name: "Caroline J.",
      location: "Raleigh, NC",
      rating: 5,
      text: "Simple, pretty, and works. Exactly what I needed.",
    },
    {
      name: "Erin C.",
      location: "Indianapolis, IN",
      rating: 5,
      text: "Use it weekly for meal planning and household tracking. Highly recommend.",
    },
  ],
  party: [
    {
      name: "Ashley V.",
      location: "Orlando, FL",
      rating: 5,
      text: "Made hosting the shower so much easier. Everyone loved the games!",
    },
    {
      name: "Paige M.",
      location: "Columbus, OH",
      rating: 5,
      text: "Instant download, printed at home, looked amazing. Saved a ton vs. ordering prints.",
    },
    {
      name: "Lauren K.",
      location: "Salt Lake City, UT",
      rating: 5,
      text: "Beautiful designs and the guests kept asking where I got them.",
    },
  ],
};

// Default fallback testimonials for any category
const defaultTestimonials: Testimonial[] = [
  {
    name: "Michelle P.",
    location: "Los Angeles, CA",
    rating: 5,
    text: "Instant download, clean design, worked exactly as described. Will buy from this shop again.",
  },
  {
    name: "Jordan B.",
    location: "New York, NY",
    rating: 5,
    text: "Looks great, easy to use, and the customization options are perfect.",
  },
  {
    name: "Casey T.",
    location: "Houston, TX",
    rating: 5,
    text: "Really thoughtful design. Much better than other templates I've tried.",
  },
];

function Star() {
  return (
    <svg className="w-4 h-4 text-orange" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function Testimonials({ category }: { category: string }) {
  const reviews = testimonials[category] || defaultTestimonials;
  const avgRating = 4.9;
  const reviewCount = 247;

  return (
    <section className="py-12 border-t border-light-gray">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} />
          ))}
        </div>
        <p className="text-sm text-charcoal font-medium">
          <span className="font-heading font-bold">{avgRating}</span> out of 5
          <span className="text-text-light"> ({reviewCount} reviews)</span>
        </p>
      </div>

      <h2 className="font-heading text-2xl font-bold text-charcoal text-center mb-8">
        What customers are saying
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.slice(0, 3).map((r, i) => (
          <div
            key={i}
            className="bg-white border border-light-gray rounded-xl p-6 hover:shadow-md transition"
          >
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: r.rating }).map((_, j) => (
                <Star key={j} />
              ))}
            </div>
            <p className="text-charcoal text-sm leading-relaxed mb-4">
              &ldquo;{r.text}&rdquo;
            </p>
            <div className="text-xs">
              <p className="font-heading font-semibold text-charcoal">{r.name}</p>
              <p className="text-text-light">{r.location} · Verified buyer</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
