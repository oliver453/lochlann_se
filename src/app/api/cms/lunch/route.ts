import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWeekLunch, getLunchByWeek } from '@/lib/cms-db';
import { revalidatePath } from 'next/cache';

// Cache i 5 minuter för att minska DB-anrop
export const revalidate = 21600; // 6 timmar

// GET: Hämta lunchmeny (publik)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week');
    const year = searchParams.get('year');

    let items;
    
    if (week && year) {
      // Hämta specifik vecka
      items = await getLunchByWeek(parseInt(week), parseInt(year));
    } else {
      // Hämta aktuell vecka
      items = await getCurrentWeekLunch();
    }

    // Formatera för frontend (camelCase)
    const formatted = items.map(item => ({
      id: item.id,
      weekNumber: item.week_number,
      year: item.year,
      dayOfWeek: item.day_of_week,
      dishNameSv: item.dish_name_sv,
      dishNameEn: item.dish_name_en,
      descriptionSv: item.description_sv,
      descriptionEn: item.description_en,
      price: item.price,
      isVegetarian: item.is_vegetarian,
      isAvailable: item.is_available,
    }));

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching lunch menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lunch menu' },
      { status: 500 }
    );
  }
}