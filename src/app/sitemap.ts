import type { MetadataRoute } from "next";
import { allLandings } from "@/config/landing";
import { SITE } from "@/config/site";

type Entry = { path: string; priority: number; changeFrequency: "monthly" | "yearly" };

/** Pages du parcours, de la plus importante à la moins importante. */
const CORE: Entry[] = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/reserver", priority: 0.8, changeFrequency: "monthly" },
  { path: "/mentions-legales", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cgv", priority: 0.2, changeFrequency: "yearly" },
  { path: "/confidentialite", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Les trois pages prioritaires passent devant les pages de ville.
  const landings: Entry[] = allLandings().map((l) => ({
    path: l.path,
    priority: l.path.startsWith("/vtc/") ? 0.6 : 0.9,
    changeFrequency: "monthly",
  }));

  return [...CORE, ...landings].map((r) => ({
    url: `${SITE.url}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
