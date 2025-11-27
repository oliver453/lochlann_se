import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateOpeningHours } from '@/lib/cms-db';
import { revalidatePath } from 'next/cache';

const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  crypto.createHash('sha256').update('TheOven2024!').digest('hex');

function verifyAuth(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === ADMIN_PASSWORD_HASH;
}

// PUT: Uppdatera öppettider (admin)
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!verifyAuth(authHeader)) {
      return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
    }

    const body = await request.json();
    const { dayOfWeek, opensAt, closesAt, isClosed } = body;

    if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: 'Ogiltig veckodag (0-6)' },
        { status: 400 }
      );
    }

    const updated = await updateOpeningHours(
      dayOfWeek,
      opensAt || null,
      closesAt || null,
      isClosed
    );

    // Revalidera cache
    revalidatePath('/api/cms/opening-hours');
    revalidatePath('/[lang]', 'page'); // Startsidan

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        dayOfWeek: updated.day_of_week,
        opensAt: updated.opens_at,
        closesAt: updated.closes_at,
        isClosed: updated.is_closed,
      },
    });
  } catch (error) {
    console.error('Error updating opening hours:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod' },
      { status: 500 }
    );
  }
}