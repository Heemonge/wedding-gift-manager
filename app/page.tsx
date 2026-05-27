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

type ItinerarySection = "schedule" | "checklist" | "reservations" | "immigration" | "budget" | "insurance";

const ITINERARY_SECTIONS: { key: ItinerarySection; emoji: string; label: string }[] = [
  { key: "schedule", emoji: "📅", label: "일정" },
  { key: "checklist", emoji: "✅", label: "준비물" },
  { key: "reservations", emoji: "🎫", label: "사전예약" },
  { key: "immigration", emoji: "🛂", label: "입국·서류" },
  { key: "budget", emoji: "💰", label: "예산" },
  { key: "insurance", emoji: "🛡️", label: "보험" },
];

function ItineraryView({ onBack }: { onBack: () => void }) {
  const [section, setSection] = useState<ItinerarySection>("schedule");
  const [activeCityIndex, setActiveCityIndex] = useState(0);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [hideChecked, setHideChecked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wedding-checklist");
    if (saved) setCheckedItems(JSON.parse(saved));
  }, []);

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("wedding-checklist", JSON.stringify(next));
      return next;
    });
  };

  const city = cities[activeCityIndex];

  const toggleDay = (dayKey: string) => {
    setExpandedDays((prev) => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  const isDayExpanded = (dayKey: string) => {
    return expandedDays[dayKey] ?? true;
  };

  // Group reservations by city
  const reservationsByCity = reservations.reduce<Record<string, typeof reservations>>((acc, r) => {
    if (!acc[r.city]) acc[r.city] = [];
    acc[r.city].push(r);
    return acc;
  }, {});

  const statusBadge = (status: "완료" | "미완료" | "주의") => {
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
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500">
              {Object.values(checkedItems).filter(Boolean).length} / {checklist.reduce((s, c) => s + c.items.length, 0)} 완료
            </span>
            <button
              onClick={() => setHideChecked(!hideChecked)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${hideChecked ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-500"}`}
            >
              {hideChecked ? "체크한 항목 숨김" : "체크한 항목 숨기기"}
            </button>
          </div>
          <div className="space-y-4">
            {checklist.map((cat) => {
              const visibleItems = hideChecked
                ? cat.items.filter((_, idx) => !checkedItems[`${cat.title}-${idx}`])
                : cat.items;
              const checkedCount = cat.items.filter((_, idx) => checkedItems[`${cat.title}-${idx}`]).length;
              if (hideChecked && visibleItems.length === 0) return null;
              return (
                <div key={cat.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-teal-50 border-b border-teal-100">
                    <h3 className="text-sm font-bold text-teal-800">
                      <span className="mr-1.5">{cat.icon}</span>{cat.title}
                      <span className="ml-2 text-xs font-normal text-teal-600">({checkedCount}/{cat.items.length})</span>
                    </h3>
                  </div>
                  <div>
                    {visibleItems.map((item) => {
                      const origIdx = cat.items.indexOf(item);
                      const key = `${cat.title}-${origIdx}`;
                      const checked = !!checkedItems[key];
                      return (
                        <button
                          key={origIdx}
                          onClick={() => toggleCheck(key)}
                          className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm text-left transition-colors ${
                            checked ? "bg-teal-50/50" : origIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          } border-b border-gray-50 last:border-b-0`}
                        >
                          <span className={`shrink-0 ${checked ? "text-teal-500" : "text-gray-300"}`}>
                            {checked ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                              </svg>
                            )}
                          </span>
                          <span className={`flex-1 ${checked ? "line-through text-gray-400" : "text-gray-800"}`}>{item.name}</span>
                          {item.note && (
                            <span className="text-xs text-gray-400 shrink-0 max-w-[140px] text-right">{item.note}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* ───── RESERVATIONS SECTION ───── */}
      {section === "reservations" && (
        <main className="max-w-2xl mx-auto px-4 py-4 pb-12">
          {/* Summary counts */}
          <div className="flex gap-2 mb-4">
            {(["완료", "미완료", "주의"] as const).map((s) => {
              const count = reservations.filter((r) => r.status === s).length;
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
                        <div className="shrink-0 mt-0.5">
                          {statusBadge(r.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
          {/* Total Card */}
          <div className="bg-teal-700 text-white rounded-xl p-4 mb-4">
            <p className="text-xs text-teal-200 mb-1">총 예상 비용 (환율 ₩{budget.exchangeRate})</p>
            <p className="text-2xl font-bold">{budget.total.krw}</p>
            <p className="text-sm text-teal-200 mt-0.5">{budget.total.usd}</p>
          </div>

          {/* Budget Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-teal-50 border-b border-teal-100">
                    <th className="px-3 py-2.5 text-left font-semibold text-teal-800">항목</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-teal-800 w-24">USD</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-teal-800 w-28">KRW</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-teal-800 w-20">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.items.map((item, idx) => (
                    <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"} border-b border-gray-50`}>
                      <td className="px-3 py-2.5">
                        <span className="text-gray-800">{item.category}</span>
                        <span className="block text-xs text-gray-500 mt-0.5">{item.item}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-700 font-mono text-xs">{item.usd}</td>
                      <td className="px-3 py-2.5 text-right text-gray-900 font-medium">{item.krw}</td>
                      <td className="px-3 py-2.5 text-center text-xs text-gray-400">{item.memo}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-teal-50 border-t-2 border-teal-200">
                    <td className="px-3 py-3 font-bold text-teal-800">합계</td>
                    <td className="px-3 py-3 text-right font-bold text-teal-800 font-mono text-xs">{budget.total.usd}</td>
                    <td className="px-3 py-3 text-right font-bold text-teal-800">{budget.total.krw}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
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
    } else {
      setPage("home");
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
              onClick={() => setPage("itinerary")}
              className="w-48 h-48 bg-white border-2 border-teal-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-teal-500 hover:shadow-lg transition-all group"
            >
              <span className="text-5xl">✈️</span>
              <span className="text-lg font-semibold text-teal-700 group-hover:text-teal-800">신혼여행 일정</span>
            </button>
          </div>
        </div>
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
                onClick={() => {
                  const pw = prompt("비밀번호를 입력하세요");
                  if (pw === "8789") setShowConfig(true);
                }}
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
    </div>
  );
}
