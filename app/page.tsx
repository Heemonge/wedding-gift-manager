"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas-pro";
import {
  cities,
  checklist,
  reservations,
  immigration,
  budget,
  insurance,
  type QnA,
  type TableRow,
} from "./itinerary-data";
import {
  supabase,
  supabaseReady,
  fetchGiftRows,
  fetchAllGiftRows,
  upsertGiftRow,
  deleteGiftRow,
  fetchConfigRow,
  saveConfigRow,
  fetchChecklist,
  insertChecklistItems,
  upsertChecklistItem,
  deleteChecklistItem,
  fetchExpenses,
  insertExpense,
  deleteExpense,
  fetchDocuments,
  insertDocument,
  deleteDocument,
  uploadDocument,
  getDocumentPublicUrl,
  type GiftRow,
  type ChecklistRow,
  type ExpenseRow,
  type DocumentRow,
} from "./lib/supabase";

const DEFAULT_TICKET_PRICE = 65000;
const DEFAULT_TOTAL_TICKETS = 200;
const DEFAULT_GUARANTEED_GUESTS = 220;

interface TicketConfig {
  ticketPrice: number;
  groomTickets: number;
  brideTickets: number;
  guaranteedGuests: number;
}

const DEFAULT_CONFIG: TicketConfig = {
  ticketPrice: DEFAULT_TICKET_PRICE,
  groomTickets: DEFAULT_TOTAL_TICKETS,
  brideTickets: DEFAULT_TOTAL_TICKETS,
  guaranteedGuests: DEFAULT_GUARANTEED_GUESTS,
};

function loadConfigLocal(): TicketConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  const saved = localStorage.getItem("wedding-gift-config");
  if (saved) return JSON.parse(saved);
  return DEFAULT_CONFIG;
}

function saveConfigLocal(config: TicketConfig) {
  localStorage.setItem("wedding-gift-config", JSON.stringify(config));
}

async function loadConfigAsync(): Promise<TicketConfig> {
  if (supabaseReady) {
    const row = await fetchConfigRow();
    if (row) {
      return {
        ticketPrice: row.ticket_price,
        groomTickets: row.groom_tickets,
        brideTickets: row.bride_tickets,
        guaranteedGuests: row.guaranteed_guests,
      };
    }
  }
  return loadConfigLocal();
}

async function persistConfig(config: TicketConfig) {
  if (supabaseReady) {
    await saveConfigRow({
      ticket_price: config.ticketPrice,
      groom_tickets: config.groomTickets,
      bride_tickets: config.brideTickets,
      guaranteed_guests: config.guaranteedGuests,
    });
    return;
  }
  saveConfigLocal(config);
}

const RELATIONS = ["부모님", "친척", "친구", "직장", "기타"] as const;
type Relation = typeof RELATIONS[number] | "";

interface GiftEntry {
  id: string;
  name: string;
  relation: Relation;
  people: number;
  tickets: number;
  amount: number;
  note: string;
}

type Side = "groom" | "bride";
type Page = "home" | "select" | "groom" | "bride" | "settlement" | "itinerary";

const STORAGE_KEY_PREFIX = "wedding-gift-";

function createEmptyEntry(): GiftEntry {
  return {
    id: crypto.randomUUID(),
    name: "",
    relation: "",
    people: 1,
    tickets: 1,
    amount: 0,
    note: "",
  };
}

function formatMoney(value: number): string {
  if (value === 0) return "";
  return value.toLocaleString("ko-KR");
}

function getStorageKey(side: Side): string {
  return `${STORAGE_KEY_PREFIX}${side}`;
}

type EditableField = "name" | "relation" | "people" | "tickets" | "amount" | "note";
const EDITABLE_FIELDS: EditableField[] = ["name", "people", "tickets", "amount", "note"];

function loadEntriesFromStorage(side: Side): GiftEntry[] {
  const saved = localStorage.getItem(getStorageKey(side));
  if (saved) return JSON.parse(saved);
  return [];
}

function rowToEntry(row: GiftRow): GiftEntry {
  return {
    id: row.id,
    name: row.name,
    relation: (row.relation as Relation) ?? "",
    people: row.people,
    tickets: row.tickets,
    amount: row.amount,
    note: row.note,
  };
}

function entryToRow(entry: GiftEntry, side: Side): GiftRow {
  return {
    id: entry.id,
    side,
    name: entry.name,
    relation: entry.relation || "",
    people: entry.people,
    tickets: entry.tickets,
    amount: entry.amount,
    note: entry.note,
    position: 0,
  };
}

async function loadEntriesAsync(side: Side): Promise<GiftEntry[]> {
  if (supabaseReady) {
    const rows = await fetchGiftRows(side);
    return rows.map(rowToEntry);
  }
  return loadEntriesFromStorage(side);
}

async function persistEntryUpsert(entry: GiftEntry, side: Side, allEntries: GiftEntry[]) {
  if (!entry.name.trim()) return;
  if (supabaseReady) {
    await upsertGiftRow(entryToRow(entry, side));
    return;
  }
  const toSave = allEntries.filter((e) => e.name.trim() !== "");
  localStorage.setItem(getStorageKey(side), JSON.stringify(toSave));
}

async function persistEntryDelete(id: string, side: Side, remainingEntries: GiftEntry[], wasFilled: boolean) {
  if (supabaseReady) {
    if (wasFilled) await deleteGiftRow(id);
    return;
  }
  const toSave = remainingEntries.filter((e) => e.name.trim() !== "");
  localStorage.setItem(getStorageKey(side), JSON.stringify(toSave));
}

function calcSummary(entries: GiftEntry[], ticketPrice: number) {
  return {
    count: entries.length,
    people: entries.reduce((s, e) => s + e.people, 0),
    tickets: entries.reduce((s, e) => s + e.tickets, 0),
    totalAmount: entries.reduce((s, e) => s + e.amount, 0),
    totalTicketCost: entries.reduce((s, e) => s + e.tickets * ticketPrice, 0),
    totalNet: entries.reduce((s, e) => s + (e.amount - e.tickets * ticketPrice), 0),
  };
}

type ItinerarySection = "schedule" | "checklist" | "reservations" | "documents" | "immigration" | "budget" | "insurance";

const CITY_GEO: Record<string, { lat: number; lon: number; tz: string }> = {
  "뉴욕": { lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  "마이애미": { lat: 25.7617, lon: -80.1918, tz: "America/New_York" },
  "LA": { lat: 34.0522, lon: -118.2437, tz: "America/Los_Angeles" },
};

const KOREA_TZ = "Asia/Seoul";

function weatherCodeToEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "🌤";
  if (code === 45 || code === 48) return "🌫";
  if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82)) return "🌦";
  if (code >= 61 && code <= 67) return "🌧";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "🌨";
  if (code >= 95) return "⛈";
  return "☁️";
}

interface DailyForecast {
  date: string;
  tMax: number;
  tMin: number;
  code: number;
  precipMax: number;
}

async function fetchWeather(lat: number, lon: number, tz: string): Promise<DailyForecast[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=${encodeURIComponent(tz)}&forecast_days=7&temperature_unit=celsius`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    const days: DailyForecast[] = [];
    const len = json?.daily?.time?.length ?? 0;
    for (let i = 0; i < len; i++) {
      days.push({
        date: json.daily.time[i],
        tMax: Math.round(json.daily.temperature_2m_max[i]),
        tMin: Math.round(json.daily.temperature_2m_min[i]),
        code: json.daily.weather_code[i] ?? 0,
        precipMax: json.daily.precipitation_probability_max[i] ?? 0,
      });
    }
    return days;
  } catch (e) {
    console.error("fetchWeather", e);
    return [];
  }
}

function getCurrentTripCity(): string | null {
  const today = new Date();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  if (today.getFullYear() !== 2026) return null;
  // NYC: 6/1-6/5, Miami: 6/6-6/9, LA: 6/10-6/14 (approximate from itinerary)
  if (m === 6 && d >= 1 && d <= 5) return "뉴욕";
  if (m === 6 && d >= 6 && d <= 9) return "마이애미";
  if (m === 6 && d >= 10 && d <= 14) return "LA";
  return null;
}

function formatTimeInTz(tz: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

const ITINERARY_SECTIONS: { key: ItinerarySection; emoji: string; label: string }[] = [
  { key: "schedule", emoji: "📅", label: "일정" },
  { key: "checklist", emoji: "✅", label: "준비물" },
  { key: "reservations", emoji: "🎫", label: "사전예약" },
  { key: "documents", emoji: "📎", label: "티켓·서류" },
  { key: "immigration", emoji: "🛂", label: "입국·서류" },
  { key: "budget", emoji: "💰", label: "예산" },
  { key: "insurance", emoji: "🛡️", label: "보험" },
];

function ItineraryView({ onBack }: { onBack: () => void }) {
  const [section, setSection] = useState<ItinerarySection>("schedule");
  const [activeCityIndex, setActiveCityIndex] = useState(0);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [hideChecked, setHideChecked] = useState(false);

  // ─── Checklist (DB-backed) ───────────────────────────
  const [checklistRows, setChecklistRows] = useState<ChecklistRow[]>([]);
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📌");

  const reloadChecklist = useCallback(async () => {
    if (supabaseReady) {
      let rows = await fetchChecklist();
      // Seed with defaults if table is empty
      if (rows.length === 0) {
        const seed: Omit<ChecklistRow, "id" | "created_at" | "updated_at">[] = [];
        checklist.forEach((cat, catIdx) => {
          cat.items.forEach((item, itemIdx) => {
            seed.push({
              category: cat.title,
              category_icon: cat.icon,
              category_order: catIdx,
              name: item.name,
              note: item.note,
              checked: false,
              checked_bride: false,
              checked_groom: false,
              position: itemIdx,
            });
          });
        });
        await insertChecklistItems(seed);
        rows = await fetchChecklist();
      }
      setChecklistRows(rows);
    } else {
      // localStorage fallback: build from static + saved check state
      const saved = localStorage.getItem("wedding-checklist");
      const checks: Record<string, { b?: boolean; g?: boolean }> = saved ? JSON.parse(saved) : {};
      const rows: ChecklistRow[] = [];
      checklist.forEach((cat, catIdx) => {
        cat.items.forEach((item, itemIdx) => {
          const key = `${cat.title}-${itemIdx}`;
          rows.push({
            id: key,
            category: cat.title,
            category_icon: cat.icon,
            category_order: catIdx,
            name: item.name,
            note: item.note,
            checked: !!(checks[key]?.b && checks[key]?.g),
            checked_bride: !!checks[key]?.b,
            checked_groom: !!checks[key]?.g,
            position: itemIdx,
          });
        });
      });
      setChecklistRows(rows);
    }
  }, []);

  useEffect(() => {
    void reloadChecklist();
  }, [reloadChecklist]);

  useEffect(() => {
    const client = supabase;
    if (!supabaseReady || !client) return;
    const channel = client
      .channel("honeymoon-checklist")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "honeymoon_checklist" },
        () => { void reloadChecklist(); }
      )
      .subscribe();
    return () => { client.removeChannel(channel); };
  }, [reloadChecklist]);

  const toggleCheck = (row: ChecklistRow, person: "bride" | "groom") => {
    const next: ChecklistRow = {
      ...row,
      checked_bride: person === "bride" ? !row.checked_bride : row.checked_bride,
      checked_groom: person === "groom" ? !row.checked_groom : row.checked_groom,
    };
    next.checked = next.checked_bride && next.checked_groom;
    setChecklistRows((prev) => prev.map((r) => (r.id === row.id ? next : r)));
    if (supabaseReady) {
      void upsertChecklistItem(next);
    } else {
      const saved = localStorage.getItem("wedding-checklist");
      const checks: Record<string, { b?: boolean; g?: boolean }> = saved ? JSON.parse(saved) : {};
      checks[row.id] = { b: next.checked_bride, g: next.checked_groom };
      localStorage.setItem("wedding-checklist", JSON.stringify(checks));
    }
  };

  const addChecklistItem = async (category: string, categoryIcon: string, categoryOrder: number, name: string) => {
    if (!name.trim()) return;
    const maxPos = Math.max(0, ...checklistRows.filter((r) => r.category === category).map((r) => r.position));
    if (supabaseReady) {
      await insertChecklistItems([{
        category,
        category_icon: categoryIcon,
        category_order: categoryOrder,
        name: name.trim(),
        note: "",
        checked: false,
        checked_bride: false,
        checked_groom: false,
        position: maxPos + 1,
      }]);
      await reloadChecklist();
    } else {
      const newRow: ChecklistRow = {
        id: `${category}-${Date.now()}`,
        category,
        category_icon: categoryIcon,
        category_order: categoryOrder,
        name: name.trim(),
        note: "",
        checked: false,
        checked_bride: false,
        checked_groom: false,
        position: maxPos + 1,
      };
      setChecklistRows((prev) => [...prev, newRow]);
    }
    setAddingToCategory(null);
    setNewItemName("");
  };

  const addChecklistCategory = async (icon: string, title: string) => {
    if (!title.trim()) return;
    const maxOrder = Math.max(0, ...checklistRows.map((r) => r.category_order));
    if (supabaseReady) {
      await insertChecklistItems([{
        category: title.trim(),
        category_icon: icon || "📌",
        category_order: maxOrder + 1,
        name: "(여기에 항목을 추가하세요)",
        note: "",
        checked: true,
        checked_bride: true,
        checked_groom: true,
        position: 0,
      }]);
      await reloadChecklist();
    }
    setAddingCategory(false);
    setNewCategoryName("");
    setNewCategoryIcon("📌");
  };

  const removeChecklistItem = async (row: ChecklistRow) => {
    if (supabaseReady) {
      await deleteChecklistItem(row.id);
      await reloadChecklist();
    } else {
      setChecklistRows((prev) => prev.filter((r) => r.id !== row.id));
    }
  };


  // ─── Daily Expenses (DB-backed) ──────────────────────
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState("🍽️ 식비");
  const [expMemo, setExpMemo] = useState("");
  const [expDate, setExpDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [cashBudgetUsd, setCashBudgetUsd] = useState(1500); // 기본 $1500
  const [editingCashBudget, setEditingCashBudget] = useState(false);

  // ─── Documents (PDF/이미지) ───────────────────────────
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("✈️ 항공권");
  const [docMemo, setDocMemo] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const DOC_CATEGORIES = ["✈️ 항공권", "🏨 호텔 바우처", "📄 ESTA", "🛡️ 보험증서", "🎫 입장권", "📝 기타"];

  const reloadDocuments = useCallback(async () => {
    if (!supabaseReady) {
      setDocuments([]);
      return;
    }
    const rows = await fetchDocuments();
    setDocuments(rows);
  }, []);

  useEffect(() => { void reloadDocuments(); }, [reloadDocuments]);

  useEffect(() => {
    const client = supabase;
    if (!supabaseReady || !client) return;
    const channel = client
      .channel("honeymoon-documents")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "honeymoon_documents" },
        () => { void reloadDocuments(); }
      )
      .subscribe();
    return () => { client.removeChannel(channel); };
  }, [reloadDocuments]);

  const addDocument = async () => {
    if (!docFile) { setDocError("파일을 선택하세요"); return; }
    if (!docTitle.trim()) { setDocError("제목을 입력하세요"); return; }
    setDocError(null);
    setDocUploading(true);
    try {
      const result = await uploadDocument(docFile);
      if (!result) {
        setDocError("업로드 실패. 다시 시도하세요.");
        return;
      }
      await insertDocument({
        title: docTitle.trim(),
        category: docCategory,
        file_path: result.path,
        file_name: docFile.name,
        mime_type: docFile.type || "application/octet-stream",
        file_size: docFile.size,
        memo: docMemo,
        position: 0,
      });
      await reloadDocuments();
      setDocTitle("");
      setDocMemo("");
      setDocFile(null);
    } finally {
      setDocUploading(false);
    }
  };

  const removeDocument = async (doc: DocumentRow) => {
    await deleteDocument(doc.id, doc.file_path);
    await reloadDocuments();
  };

  useEffect(() => {
    const saved = localStorage.getItem("wedding-cash-budget-usd");
    if (saved) setCashBudgetUsd(parseFloat(saved));
    else {
      // 기존 KRW 예산이 있으면 USD로 변환
      const legacy = localStorage.getItem("wedding-cash-budget");
      if (legacy) {
        const rate = parseInt(budget.exchangeRate.replace(/,/g, ""));
        setCashBudgetUsd(Math.round(parseInt(legacy) / rate));
      }
    }
  }, []);

  const updateCashBudgetUsd = (n: number) => {
    setCashBudgetUsd(n);
    localStorage.setItem("wedding-cash-budget-usd", String(n));
  };

  const reloadExpenses = useCallback(async () => {
    if (supabaseReady) {
      const rows = await fetchExpenses();
      setExpenses(rows);
    } else {
      const saved = localStorage.getItem("wedding-expenses");
      if (saved) setExpenses(JSON.parse(saved));
    }
  }, []);

  useEffect(() => { void reloadExpenses(); }, [reloadExpenses]);

  useEffect(() => {
    const client = supabase;
    if (!supabaseReady || !client) return;
    const channel = client
      .channel("honeymoon-expenses")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "honeymoon_expenses" },
        () => { void reloadExpenses(); }
      )
      .subscribe();
    return () => { client.removeChannel(channel); };
  }, [reloadExpenses]);

  const EXPENSE_CATEGORIES = ["🍽️ 식비", "🚖 교통", "🛍️ 쇼핑", "🎟️ 관광", "🏨 숙박", "💵 기타"];

  const addExpense = async () => {
    const amount = parseFloat(expAmount);
    if (!amount || isNaN(amount) || amount <= 0) return;
    const rate = parseInt(budget.exchangeRate.replace(/,/g, ""));
    const amountUsd = amount;
    const amountKrw = Math.round(amount * rate);
    if (supabaseReady) {
      await insertExpense({
        spent_at: expDate,
        category: expCategory,
        memo: expMemo,
        amount_usd: Number(amountUsd.toFixed(2)),
        amount_krw: amountKrw,
      });
      await reloadExpenses();
    } else {
      const newRow: ExpenseRow = {
        id: crypto.randomUUID(),
        spent_at: expDate,
        category: expCategory,
        memo: expMemo,
        amount_usd: Number(amountUsd.toFixed(2)),
        amount_krw: amountKrw,
        created_at: new Date().toISOString(),
      };
      const next = [newRow, ...expenses];
      setExpenses(next);
      localStorage.setItem("wedding-expenses", JSON.stringify(next));
    }
    setExpAmount("");
    setExpMemo("");
  };

  const removeExpense = async (id: string) => {
    if (supabaseReady) {
      await deleteExpense(id);
      await reloadExpenses();
    } else {
      const next = expenses.filter((e) => e.id !== id);
      setExpenses(next);
      localStorage.setItem("wedding-expenses", JSON.stringify(next));
    }
  };

  const todayDateStrIso = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();
  const todayExpenses = expenses.filter((e) => e.spent_at === todayDateStrIso);
  const todayTotalKrw = todayExpenses.reduce((s, e) => s + e.amount_krw, 0);
  const todayTotalUsd = todayExpenses.reduce((s, e) => s + Number(e.amount_usd), 0);
  const allExpensesTotalUsd = expenses.reduce((s, e) => s + Number(e.amount_usd), 0);
  const allExpensesTotalKrw = expenses.reduce((s, e) => s + e.amount_krw, 0);

  // Group expenses by date for display
  const expensesByDate = expenses.reduce<Record<string, ExpenseRow[]>>((acc, e) => {
    if (!acc[e.spent_at]) acc[e.spent_at] = [];
    acc[e.spent_at].push(e);
    return acc;
  }, {});
  const expenseDatesSorted = Object.keys(expensesByDate).sort((a, b) => b.localeCompare(a));

  const DEPARTURE_DATE = new Date(2026, 5, 1);
  const today = new Date();
  const dDay = Math.ceil((DEPARTURE_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const todayDateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;
  const allDays = cities.flatMap((c) => c.days.map((d) => ({ ...d, cityName: c.name, cityEmoji: c.emoji })));
  const todaySchedule = allDays.find((d) => {
    const match = d.date.match(/(\d+)월\s*(\d+)일/);
    if (!match) return false;
    return parseInt(match[1]) === today.getMonth() + 1 && parseInt(match[2]) === today.getDate();
  });

  const city = cities[activeCityIndex];

  // ─── Weather (Open-Meteo) ───────────────────────────
  const [weatherByCity, setWeatherByCity] = useState<Record<string, DailyForecast[]>>({});
  useEffect(() => {
    const geo = CITY_GEO[city.name];
    if (!geo) return;
    if (weatherByCity[city.name]?.length > 0) return;
    let cancelled = false;
    fetchWeather(geo.lat, geo.lon, geo.tz).then((days) => {
      if (!cancelled) setWeatherByCity((prev) => ({ ...prev, [city.name]: days }));
    });
    return () => { cancelled = true; };
  }, [city.name, weatherByCity]);
  const cityWeather = weatherByCity[city.name] ?? [];

  // ─── Timezone clock (Korea + current trip city) ────
  const [clockTick, setClockTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setClockTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);
  void clockTick;
  const tripCity = getCurrentTripCity();
  const tripCityTz = tripCity ? CITY_GEO[tripCity]?.tz : null;
  const koreaTime = formatTimeInTz(KOREA_TZ);
  const localTime = tripCityTz ? formatTimeInTz(tripCityTz) : null;

  const toggleDay = (dayKey: string) => {
    setExpandedDays((prev) => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  const isDayExpanded = (dayKey: string) => {
    return expandedDays[dayKey] ?? true;
  };

  // Group reservations by city
  // ─── Reservation status override (localStorage) ─────
  type ResStatus = "완료" | "미완료" | "주의";
  const [resOverrides, setResOverrides] = useState<Record<string, ResStatus>>({});
  useEffect(() => {
    const saved = localStorage.getItem("wedding-reservation-status");
    if (saved) setResOverrides(JSON.parse(saved));
  }, []);
  const resKey = (city: string, item: string) => `${city}::${item}`;
  const getResStatus = (r: typeof reservations[number]): ResStatus => {
    return resOverrides[resKey(r.city, r.item)] ?? r.status;
  };
  const toggleResStatus = (city: string, item: string, original: ResStatus) => {
    setResOverrides((prev) => {
      const key = resKey(city, item);
      const current = prev[key] ?? original;
      // 완료 → 원래 상태로 / 그 외 → 완료
      const next: Record<string, ResStatus> = { ...prev };
      if (current === "완료") {
        delete next[key];
      } else {
        next[key] = "완료";
      }
      localStorage.setItem("wedding-reservation-status", JSON.stringify(next));
      return next;
    });
  };

  const markAllReservationsComplete = () => {
    const next: Record<string, ResStatus> = {};
    reservations.forEach((r) => {
      if (r.status !== "완료") next[resKey(r.city, r.item)] = "완료";
    });
    setResOverrides(next);
    localStorage.setItem("wedding-reservation-status", JSON.stringify(next));
  };

  const resetReservationOverrides = () => {
    setResOverrides({});
    localStorage.removeItem("wedding-reservation-status");
  };

  const reservationsByCity = reservations.reduce<Record<string, typeof reservations>>((acc, r) => {
    if (!acc[r.city]) acc[r.city] = [];
    acc[r.city].push(r);
    return acc;
  }, {});

  const statusBadge = (status: ResStatus) => {
    if (status === "완료") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">완료</span>;
    if (status === "주의") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">주의</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">미완료</span>;
  };

  // Group insurance coverages by category
  const coveragesByCategory = insurance.coverages.reduce<Record<string, typeof insurance.coverages>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b-2 border-teal-300 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">신혼여행</h1>
          {localTime && tripCity && (
            <div className="ml-auto flex items-center gap-1.5 text-[11px]">
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <span className="text-gray-400">🇰🇷</span>
                <span className="font-mono font-semibold text-gray-700">{koreaTime}</span>
              </span>
              <span className="flex items-center gap-1 bg-teal-50 px-2 py-1 rounded-full">
                <span className="text-teal-400">📍</span>
                <span className="font-mono font-semibold text-teal-700">{localTime}</span>
              </span>
            </div>
          )}
          <span className={`${localTime ? "" : "ml-auto"} text-xs px-2.5 py-1 rounded-full font-semibold ${dDay > 0 ? "bg-teal-100 text-teal-700" : dDay === 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
            {dDay > 0 ? `D-${dDay}` : dDay === 0 ? "D-Day!" : `여행 ${Math.abs(dDay)}일차`}
          </span>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[53px] z-10">
        <div className="max-w-2xl mx-auto px-2 overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max">
            {ITINERARY_SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`px-3 py-2.5 text-center text-xs font-semibold transition-colors relative whitespace-nowrap ${
                  section === s.key
                    ? "text-teal-700"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span className="text-sm mr-0.5">{s.emoji}</span>
                {s.label}
                {section === s.key && (
                  <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-teal-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ───── SCHEDULE SECTION ───── */}
      {section === "schedule" && (
        <>
          {/* Today's Schedule Highlight */}
          {todaySchedule && (
            <div className="max-w-2xl mx-auto px-4 pt-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm font-bold text-amber-800 mb-2">
                  {todaySchedule.cityEmoji} 오늘 일정 — {todaySchedule.day} {todaySchedule.date}
                </p>
                <div className="space-y-1">
                  {todaySchedule.items.filter(i => i.activity).slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className="text-amber-600 font-mono shrink-0">{item.time.split("~")[0]}</span>
                      <span className="text-amber-900">{item.activity}</span>
                    </div>
                  ))}
                  {todaySchedule.items.filter(i => i.activity).length > 5 && (
                    <p className="text-xs text-amber-500">+{todaySchedule.items.filter(i => i.activity).length - 5}개 더...</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* City Tabs */}
          <div className="bg-white border-b border-gray-200 sticky top-[97px] z-[9]">
            <div className="max-w-2xl mx-auto px-4 flex">
              {cities.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setActiveCityIndex(i)}
                  className={`flex-1 py-3 text-center text-sm font-semibold transition-colors relative ${
                    activeCityIndex === i
                      ? "text-teal-700"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <span className="text-lg mr-1">{c.emoji}</span>
                  {c.name}
                  <span className="block text-xs font-normal text-gray-400 mt-0.5">{c.period}</span>
                  {activeCityIndex === i && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-teal-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <main className="max-w-2xl mx-auto px-4 py-4 pb-12">
            {/* City Info Card */}
            <div className="bg-white rounded-xl border border-teal-200 p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{city.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900">{city.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{city.period}</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-teal-600 shrink-0 mt-0.5">🏨</span>
                  <span className="text-gray-700">{city.hotel}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-teal-600 shrink-0 mt-0.5">✈️</span>
                  <span className="text-gray-700 whitespace-pre-line">{city.flight}</span>
                </div>
                {city.airports.map((ap) => (
                  <div key={ap.code} className="flex items-start gap-2 text-sm">
                    <span className="text-teal-600 shrink-0 mt-0.5">🛫</span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ap.name)}&travelmode=transit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 underline"
                    >
                      {ap.code} — {ap.name}
                    </a>
                    {ap.terminal && <span className="text-xs text-gray-400 mt-0.5">({ap.terminal})</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Weather forecast (7-day) */}
            {cityWeather.length > 0 && (
              <div className="bg-white rounded-xl border border-blue-200 p-3 mb-4">
                <p className="text-xs font-semibold text-blue-700 mb-2">🌤 {city.name} 7일 예보</p>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {cityWeather.map((d) => {
                    const date = new Date(d.date);
                    const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
                    const dayNum = date.getDate();
                    return (
                      <div key={d.date} className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-gray-400">{weekday}</span>
                        <span className="text-[10px] text-gray-600">{dayNum}일</span>
                        <span className="text-lg leading-none my-0.5">{weatherCodeToEmoji(d.code)}</span>
                        <span className="text-[10px] font-semibold text-gray-800">{d.tMax}°</span>
                        <span className="text-[10px] text-gray-400">{d.tMin}°</span>
                        {d.precipMax > 30 && (
                          <span className="text-[9px] text-blue-500">💧{d.precipMax}%</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Day Schedules */}
            <div className="space-y-3">
              {city.days.map((day) => {
                const dayKey = `${city.name}-${day.day}`;
                const expanded = isDayExpanded(dayKey);
                return (
                  <div key={dayKey} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleDay(dayKey)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {day.day}
                        </span>
                        <span className="text-sm text-gray-700 font-medium">{day.date}</span>
                        {day.subtitle && (
                          <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                            {day.subtitle}
                          </span>
                        )}
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {expanded && (
                      <div className="border-t border-gray-100">
                        {day.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`px-4 py-2.5 flex items-start gap-3 text-sm ${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            } ${idx < day.items.length - 1 ? "border-b border-gray-50" : ""}`}
                          >
                            <span className="text-xs text-gray-400 font-mono shrink-0 pt-0.5 w-[90px]">
                              {item.time}
                            </span>
                            <span className="text-base shrink-0 w-6 text-center">
                              {item.transport || ""}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-800">{item.activity}</span>
                              {item.place && (
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.place)}&travelmode=transit`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs text-teal-600 ml-2 underline"
                                >
                                  📍{item.place}
                                </a>
                              )}
                              {item.memo && (
                                <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5 mt-1.5 whitespace-pre-line">{item.memo}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        </>
      )}

      {/* ───── CHECKLIST SECTION ───── */}
      {section === "checklist" && (
        <main className="max-w-2xl mx-auto px-4 py-4 pb-12">
          {(() => {
            const grouped = checklistRows.reduce<Record<string, ChecklistRow[]>>((acc, row) => {
              if (!acc[row.category]) acc[row.category] = [];
              acc[row.category].push(row);
              return acc;
            }, {});
            const categories = Object.entries(grouped)
              .map(([title, rows]) => ({
                title,
                icon: rows[0]?.category_icon ?? "📌",
                order: rows[0]?.category_order ?? 999,
                rows,
              }))
              .sort((a, b) => a.order - b.order);
            const totalCount = checklistRows.length;
            const brideCount = checklistRows.filter((r) => r.checked_bride).length;
            const groomCount = checklistRows.filter((r) => r.checked_groom).length;
            return (
              <>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-pink-100 text-pink-700 font-medium">
                      👰 {brideCount}/{totalCount}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                      🤵 {groomCount}/{totalCount}
                    </span>
                  </div>
                  <button
                    onClick={() => setHideChecked(!hideChecked)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${hideChecked ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    {hideChecked ? "양쪽 완료 숨김 ON" : "양쪽 완료 숨기기"}
                  </button>
                </div>
                <div className="space-y-4">
                  {categories.map((cat) => {
                    const visibleRows = hideChecked ? cat.rows.filter((r) => !(r.checked_bride && r.checked_groom)) : cat.rows;
                    const catBride = cat.rows.filter((r) => r.checked_bride).length;
                    const catGroom = cat.rows.filter((r) => r.checked_groom).length;
                    if (hideChecked && visibleRows.length === 0) return null;
                    return (
                      <div key={cat.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-teal-50 border-b border-teal-100 flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-teal-800 flex items-center gap-1 min-w-0">
                            <span>{cat.icon}</span>
                            <span className="truncate">{cat.title}</span>
                          </h3>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 font-medium">
                              👰 {catBride}/{cat.rows.length}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                              🤵 {catGroom}/{cat.rows.length}
                            </span>
                            <button
                              onClick={() => { setAddingToCategory(cat.title); setNewItemName(""); }}
                              className="text-xs text-teal-600 hover:text-teal-800 font-medium px-1"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div>
                          {visibleRows.map((row, idx) => {
                            const bothChecked = row.checked_bride && row.checked_groom;
                            return (
                              <div
                                key={row.id}
                                className={`px-3 py-2.5 flex items-center gap-2 text-sm transition-colors ${
                                  bothChecked ? "bg-teal-50/50" : idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                } border-b border-gray-50 last:border-b-0`}
                              >
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => toggleCheck(row, "bride")}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                      row.checked_bride ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-300 hover:bg-pink-50"
                                    }`}
                                    title="신부"
                                  >
                                    <span className="text-xs">👰</span>
                                  </button>
                                  <button
                                    onClick={() => toggleCheck(row, "groom")}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                      row.checked_groom ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-300 hover:bg-blue-50"
                                    }`}
                                    title="신랑"
                                  >
                                    <span className="text-xs">🤵</span>
                                  </button>
                                </div>
                                <span className={`flex-1 min-w-0 ${bothChecked ? "line-through text-gray-400" : "text-gray-800"}`}>
                                  {row.name}
                                </span>
                                {row.note && (
                                  <span className="text-[10px] text-gray-400 shrink-0 max-w-[100px] text-right truncate">{row.note}</span>
                                )}
                                {supabaseReady && (
                                  <button
                                    onClick={() => removeChecklistItem(row)}
                                    className="shrink-0 text-gray-300 hover:text-red-500 p-1"
                                    title="삭제"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          {addingToCategory === cat.title && (
                            <div className="px-4 py-2.5 bg-teal-50/30 flex items-center gap-2">
                              <input
                                autoFocus
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") addChecklistItem(cat.title, cat.icon, cat.order, newItemName);
                                  if (e.key === "Escape") { setAddingToCategory(null); setNewItemName(""); }
                                }}
                                placeholder="새 항목 이름"
                                className="flex-1 px-3 py-1.5 text-sm bg-white border border-teal-200 rounded outline-none focus:border-teal-500"
                              />
                              <button
                                onClick={() => addChecklistItem(cat.title, cat.icon, cat.order, newItemName)}
                                className="text-xs px-3 py-1.5 bg-teal-500 text-white rounded hover:bg-teal-600"
                              >
                                추가
                              </button>
                              <button
                                onClick={() => { setAddingToCategory(null); setNewItemName(""); }}
                                className="text-xs px-2 py-1.5 text-gray-500"
                              >
                                취소
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {supabaseReady && (
                    addingCategory ? (
                      <div className="bg-white rounded-xl border-2 border-dashed border-teal-300 p-4 flex items-center gap-2">
                        <input
                          value={newCategoryIcon}
                          onChange={(e) => setNewCategoryIcon(e.target.value)}
                          maxLength={2}
                          className="w-12 px-2 py-1.5 text-sm text-center border border-gray-200 rounded outline-none focus:border-teal-500"
                          placeholder="📌"
                        />
                        <input
                          autoFocus
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addChecklistCategory(newCategoryIcon, newCategoryName);
                            if (e.key === "Escape") { setAddingCategory(false); setNewCategoryName(""); }
                          }}
                          placeholder="새 카테고리 이름"
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-teal-500"
                        />
                        <button
                          onClick={() => addChecklistCategory(newCategoryIcon, newCategoryName)}
                          className="text-xs px-3 py-1.5 bg-teal-500 text-white rounded hover:bg-teal-600"
                        >
                          추가
                        </button>
                        <button
                          onClick={() => { setAddingCategory(false); setNewCategoryName(""); }}
                          className="text-xs px-2 py-1.5 text-gray-500"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingCategory(true)}
                        className="w-full py-3 text-sm text-teal-600 hover:text-teal-800 border-2 border-dashed border-teal-200 hover:border-teal-400 rounded-xl transition-colors"
                      >
                        + 카테고리 추가
                      </button>
                    )
                  )}
                </div>
              </>
            );
          })()}
        </main>
      )}

      {/* ───── RESERVATIONS SECTION ───── */}
      {section === "reservations" && (
        <main className="max-w-2xl mx-auto px-4 py-4 pb-12">
          {/* Summary counts */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {(["완료", "미완료", "주의"] as const).map((s) => {
              const count = reservations.filter((r) => getResStatus(r) === s).length;
              return (
                <span key={s} className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  s === "완료" ? "bg-green-100 text-green-700" :
                  s === "주의" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-500"
                }`}>
                  {s} {count}
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={markAllReservationsComplete}
              className="text-xs px-3 py-1.5 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
            >
              ✓ 모두 완료
            </button>
            <button
              onClick={resetReservationOverrides}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
            >
              초기화
            </button>
            <span className="text-[10px] text-gray-400 ml-auto">배지 탭 → 개별 토글</span>
          </div>

          <div className="space-y-4">
            {Object.entries(reservationsByCity).map(([cityName, items]) => (
              <div key={cityName} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-teal-50 border-b border-teal-100">
                  <h3 className="text-sm font-bold text-teal-800">
                    <span className="mr-1.5">{items[0].cityEmoji}</span>{cityName}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map((r, idx) => (
                    <div key={idx} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{r.category}</span>
                            <span className="text-sm font-medium text-gray-900">{r.item}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                            {r.time && <span>{r.time}</span>}
                            {r.bookingUrl ? (
                              <a href={r.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">{r.bookingSite}</a>
                            ) : (
                              <span>{r.bookingSite}</span>
                            )}
                            <span className="font-medium text-gray-700">{r.cost}</span>
                          </div>
                          {r.memo && <p className="text-xs text-gray-400 mt-1">{r.memo}</p>}
                        </div>
                        <button
                          onClick={() => toggleResStatus(r.city, r.item, r.status)}
                          className="shrink-0 mt-0.5"
                          title="탭하여 완료/원래 상태 전환"
                        >
                          {statusBadge(getResStatus(r))}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ───── DOCUMENTS SECTION ───── */}
      {section === "documents" && (
        <main className="max-w-2xl mx-auto px-4 py-4 pb-12">
          {!supabaseReady && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-xs text-yellow-700">
              DB 연결이 필요한 기능입니다. (Supabase 환경변수 미설정)
            </div>
          )}

          {/* Storage usage bar */}
          {(() => {
            const FREE_LIMIT = 1024 * 1024 * 1024; // 1 GB
            const used = documents.reduce((s, d) => s + d.file_size, 0);
            const pct = Math.min(100, (used / FREE_LIMIT) * 100);
            const usedMb = used / (1024 * 1024);
            const usedDisplay = usedMb < 1
              ? `${(used / 1024).toFixed(0)} KB`
              : `${usedMb.toFixed(2)} MB`;
            const barColor = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-teal-500";
            return (
              <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500">📎 Supabase Storage</span>
                  <span className="text-gray-700 font-medium">
                    {usedDisplay} <span className="text-gray-400">/ 1 GB</span>
                    <span className="text-gray-400 ml-1">({pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.max(0.5, pct)}%` }} />
                </div>
              </div>
            );
          })()}

          {/* Upload Form */}
          {supabaseReady && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">+ 파일 업로드</p>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="제목 (예: 인천→뉴어크 항공권)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400 mb-2"
              />
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {DOC_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setDocCategory(c)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      docCategory === c ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={docMemo}
                onChange={(e) => setDocMemo(e.target.value)}
                placeholder="메모 (선택)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400 mb-2"
              />
              <label className="block mb-2">
                <span className="sr-only">파일</span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => { setDocFile(e.target.files?.[0] ?? null); setDocError(null); }}
                  className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </label>
              {docFile && (
                <p className="text-xs text-gray-500 mb-2">
                  📎 {docFile.name} ({(docFile.size / 1024).toFixed(0)}KB)
                </p>
              )}
              {docError && <p className="text-xs text-red-500 mb-2">{docError}</p>}
              <button
                onClick={addDocument}
                disabled={docUploading || !docFile || !docTitle.trim()}
                className="w-full py-2.5 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {docUploading ? "업로드 중..." : "업로드"}
              </button>
            </div>
          )}

          {/* Documents List grouped by category */}
          {(() => {
            const grouped = documents.reduce<Record<string, DocumentRow[]>>((acc, d) => {
              if (!acc[d.category]) acc[d.category] = [];
              acc[d.category].push(d);
              return acc;
            }, {});
            const categories = Object.keys(grouped).sort();
            if (categories.length === 0) {
              return (
                <div className="text-center text-sm text-gray-400 py-8">
                  아직 등록된 파일이 없습니다.
                </div>
              );
            }
            return (
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-teal-50 border-b border-teal-100">
                      <h3 className="text-sm font-bold text-teal-800">{cat}</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {grouped[cat].map((doc) => {
                        const url = getDocumentPublicUrl(doc.file_path);
                        const isImage = doc.mime_type.startsWith("image/");
                        const isPdf = doc.mime_type === "application/pdf";
                        return (
                          <div key={doc.id} className="px-4 py-3 flex items-center gap-3">
                            {isImage ? (
                              <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt={doc.title} className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                              </a>
                            ) : (
                              <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 w-14 h-14 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">{isPdf ? "📄" : "📎"}</span>
                              </a>
                            )}
                            <div className="flex-1 min-w-0">
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 hover:text-teal-600 block truncate">
                                {doc.title}
                              </a>
                              {doc.memo && <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.memo}</p>}
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {doc.file_name} · {(doc.file_size / 1024).toFixed(0)}KB
                              </p>
                            </div>
                            <button
                              onClick={() => removeDocument(doc)}
                              className="shrink-0 text-gray-300 hover:text-red-500 p-1"
                              title="삭제"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </main>
      )}

      {/* ───── IMMIGRATION SECTION ───── */}
      {section === "immigration" && (
        <main className="max-w-2xl mx-auto px-4 py-4 pb-12">
          <div className="space-y-4">
            {immigration.map((sec) => (
              <div key={sec.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className={`px-4 py-3 border-b ${sec.type === "contacts" ? "bg-red-50 border-red-100" : "bg-teal-50 border-teal-100"}`}>
                  <h3 className={`text-sm font-bold ${sec.type === "contacts" ? "text-red-800" : "text-teal-800"}`}>
                    <span className="mr-1.5">{sec.icon}</span>{sec.title}
                  </h3>
                </div>

                {sec.type === "qa" && (
                  <div className="divide-y divide-gray-100">
                    {(sec.items as QnA[]).map((qa, idx) => (
                      <div key={idx} className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{qa.question}</p>
                        <p className="text-sm text-teal-700 mt-1 bg-teal-50 rounded-lg px-3 py-2">{qa.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

                {(sec.type === "table" || sec.type === "contacts") && (
                  <div>
                    {(sec.items as TableRow[]).map((row, idx) => (
                      <div
                        key={idx}
                        className={`px-4 py-2.5 flex items-start gap-3 text-sm ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        } ${idx < sec.items.length - 1 ? "border-b border-gray-50" : ""}`}
                      >
                        <span className="font-medium text-gray-700 shrink-0 w-[100px]">{row.label}</span>
                        <span className={`flex-1 ${sec.type === "contacts" ? "text-blue-600 font-mono text-xs pt-0.5" : "text-gray-600"}`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ───── BUDGET SECTION ───── */}
      {section === "budget" && (
        <main className="max-w-2xl mx-auto px-4 py-4 pb-12">
          {/* Cash budget card (현지 현금) */}
          {(() => {
            const rate = parseInt(budget.exchangeRate.replace(/,/g, ""));
            const cashSpent = allExpensesTotalUsd;
            const cashRemaining = cashBudgetUsd - cashSpent;
            const cashPct = cashBudgetUsd > 0 ? Math.min(100, Math.round((cashSpent / cashBudgetUsd) * 100)) : 0;
            return (
              <div className="bg-amber-500 text-white rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-amber-100">💵 현지 현금 예산</p>
                  {editingCashBudget ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-amber-100">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        autoFocus
                        value={cashBudgetUsd === 0 ? "" : cashBudgetUsd.toString()}
                        onChange={(e) => {
                          const n = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                          updateCashBudgetUsd(isNaN(n) ? 0 : n);
                        }}
                        onBlur={() => setEditingCashBudget(false)}
                        onKeyDown={(e) => { if (e.key === "Enter") setEditingCashBudget(false); }}
                        className="w-24 px-2 py-1 text-right text-sm bg-amber-600 text-white rounded outline-none placeholder-amber-200"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingCashBudget(true)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      예산 설정
                    </button>
                  )}
                </div>
                <p className="text-2xl font-bold">${cashBudgetUsd.toLocaleString()}</p>
                <p className="text-xs text-amber-100 mt-0.5">≈ ₩{Math.round(cashBudgetUsd * rate).toLocaleString("ko-KR")}</p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-100">사용</span>
                    <span>${cashSpent.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-amber-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cashPct > 90 ? "bg-red-300" : cashPct > 70 ? "bg-yellow-200" : "bg-amber-100"}`} style={{ width: `${cashPct}%` }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-100">잔여</span>
                    <span className={cashRemaining < 0 ? "text-red-200 font-semibold" : ""}>
                      ${cashRemaining.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Today's Spending Card */}
          <div className="bg-white rounded-xl border-2 border-amber-300 p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-amber-700">📌 오늘 지출</p>
              <span className="text-xs text-gray-400">{todayExpenses.length}건</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${todayTotalUsd.toFixed(2)}</p>
            <p className="text-sm text-gray-500">≈ ₩{todayTotalKrw.toLocaleString("ko-KR")}</p>
            {todayExpenses.length > 0 && (
              <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                {todayExpenses.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 text-sm">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 shrink-0">{e.category}</span>
                    <span className="flex-1 text-gray-700 truncate">{e.memo || "-"}</span>
                    <span className="text-gray-900 font-medium shrink-0">${Number(e.amount_usd).toFixed(2)}</span>
                    <button
                      onClick={() => removeExpense(e.id)}
                      className="text-gray-300 hover:text-red-500 shrink-0"
                      title="삭제"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Expense Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-3">+ 지출 추가</p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="col-span-3 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setExpCategory(cat)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    expCategory === cat ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={expMemo}
              onChange={(e) => setExpMemo(e.target.value)}
              placeholder="어디서? 무엇? (예: Joe's 스테이크)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400 mb-2"
            />
            <div className="flex items-center gap-2">
              <span className="text-gray-400 shrink-0">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                onKeyDown={(e) => { if (e.key === "Enter") addExpense(); }}
                placeholder="0.00"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-right focus:outline-none focus:border-teal-400"
              />
              <button
                onClick={addExpense}
                className="px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors shrink-0"
              >
                추가
              </button>
            </div>
            {expAmount && !isNaN(parseFloat(expAmount)) && (
              <p className="text-xs text-gray-400 mt-2 text-right">
                ≈ ₩{Math.round(parseFloat(expAmount) * parseInt(budget.exchangeRate.replace(/,/g, ""))).toLocaleString("ko-KR")}
              </p>
            )}
          </div>

          {/* Past Expenses History */}
          {expenseDatesSorted.filter((d) => d !== todayDateStrIso).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500">📅 지난 지출</p>
                <button
                  onClick={() => setShowAllExpenses(!showAllExpenses)}
                  className="text-xs text-teal-600 hover:text-teal-800"
                >
                  {showAllExpenses ? "접기" : "펼치기"}
                </button>
              </div>
              {showAllExpenses && (
                <div className="space-y-3">
                  {expenseDatesSorted.filter((d) => d !== todayDateStrIso).map((date) => {
                    const dayExps = expensesByDate[date];
                    const dayTotalUsd = dayExps.reduce((s, e) => s + Number(e.amount_usd), 0);
                    return (
                      <div key={date} className="border-t border-gray-100 pt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-600">{date}</span>
                          <span className="text-xs font-bold text-gray-700">${dayTotalUsd.toFixed(2)}</span>
                        </div>
                        <div className="space-y-1">
                          {dayExps.map((e) => (
                            <div key={e.id} className="flex items-center gap-2 text-xs">
                              <span className="px-1 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">{e.category}</span>
                              <span className="flex-1 text-gray-700 truncate">{e.memo || "-"}</span>
                              <span className="text-gray-900 shrink-0">${Number(e.amount_usd).toFixed(2)}</span>
                              <button
                                onClick={() => removeExpense(e.id)}
                                className="text-gray-300 hover:text-red-500 shrink-0"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </main>
      )}

      {/* ───── INSURANCE SECTION ───── */}
      {section === "insurance" && (
        <main className="max-w-2xl mx-auto px-4 py-4 pb-12">
          {/* Insurance Info Card */}
          <div className="bg-white rounded-xl border border-teal-200 p-4 mb-4">
            <h3 className="text-sm font-bold text-teal-800 mb-3">보험 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">증권번호</span>
                <span className="text-gray-800 font-mono text-xs">{insurance.info.planNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">보장기간</span>
                <span className="text-gray-800">{insurance.info.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">피보험자</span>
                <span className="text-gray-800">{insurance.info.holder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">보험료</span>
                <span className="text-teal-700 font-bold">{insurance.info.premium}</span>
              </div>
            </div>
          </div>

          {/* Coverage by Category */}
          <div className="space-y-3 mb-4">
            {Object.entries(coveragesByCategory).map(([cat, items]) => (
              <div key={cat} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-teal-50 border-b border-teal-100">
                  <h4 className="text-xs font-bold text-teal-800">{cat}</h4>
                </div>
                <div>
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`px-4 py-2.5 flex items-center justify-between text-sm ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      } ${idx < items.length - 1 ? "border-b border-gray-50" : ""}`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-800">{item.name}</span>
                        {item.note && <span className="text-xs text-gray-400 ml-2">({item.note})</span>}
                      </div>
                      <span className="text-teal-700 font-semibold shrink-0 ml-3">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Warnings */}
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 mb-4">
            <h4 className="text-sm font-bold text-yellow-800 mb-2">유의사항</h4>
            <ul className="space-y-1.5">
              {insurance.warnings.map((w, idx) => (
                <li key={idx} className="text-xs text-yellow-700 flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">!</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Claim Phone */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">보험금 청구 전화</p>
            <p className="text-lg font-bold text-teal-700">{insurance.claimPhone}</p>
          </div>
        </main>
      )}
    </div>
  );
}

export default function Home() {
  const [page, setPage] = useState<Page>("home");
  const [side, setSide] = useState<Side | null>(null);
  const [entries, setEntries] = useState<GiftEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [editingCell, setEditingCell] = useState<{ id: string; field: EditableField } | null>(null);
  const [config, setConfig] = useState<TicketConfig>({ ticketPrice: DEFAULT_TICKET_PRICE, groomTickets: DEFAULT_TOTAL_TICKETS, brideTickets: DEFAULT_TOTAL_TICKETS, guaranteedGuests: DEFAULT_GUARANTEED_GUESTS });
  const [showConfig, setShowConfig] = useState(false);
  const [settlementData, setSettlementData] = useState<{ groom: GiftEntry[]; bride: GiftEntry[] } | null>(null);
  const [pinPrompt, setPinPrompt] = useState<{
    title: string;
    expected: string;
    onSuccess: () => void;
  } | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [recentlyDeleted, setRecentlyDeleted] = useState<{ entry: GiftEntry; side: Side; ts: number } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const captureRef = useRef<HTMLDivElement | null>(null);

  const askPin = useCallback((title: string, expected: string, onSuccess: () => void) => {
    setPinInput("");
    setPinError(false);
    setPinPrompt({ title, expected, onSuccess });
  }, []);

  const submitPin = () => {
    if (!pinPrompt) return;
    if (pinInput === pinPrompt.expected) {
      const cb = pinPrompt.onSuccess;
      setPinPrompt(null);
      setPinInput("");
      setPinError(false);
      cb();
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const handleDownload = async (filename: string) => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, { backgroundColor: "#f9fafb", scale: 2 });
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadConfigAsync();
      if (cancelled) return;
      setConfig(loaded);
      const savedSide = localStorage.getItem("wedding-gift-side") as Side | null;
      if (savedSide === "groom" || savedSide === "bride") {
        setSide(savedSide);
        setPage(savedSide);
      } else {
        setPage("home");
      }
      setInitializing(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Realtime subscription for config (shared across devices)
  useEffect(() => {
    const client = supabase;
    if (!supabaseReady || !client) return;
    const channel = client
      .channel("wedding-config")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wedding_config" },
        async () => {
          const fresh = await loadConfigAsync();
          setConfig(fresh);
        }
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const updateConfig = (partial: Partial<TicketConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      void persistConfig(next);
      return next;
    });
  };

  useEffect(() => {
    if (!side) return;
    let cancelled = false;
    localStorage.setItem("wedding-gift-side", side);
    setLoaded(false);
    (async () => {
      const fromDb = await loadEntriesAsync(side);
      if (cancelled) return;
      const hasEmpty = fromDb.some((e) => !e.name.trim());
      const next = hasEmpty ? fromDb : [...fromDb, createEmptyEntry()];
      setEntries(next);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [side]);

  // Realtime subscription for this side's gift entries
  const editingCellRef = useRef(editingCell);
  useEffect(() => {
    editingCellRef.current = editingCell;
  }, [editingCell]);

  useEffect(() => {
    const client = supabase;
    if (!supabaseReady || !client || !side) return;
    const channel = client
      .channel(`wedding-gifts-${side}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wedding_gifts",
          filter: `side=eq.${side}`,
        },
        async () => {
          const fresh = await loadEntriesAsync(side);
          setEntries((prev) => {
            const editingId = editingCellRef.current?.id;
            const merged = fresh.map((row) => {
              if (editingId && row.id === editingId) {
                const local = prev.find((e) => e.id === editingId);
                return local ?? row;
              }
              return row;
            });
            // Preserve trailing empty row from local state if it's not in DB
            const dbIds = new Set(fresh.map((r) => r.id));
            const trailing = prev.find((e) => !dbIds.has(e.id));
            if (trailing) merged.push(trailing);
            else if (!merged.some((e) => !e.name.trim())) {
              merged.push(createEmptyEntry());
            }
            return merged;
          });
        }
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [side]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const updateEntry = (id: string, field: keyof GiftEntry, value: string | number) => {
    if (!side) return;
    const currentSide = side;
    setEntries((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, [field]: value } : e));

      if (field === "name" && typeof value === "string" && value.trim() !== "") {
        const lastEntry = updated[updated.length - 1];
        if (lastEntry.id === id || !updated.some((e) => !e.name.trim())) {
          const hasEmptyAfter = updated.slice(updated.indexOf(updated.find((e) => e.id === id)!) + 1).some((e) => !e.name.trim());
          if (!hasEmptyAfter) {
            updated.push(createEmptyEntry());
          }
        }
      }
      const target = updated.find((e) => e.id === id);
      if (target) void persistEntryUpsert(target, currentSide, updated);
      return updated;
    });
  };

  const deleteEntry = (id: string) => {
    if (!side) return;
    const currentSide = side;
    setEntries((prev) => {
      const target = prev.find((e) => e.id === id);
      const wasFilled = (target?.name.trim() ?? "") !== "";
      if (target && wasFilled) {
        setRecentlyDeleted({ entry: target, side: currentSide, ts: Date.now() });
      }
      const filtered = prev.filter((e) => e.id !== id);
      if (filtered.length === 0 || !filtered.some((e) => !e.name.trim())) {
        filtered.push(createEmptyEntry());
      }
      void persistEntryDelete(id, currentSide, filtered, wasFilled);
      return filtered;
    });
  };

  const undoDelete = () => {
    if (!recentlyDeleted) return;
    const { entry, side: deletedSide } = recentlyDeleted;
    setRecentlyDeleted(null);
    setEntries((prev) => {
      const withoutEmpty = prev.filter((e) => e.name.trim() !== "");
      const restored = [...withoutEmpty, entry, createEmptyEntry()];
      void persistEntryUpsert(entry, deletedSide, restored);
      return restored;
    });
  };

  // Auto-hide undo toast after 10 seconds
  useEffect(() => {
    if (!recentlyDeleted) return;
    const timer = setTimeout(() => setRecentlyDeleted(null), 10000);
    return () => clearTimeout(timer);
  }, [recentlyDeleted]);

  // Load + subscribe settlement data whenever the settlement page is open
  useEffect(() => {
    if (page !== "settlement") {
      setSettlementData(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      if (supabaseReady) {
        const rows = await fetchAllGiftRows();
        if (cancelled) return;
        const groom = rows.filter((r) => r.side === "groom").map(rowToEntry);
        const bride = rows.filter((r) => r.side === "bride").map(rowToEntry);
        setSettlementData({ groom, bride });
      } else {
        setSettlementData({
          groom: loadEntriesFromStorage("groom"),
          bride: loadEntriesFromStorage("bride"),
        });
      }
    };
    void load();

    const client = supabase;
    if (!supabaseReady || !client) return () => { cancelled = true; };
    const channel = client
      .channel("wedding-gifts-settlement")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wedding_gifts" },
        () => { void load(); }
      )
      .subscribe();
    return () => {
      cancelled = true;
      client.removeChannel(channel);
    };
  }, [page]);

  const handleCellClick = (id: string, field: EditableField) => {
    setEditingCell({ id, field });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string, field: EditableField) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const currentFieldIndex = EDITABLE_FIELDS.indexOf(field);
      const currentEntryIndex = entries.findIndex((entry) => entry.id === id);

      if (e.key === "Tab" && !e.shiftKey) {
        if (currentFieldIndex < EDITABLE_FIELDS.length - 1) {
          setEditingCell({ id, field: EDITABLE_FIELDS[currentFieldIndex + 1] });
        } else if (currentEntryIndex < entries.length - 1) {
          setEditingCell({ id: entries[currentEntryIndex + 1].id, field: EDITABLE_FIELDS[0] });
        }
      } else if (e.key === "Tab" && e.shiftKey) {
        if (currentFieldIndex > 0) {
          setEditingCell({ id, field: EDITABLE_FIELDS[currentFieldIndex - 1] });
        } else if (currentEntryIndex > 0) {
          setEditingCell({ id: entries[currentEntryIndex - 1].id, field: EDITABLE_FIELDS[EDITABLE_FIELDS.length - 1] });
        }
      } else if (e.key === "Enter") {
        if (currentEntryIndex < entries.length - 1) {
          setEditingCell({ id: entries[currentEntryIndex + 1].id, field: "name" });
        }
      }
    }
  };

  const filledEntries = entries.filter((e) => e.name.trim() !== "");

  const summary = calcSummary(filledEntries, config.ticketPrice);
  const totalTicketsForSide = side === "groom" ? config.groomTickets : config.brideTickets;
  const remainingTickets = totalTicketsForSide - summary.tickets;

  const sideLabel = side === "groom" ? "신랑" : "신부";
  const sideColor = side === "groom" ? "blue" : "pink";

  const renderRelation = (entry: GiftEntry) => {
    const isEmpty = !entry.name.trim();
    if (isEmpty) return null;
    return (
      <div className="flex gap-1 flex-wrap">
        {RELATIONS.map((r) => (
          <button
            key={r}
            onClick={() => updateEntry(entry.id, "relation", entry.relation === r ? "" : r)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              entry.relation === r
                ? sideColor === "blue" ? "bg-blue-500 text-white" : "bg-pink-500 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    );
  };

  const renderCell = (entry: GiftEntry, field: EditableField) => {
    const isEditing = editingCell?.id === entry.id && editingCell?.field === field;
    const isEmpty = !entry.name.trim();

    if (field === "relation") return null;

    if (field === "people" || field === "tickets") {
      if (isEditing) {
        return (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            className="w-full h-full px-2 py-2 border border-blue-300 outline-none bg-blue-50 rounded text-center"
            value={entry[field] === 0 ? "" : entry[field].toString()}
            onChange={(e) => {
              const num = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
              updateEntry(entry.id, field, isNaN(num) ? 0 : num);
            }}
            onBlur={handleCellBlur}
            onKeyDown={(e) => handleKeyDown(e, entry.id, field)}
          />
        );
      }
      return (
        <span className={`block text-center ${isEmpty ? "text-gray-300" : ""}`}>
          {isEmpty ? "-" : `${entry[field]}${field === "people" ? "명" : "장"}`}
        </span>
      );
    }

    if (field === "amount") {
      if (isEditing) {
        const manwon = entry.amount === 0 ? "" : (entry.amount / 10000).toString();
        return (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              className="w-full h-full px-2 py-2 border border-blue-300 outline-none bg-blue-50 rounded text-right"
              value={manwon}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.]/g, "");
                const num = parseFloat(raw);
                updateEntry(entry.id, "amount", isNaN(num) ? 0 : Math.round(num * 10000));
              }}
              onBlur={handleCellBlur}
              onKeyDown={(e) => handleKeyDown(e, entry.id, field)}
              placeholder="만원"
            />
            <span className="text-gray-400 text-sm shrink-0">만</span>
          </div>
        );
      }
      return (
        <span className={`text-right block pr-2 ${isEmpty ? "text-gray-300" : ""}`}>
          {isEmpty ? "" : formatMoney(entry.amount)}
        </span>
      );
    }

    if (field === "note") {
      if (isEditing) {
        return (
          <input
            ref={inputRef}
            type="text"
            className="w-full h-full px-2 py-2 border border-blue-300 outline-none bg-blue-50 rounded"
            value={entry.note}
            onChange={(e) => updateEntry(entry.id, "note", e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => handleKeyDown(e, entry.id, field)}
            placeholder="비고"
          />
        );
      }
      return (
        <div className="flex items-center gap-1">
          <span className="block px-2 truncate flex-1">
            {entry.note || ""}
          </span>
          {!isEmpty && (
            <button
              onClick={() => updateEntry(entry.id, "note", entry.note === "계좌송금" ? "" : "계좌송금")}
              className={`px-2 py-0.5 rounded text-xs shrink-0 transition-colors ${
                entry.note === "계좌송금"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              계좌송금
            </button>
          )}
        </div>
      );
    }

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          className="w-full h-full px-2 py-2 border border-blue-300 outline-none bg-blue-50 rounded"
          value={entry[field] as string}
          onChange={(e) => updateEntry(entry.id, field, e.target.value)}
          onBlur={handleCellBlur}
          onKeyDown={(e) => handleKeyDown(e, entry.id, field)}
          placeholder="이름 입력"
        />
      );
    }

    return (
      <span className="block px-2 truncate">
        {(entry[field] as string) || (
          <span className="text-gray-300">이름 입력</span>
        )}
      </span>
    );
  };

  const pinModal = pinPrompt ? (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{pinPrompt.title}</h3>
        <p className="text-xs text-gray-500 mb-4">숫자 비밀번호를 입력하세요</p>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pinInput}
          onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitPin();
            if (e.key === "Escape") setPinPrompt(null);
          }}
          className={`w-full px-4 py-3 text-center text-xl tracking-widest border-2 rounded-xl outline-none ${
            pinError ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"
          }`}
          placeholder="••••"
        />
        {pinError && <p className="text-xs text-red-500 mt-2 text-center">비밀번호가 틀렸습니다</p>}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setPinPrompt(null)}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={submitPin}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  if (page === "settlement") {
    if (!settlementData) {
      return (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-400">불러오는 중...</p>
        </div>
      );
    }
    const groomEntries = settlementData.groom;
    const brideEntries = settlementData.bride;
    const groomSummary = calcSummary(groomEntries, config.ticketPrice);
    const brideSummary = calcSummary(brideEntries, config.ticketPrice);

    const totalTicketsUsed = groomSummary.tickets + brideSummary.tickets;
    const totalFoodCost = config.guaranteedGuests * config.ticketPrice;
    const groomRatio = totalTicketsUsed > 0 ? groomSummary.tickets / totalTicketsUsed : 0;
    const brideRatio = totalTicketsUsed > 0 ? brideSummary.tickets / totalTicketsUsed : 0;
    const groomPayment = Math.round(totalFoodCost * groomRatio);
    const bridePayment = Math.round(totalFoodCost * brideRatio);

    const groomNet = groomSummary.totalAmount - groomPayment;
    const brideNet = brideSummary.totalAmount - bridePayment;

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b-2 border-amber-300 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setPage("select")}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900">축의금 정산</h1>

            <button
              onClick={() => handleDownload("축의금_정산")}
              className="ml-auto text-xs px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              이미지 저장
            </button>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6" ref={captureRef}>
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-3">식권 사용 비율</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-700 font-semibold">신랑 측</span>
                  <span className="text-gray-700">{groomSummary.tickets}장</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${groomRatio * 100}%` }} />
                </div>
              </div>
              <span className="text-lg font-bold text-gray-400 shrink-0">
                {totalTicketsUsed > 0 ? `${Math.round(groomRatio * 100)}:${Math.round(brideRatio * 100)}` : "0:0"}
              </span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-pink-700 font-semibold">신부 측</span>
                  <span className="text-gray-700">{brideSummary.tickets}장</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: `${brideRatio * 100}%` }} />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">보증 {config.guaranteedGuests}명 x ₩{config.ticketPrice.toLocaleString("ko-KR")} = 총 식대 ₩{totalFoodCost.toLocaleString("ko-KR")}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl border-2 border-blue-200 p-4">
              <p className="text-sm font-semibold text-blue-700 mb-3">신랑 측</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">건수 / 인원</span>
                  <span>{groomSummary.count}건 / {groomSummary.people}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">식권</span>
                  <span>{groomSummary.tickets}장</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">식대 부담</span>
                  <span className="font-bold text-lg text-blue-700">
                    ₩{groomPayment.toLocaleString("ko-KR")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-pink-200 p-4">
              <p className="text-sm font-semibold text-pink-700 mb-3">신부 측</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">건수 / 인원</span>
                  <span>{brideSummary.count}건 / {brideSummary.people}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">식권</span>
                  <span>{brideSummary.tickets}장</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">식대 부담</span>
                  <span className="font-bold text-lg text-pink-700">
                    ₩{bridePayment.toLocaleString("ko-KR")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            총 식대 = 보증인원 x 식권단가 / 식대 부담 = 총 식대 x 식권 비율
          </p>
        </main>
      </div>
    );
  }

  if (page === "home") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Wedding Manager</h1>
          <div className="flex gap-6">
            <button
              onClick={() => setPage("select")}
              className="w-48 h-48 bg-white border-2 border-amber-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-amber-500 hover:shadow-lg transition-all group"
            >
              <span className="text-5xl">💒</span>
              <span className="text-lg font-semibold text-amber-700 group-hover:text-amber-800">축의금 관리</span>
            </button>
            <button
              onClick={() => askPin("신혼여행 일정 비밀번호", "8789", () => setPage("itinerary"))}
              className="w-48 h-48 bg-white border-2 border-teal-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-teal-500 hover:shadow-lg transition-all group"
            >
              <span className="text-5xl">✈️</span>
              <span className="text-lg font-semibold text-teal-700 group-hover:text-teal-800">신혼여행 일정</span>
            </button>
          </div>
        </div>
        {pinModal}
      </div>
    );
  }

  if (page === "itinerary") {
    return <ItineraryView onBack={() => setPage("home")} />;
  }

  if (!side) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <button
              onClick={() => setPage("home")}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">축의금 관리</h1>
          </div>
          <p className="text-gray-500 mb-6">관리할 측을 선택하세요</p>

          <div className="mb-6 w-full max-w-sm mx-auto">
            {!showConfig ? (
              <button
                onClick={() => askPin("식권 설정 비밀번호", "8789", () => setShowConfig(true))}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                식권 설정
              </button>
            ) : (
              <button
                onClick={() => setShowConfig(false)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                설정 닫기
              </button>
            )}
          </div>
          {showConfig && <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 w-full max-w-sm mx-auto text-left">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm text-gray-700 shrink-0">보증 인원</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:border-blue-400"
                    value={config.guaranteedGuests === 0 ? "" : config.guaranteedGuests.toString()}
                    onChange={(e) => {
                      const num = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                      updateConfig({ guaranteedGuests: isNaN(num) ? 0 : num });
                    }}
                  />
                  <span className="text-sm text-gray-400">명</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm text-gray-700 shrink-0">식권 단가</label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">₩</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:border-blue-400"
                    value={config.ticketPrice === 0 ? "" : config.ticketPrice.toLocaleString("ko-KR")}
                    onChange={(e) => {
                      const num = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                      updateConfig({ ticketPrice: isNaN(num) ? 0 : num });
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm text-blue-700 shrink-0">신랑측 식권</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:border-blue-400"
                    value={config.groomTickets === 0 ? "" : config.groomTickets.toString()}
                    onChange={(e) => {
                      const num = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                      updateConfig({ groomTickets: isNaN(num) ? 0 : num });
                    }}
                  />
                  <span className="text-sm text-gray-400">장</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm text-pink-700 shrink-0">신부측 식권</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:border-blue-400"
                    value={config.brideTickets === 0 ? "" : config.brideTickets.toString()}
                    onChange={(e) => {
                      const num = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                      updateConfig({ brideTickets: isNaN(num) ? 0 : num });
                    }}
                  />
                  <span className="text-sm text-gray-400">장</span>
                </div>
              </div>
            </div>
          </div>}

          <div className="flex gap-6 mb-8">
            <button
              onClick={() => askPin("신랑측 비밀번호", "0910", () => {
                setSide("groom");
                setPage("groom");
              })}
              className="w-44 h-44 bg-white border-2 border-blue-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:shadow-lg transition-all group"
            >
              <span className="text-5xl">🤵</span>
              <span className="text-lg font-semibold text-blue-700 group-hover:text-blue-800">신랑측</span>
            </button>
            <button
              onClick={() => askPin("신부측 비밀번호", "0925", () => {
                setSide("bride");
                setPage("bride");
              })}
              className="w-44 h-44 bg-white border-2 border-pink-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-pink-500 hover:shadow-lg transition-all group"
            >
              <span className="text-5xl">👰</span>
              <span className="text-lg font-semibold text-pink-700 group-hover:text-pink-800">신부측</span>
            </button>
          </div>
          <button
            onClick={() => setPage("settlement")}
            className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
          >
            정산하기
          </button>
        </div>
        {pinModal}
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className={`bg-white border-b-2 ${sideColor === "blue" ? "border-blue-200" : "border-pink-200"} sticky top-0 z-10`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                localStorage.removeItem("wedding-gift-side");
                setSide(null);
                setEntries([]);
                setLoaded(false);
                setPage("select");
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="돌아가기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900">
              {sideLabel} 측 축의금
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${sideColor === "blue" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
              식권 {summary.tickets} / {totalTicketsForSide}장 (잔여 {remainingTickets}장)
            </span>
            <button
              onClick={() => handleDownload(`${sideLabel}측_축의금`)}
              className={`text-xs px-3 py-1.5 rounded-lg text-white transition-colors ${sideColor === "blue" ? "bg-blue-500 hover:bg-blue-600" : "bg-pink-500 hover:bg-pink-600"}`}
            >
              이미지 저장
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4" ref={captureRef}>
        <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className={`${sideColor === "blue" ? "bg-blue-600" : "bg-pink-600"} text-white`}>
                  <th className="px-3 py-3 text-center font-semibold w-12 border-r border-white/30">No.</th>
                  <th className="px-3 py-3 text-left font-semibold w-44 border-r border-white/30">이름</th>
                  <th className="px-3 py-3 text-center font-semibold w-20 border-r border-white/30">인원</th>
                  <th className="px-3 py-3 text-center font-semibold w-20 border-r border-white/30">식권수</th>
                  <th className="px-3 py-3 text-right font-semibold w-32 border-r border-white/30">축의금</th>
                  <th className="px-3 py-3 text-center font-semibold w-44 border-r border-white/30">관계</th>
                  <th className="px-3 py-3 text-left font-semibold border-r border-white/30">비고</th>
                  <th className="px-2 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const isEmpty = !entry.name.trim();
                  const filledIndex = isEmpty ? null : filledEntries.indexOf(entry) + 1;
                  const rowBg = isEmpty ? "bg-gray-50" : index % 2 === 0 ? "bg-white" : "bg-gray-50";

                  return (
                    <tr
                      key={entry.id}
                      className={`border-b border-gray-300 hover:bg-blue-50/50 transition-colors ${rowBg}`}
                    >
                      <td className="px-3 py-2 text-gray-500 text-center border-r border-gray-300 font-medium">
                        {filledIndex ?? ""}
                      </td>
                      <td
                        className="px-1 py-2 cursor-text border-r border-gray-300"
                        onClick={() => handleCellClick(entry.id, "name")}
                      >
                        {renderCell(entry, "name")}
                      </td>
                      <td
                        className="px-1 py-2 cursor-text border-r border-gray-300"
                        onClick={() => handleCellClick(entry.id, "people")}
                      >
                        {renderCell(entry, "people")}
                      </td>
                      <td
                        className="px-1 py-2 cursor-text border-r border-gray-300"
                        onClick={() => handleCellClick(entry.id, "tickets")}
                      >
                        {renderCell(entry, "tickets")}
                      </td>
                      <td
                        className="px-1 py-2 cursor-text border-r border-gray-300"
                        onClick={() => handleCellClick(entry.id, "amount")}
                      >
                        {renderCell(entry, "amount")}
                      </td>
                      <td className="px-2 py-2 border-r border-gray-300">
                        {renderRelation(entry)}
                      </td>
                      <td
                        className="px-1 py-2 cursor-text border-r border-gray-300"
                        onClick={() => handleCellClick(entry.id, "note")}
                      >
                        {renderCell(entry, "note")}
                      </td>
                      <td className="px-1 py-2">
                        {!isEmpty && (
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                            title="삭제"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {recentlyDeleted && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white rounded-full shadow-lg px-5 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <span className="text-sm">
            <span className="text-gray-300">삭제됨:</span>{" "}
            <span className="font-medium">{recentlyDeleted.entry.name}</span>
          </span>
          <button
            onClick={undoDelete}
            className="text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors"
          >
            되돌리기
          </button>
          <button
            onClick={() => setRecentlyDeleted(null)}
            className="text-gray-400 hover:text-white transition-colors ml-1"
            title="닫기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
