import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDateID(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  }).format(d);
}

export function normalizePhone(input: string): string {
  const d = input.replace(/\D/g, "");
  if (d.startsWith("0")) return "62" + d.slice(1);
  if (d.startsWith("62")) return d;
  if (d.startsWith("8")) return "62" + d;
  return d;
}

export function isPastDate(dateISO: string): boolean {
  const t = new Date(); t.setHours(0,0,0,0);
  const d = new Date(dateISO + "T00:00:00");
  return d < t;
}

export function todayISO(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
}
