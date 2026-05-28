import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anon ? createClient(url, anon) : null;

export const supabaseReady = Boolean(url && anon);

export type Side = "groom" | "bride";

export interface GiftRow {
  id: string;
  side: Side;
  name: string;
  relation: string;
  people: number;
  tickets: number;
  amount: number;
  note: string;
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface ConfigRow {
  id: number;
  ticket_price: number;
  groom_tickets: number;
  bride_tickets: number;
  guaranteed_guests: number;
}

export async function fetchGiftRows(side: Side): Promise<GiftRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("wedding_gifts")
    .select("*")
    .eq("side", side)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchGiftRows", error);
    return [];
  }
  return (data as GiftRow[]) ?? [];
}

export async function fetchAllGiftRows(): Promise<GiftRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("wedding_gifts")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchAllGiftRows", error);
    return [];
  }
  return (data as GiftRow[]) ?? [];
}

export async function upsertGiftRow(row: GiftRow): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("wedding_gifts").upsert({
    ...row,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("upsertGiftRow", error);
}

export async function deleteGiftRow(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("wedding_gifts").delete().eq("id", id);
  if (error) console.error("deleteGiftRow", error);
}

export async function fetchConfigRow(): Promise<ConfigRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("wedding_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error("fetchConfigRow", error);
    return null;
  }
  return data as ConfigRow | null;
}

export async function saveConfigRow(row: Omit<ConfigRow, "id">): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("wedding_config").upsert({
    id: 1,
    ...row,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("saveConfigRow", error);
}
