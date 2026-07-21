import type { MetadataRoute } from "next";
import { siteLastUpdated, siteUrl } from "./site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: siteLastUpdated,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/privacidade`,
      lastModified: siteLastUpdated,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
