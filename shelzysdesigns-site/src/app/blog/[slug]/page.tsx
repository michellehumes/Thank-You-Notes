import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts, getBlogPostBySlug, type Section } from "@/data/blog-posts";

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      siteName: "Shelzy's Designs",
      images: [
        {
          url: `https://shelzysdesigns.com/api/og?slug=${post.slug}`,
          width: 1200,
          height: 630,
          alt: post.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [`https://shelzysdesigns.com/api/og?slug=${post.slug}`],
    },
    alternates: {
      canonical: `https://shelzysdesigns.com/blog/${post.slug}`,
    },
  };
}

function ArticleSchema({ post }: { post: (typeof blogPosts)[number] }) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.headline,
    description: post.description,
    author: {
      "@type": "Organization",
      name: "Shelzy's Designs",
      url: "https://shelzysdesigns.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Shelzy's Designs",
      url: "https://shelzysdesigns.com",
    },
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    mainEntityOfPage: `https://shelzysdesigns.com/blog/${post.slug}`,
    image: `https://shelzysdesigns.com/api/og?slug=${post.slug}`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

const categoryLabels: Record<string, string> = {
  "budget-finance": "Budget + Finance",
  wedding: "Wedding",
  productivity: "Productivity",
  business: "Business",
  etsy: "Etsy",
  "water-bottles": "Water Bottles",
};

const categoryColors: Record<string, string> = {
  "budget-finance": "bg-pink/10 text-pink",
  wedding: "bg-teal/10 text-teal",
  productivity: "bg-blue/10 text-blue",
  business: "bg-orange/10 text-orange",
  etsy: "bg-pink/10 text-pink",
  "water-bottles": "bg-blue/10 text-blue",
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <ArticleSchema post={post} />
      <Header />

      <main className="flex-1">
        <article className="mx-auto max-w-[760px] px-6 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-text-light mb-8">
            <Link href="/" className="hover:text-charcoal transition">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-charcoal transition">
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span className="text-charcoal">{post.title}</span>
          </nav>

          {/* Category + Date */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                categoryColors[post.category] || "bg-light-gray text-charcoal"
              }`}
            >
              {categoryLabels[post.category] || post.category}
            </span>
            <time className="text-text-light text-sm" dateTime={post.datePublished}>
              {new Date(post.datePublished).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal leading-tight mb-6">
            {post.headline}
          </h1>

          {/* Description / Intro */}
          <p className="text-text-light text-lg leading-relaxed mb-10">
            {post.description}
          </p>

          {/* Featured image */}
          <div className="aspect-[16/9] bg-light-gray rounded-xl overflow-hidden mb-10">
            <img
              src={post.ogImage.replace("https://shelzysdesigns.com", "")}
              alt={post.ogImageAlt}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article body */}
          <div className="mb-12 space-y-6">
            {post.bodySections.map((section: Section, i: number) => {
              if (section.type === "h2") {
                return (
                  <h2
                    key={i}
                    className="font-heading font-bold text-2xl text-charcoal mt-10 mb-2"
                  >
                    {section.text}
                  </h2>
                );
              }
              if (section.type === "h3") {
                return (
                  <h3
                    key={i}
                    className="font-heading font-semibold text-xl text-charcoal mt-6 mb-1"
                  >
                    {section.text}
                  </h3>
                );
              }
              if (section.type === "p") {
                return (
                  <p key={i} className="text-text-light leading-relaxed">
                    {section.text}
                  </p>
                );
              }
              if (section.type === "ul") {
                return (
                  <ul
                    key={i}
                    className="list-disc list-outside pl-6 space-y-2 text-text-light leading-relaxed"
                  >
                    {section.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              }
              if (section.type === "ol") {
                return (
                  <ol
                    key={i}
                    className="list-decimal list-outside pl-6 space-y-2 text-text-light leading-relaxed"
                  >
                    {section.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ol>
                );
              }
              if (section.type === "callout") {
                return (
                  <div
                    key={i}
                    className="border-l-4 border-pink bg-pink/5 px-6 py-4 rounded-r-lg"
                  >
                    <p className="text-charcoal font-medium leading-relaxed">
                      {section.text}
                    </p>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Internal Links / Related Products */}
          {post.internalLinks.length > 0 && (
            <div className="bg-light-gray rounded-xl p-8 mb-12">
              <h2 className="font-heading font-bold text-xl text-charcoal mb-4">
                Templates Mentioned in This Article
              </h2>
              <div className="flex flex-wrap gap-3">
                {post.internalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-block bg-white border border-mid-gray text-charcoal font-heading text-sm font-semibold px-4 py-2 rounded-lg hover:border-pink hover:text-pink transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {post.faq.length > 0 && (
            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-charcoal mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {post.faq.map((item, i) => (
                  <div key={i} className="border-b border-mid-gray pb-6 last:border-0">
                    <h3 className="font-heading font-semibold text-lg text-charcoal mb-2">
                      {item.question}
                    </h3>
                    <p className="text-text-light leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-teal/10 rounded-xl p-8 text-center">
            <h2 className="font-heading font-bold text-xl text-charcoal mb-3">
              Ready to get organized?
            </h2>
            <p className="text-text-light mb-6">
              Browse our full collection of templates designed for real life.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-pink hover:bg-pink-hover text-white font-heading font-semibold px-8 py-3 rounded-lg transition"
            >
              Shop All Templates
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
