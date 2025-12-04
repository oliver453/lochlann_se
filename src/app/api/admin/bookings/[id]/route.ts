import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/booking.service';

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) {
    const { id } = await context.params;
    const { status } = await request.json();
  
    const bookingService = new BookingService();
    await bookingService.updateBookingStatus(id, status);
  
    return NextResponse.json({ success: true });
  }
  