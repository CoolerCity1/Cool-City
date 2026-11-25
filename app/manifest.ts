import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cooler City",
    short_name: "Cooler City",
    description: "Urban Cooling on Demand",
    start_url: "/de",
    display: "standalone",
    background_color: "#FAFAF6",
    theme_color: "#0B3028",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/cool-city-icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
