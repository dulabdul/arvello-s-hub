import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arvello's Hub — Personal Command Center",
    short_name: "Arvello's Hub",
    description: "Platform web personal untuk mengelola klien, proyek, invoice, keuangan, dan domain.",
    start_url: "/",
    display: "standalone",
    background_color: "#121822",
    theme_color: "#0047AB",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["business", "finance", "productivity"],
  };
}
