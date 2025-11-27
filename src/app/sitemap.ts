import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://theoven.se";
  const lastModified = new Date().toISOString();

  return [
    // Root
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 1.0,
      alternates: {
        languages: {
          sv: `${baseUrl}/sv`,
          en: `${baseUrl}/en`,
        },
      },
    },
    // Svenska sidor
    {
      url: `${baseUrl}/sv`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 1.0,
      alternates: {
        languages: {
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/sv/meny`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/en/meny`,
        },
      },
    },
      {
        url: `${baseUrl}/sv/lunch`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.9,
        alternates: {
          languages: {
            en: `${baseUrl}/en/lunch`,
          },
        },
    },
    // Engelska sidor
    {
      url: `${baseUrl}/en`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 1.0,
      alternates: {
        languages: {
          sv: `${baseUrl}/sv`,
        },
      },
    },
    {
      url: `${baseUrl}/en/meny`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: {
        languages: {
          sv: `${baseUrl}/sv/meny`,
        },
      },
    },
      {
        url: `${baseUrl}/en/lunch`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.9,
        alternates: {
          languages: {
            sv: `${baseUrl}/sv/lunch`,
          },
        },
    },
  ];
}