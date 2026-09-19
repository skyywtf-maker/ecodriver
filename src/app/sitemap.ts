import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

/** Pages publiques indexables, de la plus importante à la moins importante. */
const ROUTES: Array<{ path: string; priority: number; changeFrequency: "monthly" | "yearly" }> = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/reserver", priority: 0.8, changeFrequency: "monthly" },
  { path: "/mentions-legales", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cgv", priority: 0.2, changeFrequency: "yearly" },
  { path: "/confidentialite", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((r) => ({
    url: `${SITE.url}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
