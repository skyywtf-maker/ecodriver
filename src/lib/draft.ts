"use client";

import type { PriceBreakdown } from "./pricing";

export type DraftPoint = { label: string; lat: number; lng: number };

export type TripDraft = {
  from: DraftPoint;
  to: DraftPoint;
  date: string;
  time: string;
  passengers: number;
  luggage: number;
  quote: { distanceKm: number; durationMin: number; price: PriceBreakdown; geometry: [number, number][] };
};

const KEY = "ecodriver:trip";

export function saveDraft(d: TripDraft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}

export function loadDraft(): TripDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TripDraft) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}
