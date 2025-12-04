// src/app/api/booking/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/booking.service';
import { EmailService } from '@/lib/services/email.service';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      time,
      partySize,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = body;

    // Validation
    if (!date || time === undefined || !partySize || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create booking
    const bookingService = new BookingService();
    const booking = await bookingService.createBooking({
      date,
      time,
      partySize,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    });

    // Send confirmation email
    try {
      const emailService = new EmailService();
      await emailService.sendBookingConfirmation(booking);
      
      await sql`
        UPDATE bookings SET confirmation_sent = true WHERE id = ${booking.id}
      `;
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Booking creation error:', error);
    
    if (error instanceof Error && error.message === 'No available tables') {
      return NextResponse.json(
        { error: 'Inga lediga bord för denna tid' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}