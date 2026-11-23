import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const isProd = (process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true) && !process.env.SITE_PASSWORD;
  return {
    rules: isProd ? [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
