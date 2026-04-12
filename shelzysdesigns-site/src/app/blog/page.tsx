import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllBlogPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Spreadsheet Templates Blog — Tips, Guides & Comparisons | Shelzy's Designs",
  description:
    "Budget templates, wedding planning spreadsheets, ADHD planners, Etsy seller dashboards — guides and comparisons to help you find the right template for how you actually live and work.",
  alternates: {
    canonical: "https://shelzysdesigns.com/blog",
  },
  openGraph: {
    title: "Spreadsheet Templates Blog | Shelzy's Designs",
    description:
      "Budget templates, wedding planning spreadsheets, ADHD planners, Etsy seller dashboards — guides and comparisons to help you find the right template.",
    type: "website",
    siteName: "Shelzy's Designs",
    images: [{ url: "https://shelzysdesigns.com/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spreadsheet Templates Blog | Shelzy's Designs",
    description: "Guides and comparisons for budget, wedding, ADHD, and business spreadsheet templates.",
    images: ["https://shelzysdesigns.com/api/og"],
  },
};

const categoryLabels: Record<string, string> = {
  "budget-finance": "Budget + Finance",
  wedding: "Wedding",
  productivity: "Productivity",
  business: "Business",
  etsy: "Etsy",
};

const categoryColors: Record<string, string> = {
  "budget-finance": "bg-pink/10 text-pink",
  wedding: "bg-teal/10 text-teal",
  productivity: "bg-blue/10 text-blue",
  business: "bg-orange/10 text-orange",
  etsy: "bg-pink/10 text-pink",
};

export default function BlogIndex() {
  const posts = getAllBlogPosts();

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-light-gray py-16">
          <div className="mx-auto max-w-[1200px] px-6 text-center">
            <h1 className="font-heading text-4xl font-bold text-charcoal mb-4">
              The Shelzy&apos;s Designs Blog
            </h1>
            <p className="text-text-light text-lg max-w-2xl mx-auto">
              Practical tips, template comparisons, and guides to help you get
              organized, plan smarter, and run your life (or business) like a
              pro.
            </p>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl border border-mid-gray overflow-hidden hover:shadow-md transition"
                >
                  {/* Image placeholder */}
                  <div className="aspect-[16/9] bg-light-gray flex items-center justify-center">
                    <span className="font-heading font-bold text-2xl text-mid-gray select-none">
                      SD
                    </span>
                  </div>

                  <div className="p-6">
                    {/* Category badge */}
                    <span
                      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${
                        categoryColors[post.category] || "bg-light-gray text-charcoal"
                      }`}
                    >
                      {categoryLabels[post.category] || post.category}
                    </span>

                    <h2 className="font-heading font-bold text-lg text-charcoal mb-2 group-hover:text-pink transition line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-text-light text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    <p className="text-text-light text-xs mt-4">
                      {new Date(post.datePublished).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
