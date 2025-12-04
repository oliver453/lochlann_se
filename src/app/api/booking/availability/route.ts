// src/app/api/booking/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/booking.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const partySize = parseInt(searchParams.get('partySize') || '0');

    console.log('API Request:', { date, partySize });

    if (!date || !partySize) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const bookingService = new BookingService();
    const slots = await bookingService.getAvailability(date, partySize);

    console.log('Slots generated:', slots.length);

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Availability API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch availability',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}