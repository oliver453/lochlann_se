// src/app/studio/settings/page.tsx
import { sql } from '@/lib/db';
import { config } from '@/lib/config';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const restaurantId = config.restaurantId;

  const [settings, openingHours] = await Promise.all([
    sql`SELECT * FROM booking_settings WHERE restaurant_id = ${restaurantId}`,
    sql`SELECT * FROM opening_hours WHERE restaurant_id = ${restaurantId} ORDER BY day_of_week`,
  ]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black tracking-tight">Inställningar</h1>
        <p className="text-muted-foreground mt-1">Hantera bokningsinställningar och öppettider</p>
      </div>
      <SettingsForm 
        restaurantId={restaurantId}
        initialSettings={settings[0] || null}
        initialOpeningHours={openingHours}
      />
    </div>
  );
}