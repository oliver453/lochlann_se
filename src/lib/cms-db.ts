import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// ==================== ÖPPETTIDER ====================

export interface OpeningHour {
  id: number;
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export async function getOpeningHours(): Promise<OpeningHour[]> {
  const result = await sql`
    SELECT * FROM opening_hours 
    ORDER BY day_of_week
  `;
  return result as OpeningHour[];
}

export async function updateOpeningHours(
  dayOfWeek: number,
  opensAt: string | null,
  closesAt: string | null,
  isClosed: boolean
): Promise<OpeningHour> {
  const result = await sql`
    UPDATE opening_hours 
    SET 
      opens_at = ${opensAt},
      closes_at = ${closesAt},
      is_closed = ${isClosed},
      updated_at = NOW()
    WHERE day_of_week = ${dayOfWeek}
    RETURNING *
  `;
  return result[0] as OpeningHour;
}

// ==================== LUNCHMENY ====================

export interface LunchMenuItem {
  id: number;
  week_number: number;
  year: number;
  day_of_week: number;
  dish_name_sv: string;
  dish_name_en: string;
  description_sv: string | null;
  description_en: string | null;
  price: number;
  is_vegetarian: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export async function getCurrentWeekLunch(): Promise<LunchMenuItem[]> {
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  const year = now.getFullYear();

  const result = await sql`
    SELECT * FROM lunch_menu 
    WHERE week_number = ${weekNumber} 
    AND year = ${year}
    AND is_available = true
    ORDER BY day_of_week
  `;
  return result as LunchMenuItem[];
}

export async function getLunchByWeek(
  weekNumber: number,
  year: number
): Promise<LunchMenuItem[]> {
  const result = await sql`
    SELECT * FROM lunch_menu 
    WHERE week_number = ${weekNumber} 
    AND year = ${year}
    ORDER BY day_of_week
  `;
  return result as LunchMenuItem[];
}

export async function upsertLunchMenuItem(item: {
  weekNumber: number;
  year: number;
  dayOfWeek: number;
  dishNameSv: string;
  dishNameEn: string;
  descriptionSv?: string;
  descriptionEn?: string;
  price: number;
  isVegetarian: boolean;
  id?: number; // Om id finns, uppdatera; annars skapa ny
}): Promise<LunchMenuItem> {
  if (item.id) {
    // Uppdatera befintlig rätt
    const result = await sql`
      UPDATE lunch_menu 
      SET
        dish_name_sv = ${item.dishNameSv},
        dish_name_en = ${item.dishNameEn},
        description_sv = ${item.descriptionSv || null},
        description_en = ${item.descriptionEn || null},
        price = ${item.price},
        is_vegetarian = ${item.isVegetarian},
        updated_at = NOW()
      WHERE id = ${item.id}
      RETURNING *
    `;
    return result[0] as LunchMenuItem;
  } else {
    // Skapa ny rätt
    const result = await sql`
      INSERT INTO lunch_menu (
        week_number, year, day_of_week,
        dish_name_sv, dish_name_en,
        description_sv, description_en,
        price, is_vegetarian
      ) VALUES (
        ${item.weekNumber}, ${item.year}, ${item.dayOfWeek},
        ${item.dishNameSv}, ${item.dishNameEn},
        ${item.descriptionSv || null}, ${item.descriptionEn || null},
        ${item.price}, ${item.isVegetarian}
      )
      RETURNING *
    `;
    return result[0] as LunchMenuItem;
  }
}

export async function deleteLunchMenuItem(id: number): Promise<void> {
  await sql`
    DELETE FROM lunch_menu 
    WHERE id = ${id}
  `;
}

export async function toggleLunchAvailability(
  id: number,
  isAvailable: boolean
): Promise<LunchMenuItem> {
  const result = await sql`
    UPDATE lunch_menu 
    SET is_available = ${isAvailable}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as LunchMenuItem;
}

// ==================== HELPER FUNCTIONS ====================

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getCurrentWeekAndYear(): { week: number; year: number } {
  const now = new Date();
  return {
    week: getWeekNumber(now),
    year: now.getFullYear(),
  };
}