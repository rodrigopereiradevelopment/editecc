import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://editecc.vercel.app",
      lastModified: new Date("2026-07-12"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://editecc.vercel.app/editor",
      lastModified: new Date("2026-07-12"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
