import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "InstaBoost · Free Instagram Followers, Likes & Views",
    short_name: "InstaBoost",
    description:
      "Exchange real followers, likes, and views with active Instagram users. 100% free.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4F4F5",
    theme_color: "#F4F4F5",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["social", "lifestyle", "utilities"],
  };
}
