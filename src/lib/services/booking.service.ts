// src/lib/services/booking.service.ts
import { sql } from '@/lib/db';
import { config } from '@/lib/config';
import { timeToMinutes, minutesToTime } from '@/lib/utils/time';
import type { AvailabilitySlot, Table } from '../../../types/booking';

export class BookingService {
  private restaurantId: string;

  constructor(restaurantId?: string) {
    this.restaurantId = restaurantId || config.restaurantId;
  }

  async getAvailability(date: string, partySize: number): Promise<AvailabilitySlot[]> {
    try {
      // Get booking settings
      const settings = await sql`
        SELECT * FROM booking_settings WHERE restaurant_id = ${this.restaurantId}
      `;

      if (settings.length === 0) {
        throw new Error('Restaurant not found');
      }

      const setting = settings[0];

      // Get opening hours
      const { openTime, closeTime, isClosed } = await this.getHoursForDate(date);

      if (isClosed || !openTime || !closeTime) {
        return [];
      }

      // Generate slots
      const slots: AvailabilitySlot[] = [];
      const openMinutes = timeToMinutes(openTime);
      const closeMinutes = timeToMinutes(closeTime);
      const slotDuration = setting.slot_duration || 30;
      const bookingDuration = setting.default_booking_duration || 120;

      // CRITICAL FIX: Stop generating slots when the BOOKING END TIME would exceed closing time
      // Not when the BOOKING START TIME exceeds closing time
      const lastBookingStartTime = closeMinutes - bookingDuration;

      console.log('Slot generation:', {
        openMinutes,
        closeMinutes,
        lastBookingStartTime,
        slotDuration,
        bookingDuration
      });

      for (let time = openMinutes; time <= lastBookingStartTime; time += slotDuration) {
        const availableTables = await this.getAvailableTables(
          date,
          time,
          partySize,
          bookingDuration
        );

        slots.push({
          time,
          availableTables: availableTables.length,
          isAvailable: availableTables.length > 0,
        });
      }

      console.log('Total slots generated:', slots.length);

      return slots;
    } catch (error) {
      console.error('BookingService.getAvailability error:', error);
      throw error;
    }
  }

  async createBooking(data: {
    date: string;
    time: number;
    partySize: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes?: string;
    createdVia?: 'website' | 'admin';
  }) {
    const settings = await sql`
      SELECT * FROM booking_settings WHERE restaurant_id = ${this.restaurantId}
    `;

    if (settings.length === 0) {
      throw new Error('Restaurant not found');
    }

    const setting = settings[0];
    const timeStr = minutesToTime(data.time);
    const duration = setting.default_booking_duration;

    // Find available table
    const availableTables = await this.getAvailableTables(
      data.date,
      data.time,
      data.partySize,
      duration
    );

    if (availableTables.length === 0) {
      throw new Error('No available tables');
    }

    const table = availableTables[0];

    // Create booking
    const booking = await sql`
      INSERT INTO bookings (
        restaurant_id, table_id, booking_date, booking_time, party_size,
        duration, customer_name, customer_email, customer_phone, notes,
        status, created_via
      ) VALUES (
        ${this.restaurantId}, ${table.id}, ${data.date}, ${timeStr}, ${data.partySize},
        ${duration}, ${data.customerName}, ${data.customerEmail}, ${data.customerPhone}, 
        ${data.notes || null}, 'confirmed', ${data.createdVia || 'website'}
      )
      RETURNING *
    `;

    return booking[0];
  }

  async updateBookingStatus(bookingId: string, status: string) {
    await sql`
      UPDATE bookings 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${bookingId}
    `;
  }

  private async getHoursForDate(date: string): Promise<{
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }> {
    try {
      // Check special hours first
      const specialHours = await sql`
        SELECT * FROM special_hours 
        WHERE restaurant_id = ${this.restaurantId} 
        AND date = ${date}
      `;

      if (specialHours.length > 0) {
        const special = specialHours[0];
        return {
          openTime: special.open_time,
          closeTime: special.close_time,
          isClosed: special.is_closed,
        };
      }

      // Get regular opening hours
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = (dateObj.getDay() + 6) % 7;

      const openingHours = await sql`
        SELECT * FROM opening_hours 
        WHERE restaurant_id = ${this.restaurantId} 
        AND day_of_week = ${dayOfWeek}
      `;

      if (openingHours.length === 0) {
        return { openTime: null, closeTime: null, isClosed: true };
      }

      const hours = openingHours[0];
      return {
        openTime: hours.open_time,
        closeTime: hours.close_time,
        isClosed: hours.is_closed,
      };
    } catch (error) {
      console.error('getHoursForDate error:', error);
      throw error;
    }
  }

  private async getAvailableTables(
    date: string,
    time: number,
    partySize: number,
    duration: number
  ): Promise<Table[]> {
    const timeStr = minutesToTime(time);
    const endTime = minutesToTime(time + duration);

    // Get all tables that can fit the party
    const tables = await sql`
      SELECT * FROM tables 
      WHERE restaurant_id = ${this.restaurantId} 
      AND is_active = true 
      AND capacity >= ${partySize}
      AND min_capacity <= ${partySize}
      ORDER BY capacity ASC
    `;

    // Filter out tables with overlapping bookings
    const availableTables: Table[] = [];

    for (const table of tables) {
      const overlapping = await sql`
        SELECT id FROM bookings 
        WHERE table_id = ${table.id} 
        AND booking_date = ${date}
        AND status NOT IN ('cancelled', 'completed')
        AND (
          booking_time < ${endTime}::time AND 
          (booking_time + (duration || ' minutes')::interval)::time > ${timeStr}::time
        )
      `;

      if (overlapping.length === 0) {
        availableTables.push(table as Table);
      }
    }

    return availableTables;
  }
}