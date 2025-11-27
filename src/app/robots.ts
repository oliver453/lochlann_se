import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    sitemap: "https://theoven.se/sitemap.xml",
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/sv/erbjudande",
          "/en/erbjudande",
          "/sv/erbjudande/avregistrera",
          "/en/erbjudande/avregistrera",
          "/studio"
        ],
      },
    ],
  };
}
