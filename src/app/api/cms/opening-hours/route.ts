import { NextRequest, NextResponse } from 'next/server';
import { getOpeningHours } from '@/lib/cms-db';

// GET: Hämta öppettider (publik)
export async function GET(request: NextRequest) {
  try {
    const hours = await getOpeningHours();
    
    // Formatera för frontend (camelCase)
    const formatted = hours.map(h => ({
      id: h.id,
      dayOfWeek: h.day_of_week,
      opensAt: h.opens_at,
      closesAt: h.closes_at,
      isClosed: h.is_closed,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching opening hours:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opening hours' },
      { status: 500 }
    );
  }
}