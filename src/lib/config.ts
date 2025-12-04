// src/lib/config.ts
export const config = {
  restaurantId: process.env.RESTAURANT_ID!,
  resendApiKey: process.env.RESEND_API_KEY!,
  adminPassword: process.env.ADMIN_PASSWORD!,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
} as const;

// Validate on startup
if (!config.restaurantId) throw new Error('RESTAURANT_ID is required');
if (!config.resendApiKey) throw new Error('RESEND_API_KEY is required');
if (!config.adminPassword) throw new Error('ADMIN_PASSWORD is required');