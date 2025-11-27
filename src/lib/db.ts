import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface OfferEntry {
  id?: number;
  phone_number: string;
  code: string;
  created_at: string;
  expires_at: string;
  used: boolean;
  used_at?: string | null;
}

// Lägg till entry
export async function addEntry(entry: Omit<OfferEntry, 'id'>) {
  const result = await sql`
    INSERT INTO offer_entries (phone_number, code, created_at, expires_at, used)
    VALUES (${entry.phone_number}, ${entry.code}, ${entry.created_at}, ${entry.expires_at}, ${entry.used})
    RETURNING *
  `;
  return result[0];
}

// Hitta entry via kod
export async function findEntryByCode(code: string) {
  const result = await sql`
    SELECT * FROM offer_entries 
    WHERE code = ${code.toUpperCase()}
    LIMIT 1
  `;
  return result[0] || null;
}

// Hitta aktiv entry för telefonnummer
export async function findActiveEntryByPhone(phoneNumber: string) {
  const result = await sql`
    SELECT * FROM offer_entries 
    WHERE phone_number = ${phoneNumber}
    AND used = false
    AND expires_at > NOW()
    LIMIT 1
  `;
  return result[0] || null;
}

// Markera som använd
export async function markAsUsed(code: string) {
  const result = await sql`
    UPDATE offer_entries 
    SET used = true, used_at = NOW()
    WHERE code = ${code.toUpperCase()}
    RETURNING *
  `;
  return result[0] || null;
}

// Hämta alla entries
export async function getAllEntries() {
  const result = await sql`
    SELECT * FROM offer_entries 
    ORDER BY created_at DESC
  `;
  return result;
}

// Få statistik
export async function getStats() {
  const total = await sql`SELECT COUNT(*) as count FROM offer_entries`;
  const active = await sql`SELECT COUNT(*) as count FROM offer_entries WHERE used = false AND expires_at > NOW()`;
  const used = await sql`SELECT COUNT(*) as count FROM offer_entries WHERE used = true`;
  const expired = await sql`SELECT COUNT(*) as count FROM offer_entries WHERE used = false AND expires_at <= NOW()`;
  
  return {
    total: parseInt(total[0].count as string),
    active: parseInt(active[0].count as string),
    used: parseInt(used[0].count as string),
    expired: parseInt(expired[0].count as string),
  };
}

// Hämta unika telefonnummer
export async function getUniquePhoneNumbers() {
  const result = await sql`
    SELECT DISTINCT phone_number 
    FROM offer_entries 
    ORDER BY phone_number
  `;
  return result.map(r => r.phone_number as string);
}