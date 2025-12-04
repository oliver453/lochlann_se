// src/app/api/admin/tables/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const restaurantId = config.restaurantId;
    
    const result = await sql`
      INSERT INTO tables (
        restaurant_id, table_number, capacity, min_capacity, 
        x_position, y_position, shape, is_active
      ) VALUES (
        ${restaurantId}, ${body.table_number}, ${body.capacity}, 
        ${body.min_capacity}, ${body.x_position || 100}, ${body.y_position || 100},
        ${body.shape}, true
      )
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to create table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}