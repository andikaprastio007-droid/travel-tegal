import { prisma } from "./db";

const DEFAULTS: Record<string,string> = {
  travel_name: process.env.NEXT_PUBLIC_TRAVEL_NAME ?? "Tegal Travel",
  travel_tagline: process.env.NEXT_PUBLIC_TRAVEL_TAGLINE ?? "Perjalanan nyaman, aman, dan mudah dipesan.",
  whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281234567890",
  contact_address: "Tegal, Jawa Tengah",
  contact_email: "info@travel.local",
  qris_image_url: "",
  footer_text: "© 2026 Tegal Travel. All rights reserved.",
};

export type SettingsMap = Record<string,string>;

export async function getSettings(): Promise<SettingsMap> {
  const rows = await prisma.setting.findMany();
  const map: SettingsMap = { ...DEFAULTS };
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export async function updateSettings(e: Record<string,string>) {
  await prisma.$transaction(
    Object.entries(e).map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } })
    )
  );
}
