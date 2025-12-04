// src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, settings, openingHours } = await request.json();

    // Update or insert booking settings
    await sql`
      INSERT INTO booking_settings (
        restaurant_id, slot_duration, booking_window_days, 
        min_advance_hours, max_party_size, default_booking_duration
      ) VALUES (
        ${restaurantId}, ${settings.slot_duration}, ${settings.booking_window_days},
        ${settings.min_advance_hours}, ${settings.max_party_size}, ${settings.default_booking_duration}
      )
      ON CONFLICT (restaurant_id) 
      DO UPDATE SET
        slot_duration = ${settings.slot_duration},
        booking_window_days = ${settings.booking_window_days},
        min_advance_hours = ${settings.min_advance_hours},
        max_party_size = ${settings.max_party_size},
        default_booking_duration = ${settings.default_booking_duration},
        updated_at = NOW()
    `;

    // Update opening hours
    for (const hours of openingHours) {
      await sql`
        INSERT INTO opening_hours (
          restaurant_id, day_of_week, open_time, close_time, is_closed
        ) VALUES (
          ${restaurantId}, ${hours.day_of_week}, ${hours.open_time}, 
          ${hours.close_time}, ${hours.is_closed}
        )
        ON CONFLICT (restaurant_id, day_of_week)
        DO UPDATE SET
          open_time = ${hours.open_time},
          close_time = ${hours.close_time},
          is_closed = ${hours.is_closed}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}