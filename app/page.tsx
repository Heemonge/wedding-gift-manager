"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas-pro";

const DEFAULT_TICKET_PRICE = 65000;
const DEFAULT_TOTAL_TICKETS = 200;
const DEFAULT_GUARANTEED_GUESTS = 220;

interface TicketConfig {
  ticketPrice: number;
  groomTickets: number;
  brideTickets: number;
  guaranteedGuests: number;
}

function loadConfig(): TicketConfig {
  if (typeof window === "undefined") return { ticketPrice: DEFAULT_TICKET_PRICE, groomTickets: DEFAULT_TOTAL_TICKETS, brideTickets: DEFAULT_TOTAL_TICKETS, guaranteedGuests: DEFAULT_GUARANTEED_GUESTS };
  const saved = localStorage.getItem("wedding-gift-config");
  if (saved) return JSON.parse(saved);
  return { ticketPrice: DEFAULT_TICKET_PRICE, groomTickets: DEFAULT_TOTAL_TICKETS, brideTickets: DEFAULT_TOTAL_TICKETS, guaranteedGuests: DEFAULT_GUARANTEED_GUESTS };
}

function saveConfig(config: TicketConfig) {
  localStorage.setItem("wedding-gift-config", JSON.stringify(config));
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
type Page = "select" | "groom" | "bride" | "settlement";

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

export default function Home() {
  const [page, setPage] = useState<Page>("select");
  const [side, setSide] = useState<Side | null>(null);
  const [entries, setEntries] = useState<GiftEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [editingCell, setEditingCell] = useState<{ id: string; field: EditableField } | null>(null);
  const [config, setConfig] = useState<TicketConfig>({ ticketPrice: DEFAULT_TICKET_PRICE, groomTickets: DEFAULT_TOTAL_TICKETS, brideTickets: DEFAULT_TOTAL_TICKETS, guaranteedGuests: DEFAULT_GUARANTEED_GUESTS });
  const [showConfig, setShowConfig] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const captureRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = async (filename: string) => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, { backgroundColor: "#f9fafb", scale: 2 });
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  useEffect(() => {
    setConfig(loadConfig());
    const savedSide = localStorage.getItem("wedding-gift-side") as Side | null;
    if (savedSide === "groom" || savedSide === "bride") {
      setSide(savedSide);
      setPage(savedSide);
    }
    setInitializing(false);
  }, []);

  const updateConfig = (partial: Partial<TicketConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveConfig(next);
      return next;
    });
  };

  useEffect(() => {
    if (!side) return;
    localStorage.setItem("wedding-gift-side", side);
    const saved = localStorage.getItem(getStorageKey(side));
    if (saved) {
      const parsed: GiftEntry[] = JSON.parse(saved);
      const hasEmpty = parsed.some((e) => !e.name.trim());
      if (!hasEmpty) {
        parsed.push(createEmptyEntry());
      }
      setEntries(parsed);
    } else {
      setEntries([createEmptyEntry()]);
    }
    setLoaded(true);
  }, [side]);

  const saveToStorage = (newEntries: GiftEntry[]) => {
    if (!side) return;
    const toSave = newEntries.filter((e) => e.name.trim() !== "");
    localStorage.setItem(getStorageKey(side), JSON.stringify(toSave));
  };

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const updateEntry = (id: string, field: keyof GiftEntry, value: string | number) => {
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
      saveToStorage(updated);
      return updated;
    });
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      if (filtered.length === 0 || !filtered.some((e) => !e.name.trim())) {
        filtered.push(createEmptyEntry());
      }
      saveToStorage(filtered);
      return filtered;
    });
  };

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

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  if (page === "settlement") {
    const groomEntries = loadEntriesFromStorage("groom");
    const brideEntries = loadEntriesFromStorage("bride");
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

  if (!side) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">축의금 관리</h1>
          <p className="text-gray-500 mb-6">관리할 측을 선택하세요</p>

          <div className="mb-6 w-full max-w-sm mx-auto">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfig ? "설정 닫기" : "식권 설정"}
            </button>
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
              onClick={() => { setSide("groom"); setPage("groom"); }}
              className="w-44 h-44 bg-white border-2 border-blue-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:shadow-lg transition-all group"
            >
              <span className="text-5xl">🤵</span>
              <span className="text-lg font-semibold text-blue-700 group-hover:text-blue-800">신랑측</span>
            </button>
            <button
              onClick={() => { setSide("bride"); setPage("bride"); }}
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
              식권 단가 ₩{config.ticketPrice.toLocaleString("ko-KR")} / 총 {totalTicketsForSide}장 (잔여 {remainingTickets}장)
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
        <div className="flex gap-3 mb-4 text-sm">
          <div className="bg-white rounded-lg border border-gray-200 p-3 flex-1">
            <p className="text-xs text-gray-500">축의금 합계</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              ₩{summary.totalAmount.toLocaleString("ko-KR")}
            </p>
            <p className="text-xs text-gray-400 mt-1">{summary.count}건 / {summary.people}명 / 식권 {summary.tickets}장</p>
          </div>
        </div>

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
    </div>
  );
}
