import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { SearchForm } from "@/components/SearchForm";
import { formatDateID, formatIDR, isPastDate, todayISO } from "@/lib/utils";
import Link from "next/link";
import { Clock, Users } from "lucide-react";

export const dynamic = "force-dynamic";

type SP = { origin?: string; destination?: string; date?: string; passengers?: string };

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const settings = await getSettings();
  const cities = await prisma.city.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  const origin = searchParams.origin ?? "";
  const destination = searchParams.destination ?? "";
  const date = searchParams.date ?? todayISO();
  const passengers = Number(searchParams.passengers ?? 1);

  let route = null;
  let schedules: Awaited<ReturnType<typeof prisma.schedule.findMany<{ include: { route: true; vehicle: true } }>>> = [];

  if (origin && destination) {
    route = await prisma.route.findFirst({ where: { origin, destination, isActive: true } });
    if (route) {
      schedules = await prisma.schedule.findMany({
        where: { routeId: route.id, isActive: true },
        orderBy: { departureTime: "asc" },
        include: { route: true, vehicle: true },
      });
    }
  }

  const usedSeatsMap: Record<string, number> = {};
  if (route && schedules.length > 0) {
    const departDate = new Date(date + "T00:00:00");
    const agg = await prisma.booking.groupBy({
      by: ["scheduleId"],
      where: { scheduleId: { in: schedules.map(s => s.id) }, departureDate: departDate, status: { not: "CANCELLED" } },
      _sum: { passengerCount: true },
    });
    for (const a of agg) if (a.scheduleId) usedSeatsMap[a.scheduleId] = a._sum.passengerCount ?? 0;
  }

  const dateIsPast = isPastDate(date);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar travelName={settings.travel_name} />
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <SearchForm cities={cities} defaultOrigin={origin || "Tegal"} defaultDestination={destination || "Jakarta"} />
        {!origin || !destination ? (
          <div className="card text-center text-gray-600 py-10">Silakan pilih rute terlebih dahulu.</div>
        ) : dateIsPast ? (
          <div className="card text-center text-red-600 py-10">Tanggal yang dipilih sudah lewat.</div>
        ) : !route ? (
          <div className="card text-center text-gray-600 py-10">Rute <strong>{origin} → {destination}</strong> tidak tersedia.</div>
        ) : schedules.length === 0 ? (
          <div className="card text-center text-gray-600 py-10">Belum ada jadwal untuk rute ini.</div>
        ) : (
          <>
            <div className="flex items-baseline justify-between">
              <h1 className="text-lg sm:text-xl font-bold">{origin} → {destination}</h1>
              <span className="text-sm text-gray-500">{formatDateID(date)}</span>
            </div>
            <div className="space-y-3">
              {schedules.map(s => {
                const used = usedSeatsMap[s.id] ?? 0;
                const available = Math.max(0, s.capacity - used);
                const price = s.priceOverride ?? s.route.basePrice;
                const disabled = available < passengers;
                return (
                  <div key={s.id} className="card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-semibold text-lg">
                          <Clock className="h-4 w-4 text-brand-600" />{s.departureTime} WIB
                        </div>
                        {s.vehicle && <p className="text-xs text-gray-500 mt-1">{s.vehicle.name} · {s.vehicle.plateNumber}</p>}
                        <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{available} kursi tersedia</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-brand-700">{formatIDR(price)}</div>
                        <div className="text-xs text-gray-500">/ orang</div>
                        {disabled ? (
                          <button disabled className="mt-3 btn-primary opacity-50 cursor-not-allowed">Tidak tersedia</button>
                        ) : (
                          <Link href={`/booking/${s.id}?date=${date}&passengers=${passengers}`} className="mt-3 btn-primary">Pesan</Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer travelName={settings.travel_name} address={settings.contact_address} email={settings.contact_email} footerText={settings.footer_text} />
      <WhatsAppFloat phone={settings.whatsapp_number} />
    </div>
  );
}
