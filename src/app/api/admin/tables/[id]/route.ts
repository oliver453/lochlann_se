import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const setClauses: any[] = [];

    if (body.table_number !== undefined) setClauses.push(sql`table_number = ${body.table_number}`);
    if (body.capacity !== undefined) setClauses.push(sql`capacity = ${body.capacity}`);
    if (body.min_capacity !== undefined) setClauses.push(sql`min_capacity = ${body.min_capacity}`);
    if (body.shape !== undefined) setClauses.push(sql`shape = ${body.shape}`);
    if (body.is_active !== undefined) setClauses.push(sql`is_active = ${body.is_active}`);
    if (body.x_position !== undefined) setClauses.push(sql`x_position = ${body.x_position}`);
    if (body.y_position !== undefined) setClauses.push(sql`y_position = ${body.y_position}`);

    if (setClauses.length > 0) {
      const joined = setClauses.reduce((acc, clause, i) =>
        i === 0 ? clause : sql`${acc}, ${clause}`
      );

      await sql`
        UPDATE tables
        SET ${joined}
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update table:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}
