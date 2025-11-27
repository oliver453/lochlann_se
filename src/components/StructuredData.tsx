import { siteConfig } from '@/app/metadata';

type StructuredDataProps = {
  lang: 'sv' | 'en';
  type?: 'home' | 'menu';
};

export function StructuredData({ lang, type = 'home' }: StructuredDataProps) {
  const restaurantData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.shortName,
    description: lang === 'sv' ? siteConfig.description : siteConfig.en.description,
    url: lang === 'sv' ? siteConfig.url : `${siteConfig.url}/en`,
    image: `${siteConfig.url}/og.png`,
    logo: `${siteConfig.url}/the-oven.svg`,
    telephone: siteConfig.phone,
    priceRange: '$$',
    servesCuisine: ['Italian', 'Pizza', 'Neapolitan'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 59.65479679282539,
      longitude: 12.59550767923555,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Tuesday',
        opens: '16:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Wednesday', 'Thursday'],
        opens: '11:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Friday',
        opens: '11:00',
        closes: '23:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '12:00',
        closes: '23:00',
      },
    ],
    hasMenu: [
      {
        '@type': 'Menu',
        name: 'Meny (Svenska)',
        url: `${siteConfig.url}/sv/meny`,
      },
      {
        '@type': 'Menu',
        name: 'Menu (English)',
        url: `${siteConfig.url}/en/meny`,
      },
    ],
    acceptsReservations: true,
    sameAs: [
      'https://www.facebook.com/profile.php?id=61554892137607',
      'https://www.instagram.com/theoven_arvika',
      'https://maps.app.goo.gl/dBvSXPCJEE9gaswr8',
      'https://www.tripadvisor.com/Restaurant_Review-g285721-d3502137-Reviews-The_Oven-Arvika_Varmland_County.html',
      'https://www.tiktok.com/@theovenarvika'

    ],
  };

  if (type === 'home') {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(restaurantData),
        }}
      />
    );
  }

  const menuData = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: lang === 'sv' ? 'Meny' : 'Menu',
    description:
      lang === 'sv'
        ? 'Äkta napolitansk pizza och italienska rätter'
        : 'Authentic Neapolitan pizza and Italian dishes',
    inLanguage: lang === 'sv' ? 'sv-SE' : 'en-GB',
    hasMenuSection: [
      {
        '@type': 'MenuSection',
        name: 'Pizza',
        description:
          lang === 'sv'
            ? 'Äkta napolitansk pizza bakad i vedugn'
            : 'Authentic Neapolitan pizza baked in wood-fired oven',
      },
      {
        '@type': 'MenuSection',
        name: lang === 'sv' ? 'Förrätter' : 'Starters',
      },
      {
        '@type': 'MenuSection',
        name: lang === 'sv' ? 'Huvudrätter' : 'Main Courses',
      },
      {
        '@type': 'MenuSection',
        name: lang === 'sv' ? 'Efterrätter' : 'Desserts',
      },
    ],
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: siteConfig.shortName,
        item: siteConfig.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: lang === 'sv' ? 'Meny' : 'Menu',
        item: `${siteConfig.url}/${lang === 'sv' ? 'sv/meny' : 'en/meny'}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([restaurantData, menuData, breadcrumbData]),
      }}
    />
  );
}