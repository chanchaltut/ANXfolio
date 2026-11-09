import type { MetadataRoute } from "next";
import { describe, seedSettings, site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.person} (ANX) | ${site.jobTitle}`,
    short_name: "ANX",
    description: describe(seedSettings),
    start_url: "/",
    display: "standalone",
    background_color: "#00090f",
    theme_color: "#00090f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
