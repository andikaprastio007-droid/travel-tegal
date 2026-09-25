import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = `${s.travel_name} — Travel Tegal ↔ Jabodetabek`;
  const desc = "Travel Tegal Jakarta, Tangerang, Bekasi, Bogor, Depok. Booking online, carter mobil, pembayaran mudah, konfirmasi WhatsApp.";
  return {
    title, description: desc,
    keywords: ["travel Tegal Jakarta","travel Tegal Jabodetabek","travel Tegal Tangerang","travel Tegal Bekasi","travel Tegal Bogor","travel Tegal Depok","carter mobil Tegal"],
    openGraph: { title, description: desc, type: "website", locale: "id_ID" },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body>{children}</body></html>;
}
