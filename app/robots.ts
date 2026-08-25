import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/month", "/settings", "/api", "/onboarding"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://mykharch.vercel.app"}/sitemap.xml`,
  };
}
