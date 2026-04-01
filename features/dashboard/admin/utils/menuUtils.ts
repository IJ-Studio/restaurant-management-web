"use client";

import { type TagKey } from "../data/menuMock";

export function normalizeStr(s: string) {
  return (s || "").trim();
}

export function normalizeKey(s: string) {
  return normalizeStr(s).toLowerCase();
}

export function parseBool(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["1", "true", "si", "sí", "yes", "y", "on"].includes(v)) return true;
    if (["0", "false", "no", "n", "off"].includes(v)) return false;
  }
  return fallback;
}

export function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.trim().replace(",", "."));
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export function toTagKeys(raw: unknown): TagKey[] {
  const allowed: TagKey[] = ["popular", "vegano", "picante", "nuevo", "sin-gluten"];
  const out: TagKey[] = [];
  const push = (k: string) => {
    const key = normalizeKey(k) as TagKey;
    if (allowed.includes(key) && !out.includes(key)) out.push(key);
  };
  if (Array.isArray(raw)) raw.forEach((x) => push(String(x)));
  else if (typeof raw === "string")
    raw.split(/[|,]/g).forEach((x) => push(x.trim()));
  return out;
}

export function csvEscape(v: unknown) {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i],
      next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = false;
        continue;
      }
      cell += ch;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\r") continue;
    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }
  row.push(cell);
  rows.push(row);
  return rows.filter((r) => r.some((c) => String(c).trim().length > 0));
}

export function filenameFromCD(v: string | null) {
  if (!v) return null;
  const m = v.match(/filename\*?=(?:UTF-8''|\"?)([^\";]+)\"?/i);
  if (!m?.[1]) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

export async function downloadAsFile(url: string, fallback: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const filename = filenameFromCD(res.headers.get("content-disposition")) ?? fallback;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
