// src/app/studio/bookings/page.tsx
import { sql } from '@/lib/db';
import { config } from '@/lib/config';
import { BookingsList } from '@/components/admin/BookingsList';

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const restaurantId = config.restaurantId;

  const bookings = await sql`
    SELECT 
      b.*,
      t.table_number
    FROM bookings b
    LEFT JOIN tables t ON b.table_id = t.id
    WHERE b.restaurant_id = ${restaurantId}
    ORDER BY b.booking_date DESC, b.booking_time DESC
  `;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black tracking-tight">Bokningar</h1>
        <p className="text-muted-foreground mt-1">Hantera alla restaurangens bokningar</p>
      </div>
      <BookingsList initialBookings={bookings} />
    </div>
  );
}