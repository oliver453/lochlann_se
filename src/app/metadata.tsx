import type { Metadata } from "next";

export const siteConfig = {
  name: "Lochlann Steakhouse | Värmlands bästa köttrestaurang",
  shortName: "The Oven",
  description:
    "Vi serverar äkta napolitansk pizza bakad i vedugn, lunchbuffé och à la carte. Med noggrant utvalda råvaror och genuin service får du en matupplevelse utöver det vanliga. Välkommen till oss på Kyrkogatan 20 i Arvika.",
  url: "https://theoven.se",
  ogImage: "/og.png",
  creator: "@theovenarvika",
  developer: "otdesign.se — design, kod och lite kaffe",
  keywords: [
    "The Oven",
    "Arvika restaurang",
    "napolitansk pizza Arvika",
    "vedugnsbakad pizza",
    "pizza Arvika",
    "restaurang Arvika",
    "lunchbuffé Arvika",
    "à la carte Arvika",
    "middag Arvika",
    "italiensk restaurang Arvika",
  ],
  address: {
    street: "Kyrkogatan 20",
    postalCode: "671 31",
    city: "Arvika",
    country: "SE",
  },
  phone: "+46 570 10 100",
  coordinates: {
    latitude: '59.65479679282539',
    longitude: '12.59550767923555',
  },
  // Engelska översättningar
  en: {
    name: "The Oven | Authentic Neapolitan Pizza in Arvika",
    description:
      "We serve authentic Neapolitan pizza baked in a wood-fired oven, lunch buffet and à la carte. With carefully selected ingredients and genuine service, you get a dining experience beyond the ordinary. Welcome to us at Kyrkogatan 20 in Arvika.",
    keywords: [
      "The Oven",
      "Arvika restaurant",
      "Neapolitan pizza Arvika",
      "wood-fired pizza",
      "pizza Arvika",
      "restaurant Arvika",
      "lunch buffet Arvika",
      "à la carte Arvika",
      "dinner Arvika",
      "Italian restaurant Arvika",
    ],
  },
};

// ---------------------------
// Svenska startsidan (/sv eller root)
// ---------------------------
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.shortName }],
  creator: siteConfig.creator,
  other: {
    developer: siteConfig.developer,
  },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: `${siteConfig.url}/sv`,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.shortName,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1920,
        height: 1080,
        alt: siteConfig.name,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.shortName,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
  robots: { index: true, follow: true },
  verification: {
    google: "1xyjYRSepMna-uvd6Ba2qJnSHDihdXm-crC6jNcpF7I",
  },
  alternates: {
    canonical: `${siteConfig.url}/sv`,
    languages: {
      sv: `${siteConfig.url}/sv`,
      en: `${siteConfig.url}/en`,
    },
  },
  category: "restaurant",
};

// ---------------------------
// Engelska startsidan (/en)
// ---------------------------
export const englishMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.en.name,
  description: siteConfig.en.description,
  keywords: siteConfig.en.keywords,
  authors: [{ name: siteConfig.shortName }],
  creator: siteConfig.creator,
  other: {
    developer: siteConfig.developer,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: `${siteConfig.url}/en`,
    title: siteConfig.en.name,
    description: siteConfig.en.description,
    siteName: siteConfig.shortName,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1920,
        height: 1080,
        alt: siteConfig.en.name,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.shortName,
    description: siteConfig.en.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
  robots: { index: true, follow: true },
  verification: {
    google: "1xyjYRSepMna-uvd6Ba2qJnSHDihdXm-crC6jNcpF7I",
  },
  alternates: {
    canonical: `${siteConfig.url}/en`,
    languages: {
      sv: `${siteConfig.url}/sv`,
      en: `${siteConfig.url}/en`,
    },
  },
  category: "restaurant",
};

// ---------------------------
// Svenska meny (/sv/meny)
// ---------------------------
export const menuMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Meny | The Oven",
  description:
    "Upptäck vår meny med äkta napolitansk pizza, förrätter, huvudrätter och efterrätter. Alla rätter tillagas med noggrant utvalda ingredienser och bakas i vår vedugn.",
  keywords: [
    "The Oven",
    "Arvika restaurang",
    "napolitansk pizza Arvika",
    "vedugnsbakad pizza",
    "pizza Arvika",
    "restaurang Arvika",
    "lunchbuffé Arvika",
    "à la carte Arvika",
    "middag Arvika",
    "italiensk restaurang Arvika",
    "pizza meny Arvika",
    "napolitansk pizza meny",
    "vedugnsbakad pizza meny",
    "italiensk restaurang meny",
    "restaurang meny Arvika",
  ],
  authors: [{ name: siteConfig.shortName }],
  creator: siteConfig.creator,
  other: {
    developer: siteConfig.developer,
  },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: `${siteConfig.url}/sv/meny`,
    title: "Meny | The Oven",
    description:
      "Upptäck vår meny med äkta napolitansk pizza, förrätter, huvudrätter och efterrätter.",
    siteName: siteConfig.shortName,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1920,
        height: 1080,
        alt: "Meny | The Oven",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meny | The Oven",
    description:
      "Upptäck vår meny med äkta napolitansk pizza, förrätter, huvudrätter och efterrätter.",
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
  robots: { index: true, follow: true },
  verification: {
    google: "1xyjYRSepMna-uvd6Ba2qJnSHDihdXm-crC6jNcpF7I",
  },
  alternates: {
    canonical: `${siteConfig.url}/sv/meny`,
    languages: {
      sv: `${siteConfig.url}/sv/meny`,
      en: `${siteConfig.url}/en/meny`,
    },
  },
  category: "restaurant",
};

// ---------------------------
// Engelska meny (/en/meny)
// ---------------------------
export const englishMenuMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Menu | The Oven",
  description:
    "Discover our menu with authentic Neapolitan pizzas, starters, main courses and desserts. All dishes are prepared with carefully selected ingredients and baked in our wood-fired oven.",
  keywords: [
    "The Oven",
    "Arvika restaurant",
    "Neapolitan pizza Arvika",
    "wood-fired pizza",
    "pizza Arvika",
    "restaurant Arvika",
    "lunch buffet Arvika",
    "à la carte Arvika",
    "dinner Arvika",
    "Italian restaurant Arvika",
    "pizza menu Arvika",
    "Neapolitan pizza menu",
    "wood-fired pizza menu",
    "Italian restaurant menu",
    "restaurant menu Arvika",
  ],
  authors: [{ name: siteConfig.shortName }],
  creator: siteConfig.creator,
  other: {
    developer: siteConfig.developer,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: `${siteConfig.url}/en/meny`,
    title: "Menu | The Oven",
    description:
      "Discover our menu with authentic Neapolitan pizzas, starters, main courses and desserts.",
    siteName: siteConfig.shortName,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1920,
        height: 1080,
        alt: "Menu | The Oven",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu | The Oven",
    description:
      "Discover our menu with authentic Neapolitan pizzas, starters, main courses and desserts.",
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
  robots: { index: true, follow: true },
  verification: {
    google: "1xyjYRSepMna-uvd6Ba2qJnSHDihdXm-crC6jNcpF7I",
  },
  alternates: {
    canonical: `${siteConfig.url}/en/meny`,
    languages: {
      sv: `${siteConfig.url}/sv/meny`,
      en: `${siteConfig.url}/en/meny`,
    },
  },
  category: "restaurant",
};