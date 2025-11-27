/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-domain.com'], // Lägg till dina image domains här om du använder externa bilder
  },
  // TA BORT alla i18n-inställningar - de fungerar inte med App Router
  // I18n hanteras nu via middleware och [lang] dynamic route
};

module.exports = nextConfig;