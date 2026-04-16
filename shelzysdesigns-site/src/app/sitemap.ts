import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/data/products";
import { blogPosts } from "@/data/blog-posts";

const BASE_URL = "https://shelzysdesigns.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/policies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  // Collection pages (unique categories from published products only)
  const publishedProducts = getPublishedProducts();
  const uniqueCategories = [...new Set(publishedProducts.map((p) => p.category))];
  const collectionPages: MetadataRoute.Sitemap = uniqueCategories.map(
    (category) => ({
      url: `${BASE_URL}/collections/${category}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // Virtual collection pages
  const virtualCollectionSlugs = [
    "templates",
    "planners",
    "bundles",
    "wedding-collection",
    "seasonal-gifts",
    "gifts-for-her",
    "best-sellers",
  ];
  const virtualCollectionPages: MetadataRoute.Sitemap = virtualCollectionSlugs.map(
    (slug) => ({
      url: `${BASE_URL}/collections/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  // Product pages -- published only
  const productPages: MetadataRoute.Sitemap = publishedProducts.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Blog pages
  const blogIndexPage: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.dateModified),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...collectionPages,
    ...virtualCollectionPages,
    ...productPages,
    ...blogIndexPage,
    ...blogPostPages,
  ];
}
