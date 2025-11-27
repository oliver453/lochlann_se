import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { upsertLunchMenuItem, deleteLunchMenuItem, toggleLunchAvailability } from '@/lib/cms-db';

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

// POST: Skapa/uppdatera lunchrätt (admin)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!verifyAuth(authHeader)) {
      return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
    }

    const body = await request.json();
    const {
      weekNumber,
      year,
      dayOfWeek,
      dishNameSv,
      dishNameEn,
      descriptionSv,
      descriptionEn,
      price,
      isVegetarian,
    } = body;

    // Validering
    if (!weekNumber || !year || dayOfWeek === undefined) {
      return NextResponse.json(
        { error: 'Veckonummer, år och veckodag krävs' },
        { status: 400 }
      );
    }

    if (!dishNameSv || !dishNameEn) {
      return NextResponse.json(
        { error: 'Rättnamn på både svenska och engelska krävs' },
        { status: 400 }
      );
    }

    if (!price || price < 0) {
      return NextResponse.json(
        { error: 'Giltigt pris krävs' },
        { status: 400 }
      );
    }

    const item = await upsertLunchMenuItem({
      weekNumber,
      year,
      dayOfWeek,
      dishNameSv,
      dishNameEn,
      descriptionSv,
      descriptionEn,
      price,
      isVegetarian: isVegetarian || false,
    });

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    console.error('Error creating lunch item:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod' },
      { status: 500 }
    );
  }
}

// DELETE: Ta bort lunchrätt (admin)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!verifyAuth(authHeader)) {
      return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID krävs' },
        { status: 400 }
      );
    }

    await deleteLunchMenuItem(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lunch item:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod' },
      { status: 500 }
    );
  }
}

// PATCH: Togglea tillgänglighet (admin)
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!verifyAuth(authHeader)) {
      return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isAvailable } = body;

    if (!id || isAvailable === undefined) {
      return NextResponse.json(
        { error: 'ID och tillgänglighet krävs' },
        { status: 400 }
      );
    }

    const item = await toggleLunchAvailability(id, isAvailable);

    return NextResponse.json({
      success: true,
      data: {
        id: item.id,
        isAvailable: item.is_available,
      },
    });
  } catch (error) {
    console.error('Error toggling availability:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod' },
      { status: 500 }
    );
  }
}