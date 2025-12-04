// src/app/studio/tables/page.tsx
import { sql } from '@/lib/db';
import { config } from '@/lib/config';
import { TableMap } from '@/components/admin/TableMap';

export const dynamic = 'force-dynamic';

export default async function TablesPage() {
  const restaurantId = config.restaurantId;

  const tables = await sql`
    SELECT * FROM tables 
    WHERE restaurant_id = ${restaurantId}
    ORDER BY table_number ASC
  `;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black tracking-tight">Bordskarta</h1>
        <p className="text-muted-foreground mt-1">Hantera restaurangens bord och layout</p>
      </div>
      <TableMap initialTables={tables} restaurantId={restaurantId} />
    </div>
  );
}