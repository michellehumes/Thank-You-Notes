import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/get-download?productId=15086039105904
//
// Reads the digital_download.file_url metafield from Shopify and returns a
// signed CDN URL for the customer to download their file.
//
// Called client-side from /download page after customer selects their product.
// ─────────────────────────────────────────────────────────────────────────────

const SHOP = "shelzys-designs";
const API_VERSION = "2024-01";
const GRAPHQL_URL = `https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json`;

async function getDownloadUrl(productId: string): Promise<{ fileUrl: string; filename: string } | null> {
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!token) return null;

  const query = `query getProductDownload($id: ID!) {
    product(id: $id) {
      title
      fileUrl: metafield(namespace: "digital_download", key: "file_url") {
        value
      }
      filename: metafield(namespace: "digital_download", key: "filename") {
        value
      }
    }
  }`;

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { id: `gid://shopify/Product/${productId}` },
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json();
  const product = data?.data?.product;
  if (!product?.fileUrl?.value) return null;

  return {
    fileUrl: product.fileUrl.value,
    filename: product.filename?.value ?? "download",
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId || !/^\d+$/.test(productId)) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  const result = await getDownloadUrl(productId);
  if (!result) {
    return NextResponse.json({ error: "Download not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
