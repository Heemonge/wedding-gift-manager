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

// ─── 체크리스트 ──────────────────────────────────────

export interface ChecklistRow {
  id: string;
  category: string;
  category_icon: string;
  category_order: number;
  name: string;
  note: string;
  checked: boolean;
  checked_bride: boolean;
  checked_groom: boolean;
  position: number;
  created_at?: string;
  updated_at?: string;
}

export async function fetchChecklist(): Promise<ChecklistRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("honeymoon_checklist")
    .select("*")
    .order("category_order", { ascending: true })
    .order("position", { ascending: true });
  if (error) {
    console.error("fetchChecklist", error);
    return [];
  }
  return (data as ChecklistRow[]) ?? [];
}

export async function insertChecklistItems(rows: Omit<ChecklistRow, "id" | "created_at" | "updated_at">[]): Promise<void> {
  if (!supabase || rows.length === 0) return;
  const { error } = await supabase.from("honeymoon_checklist").insert(rows);
  if (error) console.error("insertChecklistItems", error);
}

export async function upsertChecklistItem(row: ChecklistRow): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("honeymoon_checklist").upsert({
    ...row,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("upsertChecklistItem", error.message, error.details, error.hint, error.code);
}

export async function deleteChecklistItem(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("honeymoon_checklist").delete().eq("id", id);
  if (error) console.error("deleteChecklistItem", error);
}

// ─── 일일 지출 ───────────────────────────────────────

export interface ExpenseRow {
  id: string;
  spent_at: string;
  category: string;
  memo: string;
  amount_usd: number;
  amount_krw: number;
  created_at?: string;
}

export async function fetchExpenses(): Promise<ExpenseRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("honeymoon_expenses")
    .select("*")
    .order("spent_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchExpenses", error);
    return [];
  }
  return (data as ExpenseRow[]) ?? [];
}

export async function insertExpense(row: Omit<ExpenseRow, "id" | "created_at">): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("honeymoon_expenses").insert(row);
  if (error) console.error("insertExpense", error);
}

export async function deleteExpense(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("honeymoon_expenses").delete().eq("id", id);
  if (error) console.error("deleteExpense", error);
}

// ─── 티켓·서류 ────────────────────────────────────────

export const DOCUMENTS_BUCKET = "honeymoon-docs";

export interface DocumentRow {
  id: string;
  title: string;
  category: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  memo: string;
  position: number;
  created_at?: string;
}

export async function fetchDocuments(): Promise<DocumentRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("honeymoon_documents")
    .select("*")
    .order("category", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchDocuments", error.message, error.details, error.hint, error.code);
    return [];
  }
  return (data as DocumentRow[]) ?? [];
}

export async function insertDocument(row: Omit<DocumentRow, "id" | "created_at">): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("honeymoon_documents").insert(row);
  if (error) console.error("insertDocument", error.message, error.details, error.hint, error.code);
}

export async function deleteDocument(id: string, filePath: string): Promise<void> {
  if (!supabase) return;
  await supabase.storage.from(DOCUMENTS_BUCKET).remove([filePath]);
  const { error } = await supabase.from("honeymoon_documents").delete().eq("id", id);
  if (error) console.error("deleteDocument", error.message, error.details, error.hint, error.code);
}

export async function uploadDocument(file: File): Promise<{ path: string; publicUrl: string } | null> {
  if (!supabase) return null;
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext ? "." + ext : ""}`;
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(safeName, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error("uploadDocument", error.message);
    return null;
  }
  const { data } = supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(safeName);
  return { path: safeName, publicUrl: data.publicUrl };
}

export function getDocumentPublicUrl(path: string): string {
  if (!supabase) return "";
  const { data } = supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
