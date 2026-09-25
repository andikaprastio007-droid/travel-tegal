#!/usr/bin/env bash
set -e

# Pastikan kita ada di folder travel-tegal
if [ ! -f package.json ]; then
  echo "❌ Jalankan script ini dari dalam folder travel-tegal/"
  echo "   cd travel-tegal && bash bootstrap-part2.sh"
  exit 1
fi

read -p "URL repo GitHub (kosongkan untuk skip push): " REPO_URL

# ============================================================
# [1/5] HALAMAN CUSTOMER
# ============================================================
echo "▶ [1/5] Menulis halaman customer..."

# ---- layout.tsx ----
cat > src/app/layout.tsx << 'EOF'
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
EOF

# ---- Homepage ----
cat > src/app/page.tsx << 'EOF'
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { SearchForm } from "@/components/SearchForm";
import Link from "next/link";
import { Bus, Car, CalendarCheck, CreditCard, MessageCircle } from "lucide-react";
import { todayISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const cities = await prisma.city.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const popularRoutes = await prisma.route.findMany({
    where: { isActive: true, origin: "Tegal" }, take: 5, orderBy: { destination: "asc" },
  });

  const services = [
    { icon: Bus, title: "Travel Antar Kota", desc: "Tegal ↔ Jabodetabek setiap hari" },
    { icon: Car, title: "Carter Mobil", desc: "MPV, Minibus, Elf, Hiace" },
    { icon: CalendarCheck, title: "Booking Online", desc: "Pesan kapan saja, di mana saja" },
    { icon: CreditCard, title: "Pembayaran Fleksibel", desc: "Transfer, QRIS, atau WhatsApp" },
    { icon: MessageCircle, title: "Konfirmasi WhatsApp", desc: "Cepat & langsung ke admin" },
  ];
  const advantages = [
    { title: "Tepat Waktu", desc: "Jadwal keberangkatan terjaga" },
    { title: "Armada Nyaman", desc: "Kendaraan terawat & bersih" },
    { title: "Driver Berpengalaman", desc: "Aman & profesional" },
    { title: "Harga Transparan", desc: "Tanpa biaya tersembunyi" },
  ];
  const steps = [
    "Pilih rute & tanggal", "Pilih jadwal keberangkatan", "Isi data penumpang",
    "Pilih metode pembayaran", "Upload bukti / konfirmasi WhatsApp", "Dapatkan kode booking",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar travelName={settings.travel_name} />
      <section className="bg-gradient-to-br from-brand-600 to-brand-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight">Travel Tegal ↔ Jabodetabek</h1>
          <p className="mt-3 text-sm sm:text-lg text-brand-100 max-w-2xl">{settings.travel_tagline}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/search" className="btn bg-white text-brand-700 hover:bg-gray-100">Pesan Tiket</Link>
            <Link href="/carter" className="btn border border-white/70 text-white hover:bg-white/10">Carter Mobil</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 -mt-6 sm:-mt-10 relative z-10">
        <SearchForm cities={cities} />
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Rute Populer</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularRoutes.map(r => (
            <Link key={r.id}
              href={`/search?origin=${encodeURIComponent(r.origin)}&destination=${encodeURIComponent(r.destination)}&date=${todayISO()}&passengers=1`}
              className="card hover:border-brand-500 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{r.origin} → {r.destination}</div>
                <div className="text-brand-600 font-bold text-sm">Rp {r.basePrice.toLocaleString("id-ID")}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-white py-10">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Layanan Kami</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(s => (
              <div key={s.title} className="card">
                <s.icon className="h-8 w-8 text-brand-600 mb-3" />
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Kenapa Pilih Kami?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map(a => (
              <div key={a.title} className="card">
                <h3 className="font-semibold">{a.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-10">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Cara Booking</h2>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <li key={i} className="card flex gap-3 items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-bold">{i + 1}</span>
                <span className="text-sm">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="card bg-green-50 border-green-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Butuh bantuan?</h3>
            <p className="text-sm text-gray-700">Hubungi admin via WhatsApp</p>
          </div>
          <a href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent("Halo Admin, saya ingin bertanya.")}`}
            target="_blank" rel="noopener noreferrer" className="btn-wa">
            <MessageCircle className="h-4 w-4" /> Chat Admin
          </a>
        </div>
      </section>
      <Footer travelName={settings.travel_name} address={settings.contact_address} email={settings.contact_email} footerText={settings.footer_text} />
      <WhatsAppFloat phone={settings.whatsapp_number} />
    </div>
  );
}
EOF

# ---- /search ----
cat > src/app/search/page.tsx << 'EOF'
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
EOF

# ---- /booking/[scheduleId] ----
mkdir -p src/app/booking/\[scheduleId\]
cat > 'src/app/booking/[scheduleId]/page.tsx' << 'EOF'
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookingForm } from "./BookingForm";
import { formatDateID, formatIDR, todayISO } from "@/lib/utils";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params, searchParams,
}: { params: { scheduleId: string }; searchParams: { date?: string; passengers?: string } }) {
  const settings = await getSettings();
  const schedule = await prisma.schedule.findUnique({
    where: { id: params.scheduleId }, include: { route: true, vehicle: true },
  });
  if (!schedule || !schedule.isActive) notFound();

  const date = searchParams.date ?? todayISO();
  const passengers = Number(searchParams.passengers ?? 1);
  const price = schedule.priceOverride ?? schedule.route.basePrice;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar travelName={settings.travel_name} />
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold">Isi Data Pemesan</h1>
        <div className="card bg-brand-50 border-brand-200">
          <h2 className="font-semibold mb-2">Ringkasan Perjalanan</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-gray-600">Rute</dt><dd className="font-medium">{schedule.route.origin} → {schedule.route.destination}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-600">Tanggal</dt><dd className="font-medium">{formatDateID(date)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-600">Jam</dt><dd className="font-medium">{schedule.departureTime} WIB</dd></div>
            <div className="flex justify-between"><dt className="text-gray-600">Jumlah</dt><dd className="font-medium">{passengers} orang</dd></div>
            <div className="flex justify-between"><dt className="text-gray-600">Harga / orang</dt><dd className="font-medium">{formatIDR(price)}</dd></div>
            <div className="flex justify-between border-t pt-1 mt-1"><dt className="font-semibold">Total</dt><dd className="font-bold text-brand-700">{formatIDR(price * passengers)}</dd></div>
          </dl>
        </div>
        <BookingForm scheduleId={schedule.id} departureDate={date} initialPassengers={passengers} price={price} />
      </main>
      <Footer travelName={settings.travel_name} address={settings.contact_address} email={settings.contact_email} footerText={settings.footer_text} />
    </div>
  );
}
EOF

cat > 'src/app/booking/[scheduleId]/BookingForm.tsx' << 'EOF'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Loader2 } from "lucide-react";

type Passenger = { name: string; idNumber: string };

export function BookingForm({
  scheduleId, departureDate, initialPassengers, price,
}: { scheduleId: string; departureDate: string; initialPassengers: number; price: number }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [note, setNote] = useState("");
  const [passengers, setPassengers] = useState<Passenger[]>(
    Array.from({ length: Math.max(1, initialPassengers) }, () => ({ name: "", idNumber: "" }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = price * passengers.length;

  function updatePassenger(i: number, key: keyof Passenger, val: string) {
    const next = [...passengers];
    next[i][key] = val;
    setPassengers(next);
  }
  function addPassenger() { setPassengers([...passengers, { name: "", idNumber: "" }]); }
  function removePassenger(i: number) {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (passengers.some(p => p.name.trim().length < 2)) { setError("Nama setiap penumpang minimal 2 karakter"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId, customerName, customerPhone, pickupAddress, note, departureDate, passengers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat booking");
      router.push(`/booking/success/${data.code}?phone=${encodeURIComponent(customerPhone)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h2 className="font-semibold">Data Pemesan</h2>
      <Input label="Nama lengkap" required minLength={2} value={customerName} onChange={e => setCustomerName(e.target.value)} />
      <Input label="Nomor WhatsApp" placeholder="08xxxxxxxxxx" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
      <Input label="Alamat / Titik Jemput (opsional)" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Data Penumpang ({passengers.length})</h3>
          <button type="button" onClick={addPassenger} className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1">
            <Plus className="h-3 w-3" /> Tambah
          </button>
        </div>
        <div className="space-y-2">
          {passengers.map((p, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <Input label={i === 0 ? "Nama" : undefined} placeholder={`Nama penumpang ${i + 1}`} required value={p.name} onChange={e => updatePassenger(i, "name", e.target.value)} />
              <Input label={i === 0 ? "No. Identitas (opsional)" : undefined} value={p.idNumber} onChange={e => updatePassenger(i, "idNumber", e.target.value)} />
              {passengers.length > 1 && (
                <button type="button" onClick={() => removePassenger(i)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg" aria-label="Hapus">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Textarea label="Catatan tambahan (opsional)" rows={2} value={note} onChange={e => setNote(e.target.value)} />

      <div className="border-t pt-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">Total</div>
          <div className="text-lg font-bold text-brand-700">Rp {total.toLocaleString("id-ID")}</div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</> : "Lanjut ke Pembayaran"}
      </Button>
    </form>
  );
}
EOF

# ---- /booking/success/[code] ----
mkdir -p src/app/booking/success/\[code\]
cat > 'src/app/booking/success/[code]/page.tsx' << 'EOF'
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { formatDateID, formatIDR } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  params, searchParams,
}: { params: { code: string }; searchParams: { phone?: string } }) {
  const settings = await getSettings();
  const booking = await prisma.booking.findUnique({
    where: { code: params.code },
    include: { route: true, schedule: true, passengers: true, charter: { include: { vehicleType: true } } },
  });
  if (!booking) notFound();

  const isCharter = booking.type === "CHARTER";
  const waMsg = encodeURIComponent([
    "Halo Admin, saya sudah membuat booking.", "",
    `Kode Booking: ${booking.code}`,
    `Nama: ${booking.customerName}`,
    isCharter
      ? `Carter: ${booking.charter?.vehicleType.name} (${booking.charter?.origin} → ${booking.charter?.destination})`
      : `Rute: ${booking.route?.origin} → ${booking.route?.destination}`,
    `Tanggal: ${formatDateID(booking.departureDate)}`,
    `Jumlah: ${booking.passengerCount} orang`,
    `Total: Rp ${booking.totalPrice.toLocaleString("id-ID")}`,
  ].join("\n"));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar travelName={settings.travel_name} />
      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div className="text-center">
          <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold">Booking Berhasil Dibuat</h1>
          <p className="text-sm text-gray-600 mt-1">Simpan kode booking Anda</p>
        </div>

        <div className="card bg-brand-50 border-brand-200 text-center">
          <div className="text-xs text-gray-600 mb-1">Kode Booking</div>
          <div className="text-2xl font-mono font-bold text-brand-700">{booking.code}</div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">Ringkasan</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-600">Nama</dt><dd className="font-medium">{booking.customerName}</dd></div>
            {isCharter ? (
              <>
                <div className="flex justify-between"><dt className="text-gray-600">Kendaraan</dt><dd className="font-medium">{booking.charter?.vehicleType.name}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-600">Rute</dt><dd className="font-medium">{booking.charter?.origin} → {booking.charter?.destination}</dd></div>
              </>
            ) : (
              <>
                <div className="flex justify-between"><dt className="text-gray-600">Rute</dt><dd className="font-medium">{booking.route?.origin} → {booking.route?.destination}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-600">Jam</dt><dd className="font-medium">{booking.schedule?.departureTime} WIB</dd></div>
              </>
            )}
            <div className="flex justify-between"><dt className="text-gray-600">Tanggal</dt><dd className="font-medium">{formatDateID(booking.departureDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-600">Jumlah</dt><dd className="font-medium">{booking.passengerCount} orang</dd></div>
            <div className="flex justify-between border-t pt-2"><dt className="font-semibold">Total</dt><dd className="font-bold text-brand-700">{formatIDR(booking.totalPrice)}</dd></div>
          </dl>
        </div>

        <div className="space-y-2">
          <a href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}?text=${waMsg}`}
            target="_blank" rel="noopener noreferrer" className="btn-wa w-full">
            Konfirmasi via WhatsApp
          </a>
          <Link href={`/payment/${booking.code}?phone=${encodeURIComponent(booking.customerPhone)}`} className="btn-primary w-full">
            Lanjut ke Pembayaran
          </Link>
          <Link href="/" className="btn-secondary w-full">Kembali ke Beranda</Link>
        </div>
      </main>
      <Footer travelName={settings.travel_name} address={settings.contact_address} email={settings.contact_email} footerText={settings.footer_text} />
    </div>
  );
}
EOF

# ---- /carter ----
cat > src/app/carter/page.tsx << 'EOF'
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CarterForm } from "./CarterForm";

export const dynamic = "force-dynamic";

export default async function CarterPage() {
  const settings = await getSettings();
  const vehicleTypes = await prisma.vehicleType.findMany({ where: { isActive: true }, orderBy: { capacity: "asc" } });
  const cities = await prisma.city.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar travelName={settings.travel_name} />
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Carter Mobil</h1>
          <p className="text-sm text-gray-600 mt-1">Sewa kendaraan untuk perjalanan Anda. Harga otomatis atau hubungi admin.</p>
        </div>
        <CarterForm vehicleTypes={vehicleTypes} cities={cities} whatsapp={settings.whatsapp_number} />
      </main>
      <Footer travelName={settings.travel_name} address={settings.contact_address} email={settings.contact_email} footerText={settings.footer_text} />
      <WhatsAppFloat phone={settings.whatsapp_number} />
    </div>
  );
}
EOF

cat > src/app/carter/CarterForm.tsx << 'EOF'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { todayISO } from "@/lib/utils";

type VT = { id: string; name: string; capacity: number; description: string | null };
type City = { id: string; name: string; region: string };

export function CarterForm({ vehicleTypes, cities, whatsapp }: { vehicleTypes: VT[]; cities: City[]; whatsapp: string }) {
  const router = useRouter();
  const [vehicleTypeId, setVehicleTypeId] = useState(vehicleTypes[0]?.id ?? "");
  const [origin, setOrigin] = useState("Tegal");
  const [destination, setDestination] = useState("Jakarta");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [departureDate, setDepartureDate] = useState(todayISO());
  const [departureTime, setDepartureTime] = useState("07:00");
  const [durationDays, setDurationDays] = useState(1);
  const [passengerCount, setPassengerCount] = useState(4);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/charters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleTypeId, origin, destination, pickupAddress, dropAddress,
          departureDate, departureTime, durationDays, passengerCount,
          customerName, customerPhone, note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal");
      router.push(`/booking/success/${data.code}?phone=${encodeURIComponent(customerPhone)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally { setLoading(false); }
  }

  const tegal = cities.filter(c => c.region === "Tegal");
  const jabodetabek = cities.filter(c => c.region === "Jabodetabek");

  return (
    <form onSubmit={submit} className="card space-y-4">
      <Select label="Jenis Kendaraan" value={vehicleTypeId} onChange={e => setVehicleTypeId(e.target.value)} required>
        {vehicleTypes.map(v => (
          <option key={v.id} value={v.id}>{v.name} (max {v.capacity} orang) {v.description ? `— ${v.description}` : ""}</option>
        ))}
      </Select>

      <div className="grid gap-3 md:grid-cols-2">
        <Select label="Asal" value={origin} onChange={e => setOrigin(e.target.value)}>
          <optgroup label="Tegal">{tegal.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</optgroup>
          <optgroup label="Jabodetabek">{jabodetabek.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</optgroup>
        </Select>
        <Select label="Tujuan" value={destination} onChange={e => setDestination(e.target.value)}>
          <optgroup label="Tegal">{tegal.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</optgroup>
          <optgroup label="Jabodetabek">{jabodetabek.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</optgroup>
        </Select>
      </div>

      <Input label="Alamat Penjemputan" required value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} />
      <Input label="Alamat Tujuan" required value={dropAddress} onChange={e => setDropAddress(e.target.value)} />

      <div className="grid gap-3 md:grid-cols-3">
        <Input label="Tanggal" type="date" min={todayISO()} value={departureDate} onChange={e => setDepartureDate(e.target.value)} required />
        <Input label="Jam Berangkat" type="time" value={departureTime} onChange={e => setDepartureTime(e.target.value)} required />
        <Input label="Durasi (hari)" type="number" min={1} max={30} value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} required />
      </div>

      <Input label="Jumlah Penumpang" type="number" min={1} max={50} value={passengerCount} onChange={e => setPassengerCount(Number(e.target.value))} required />

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3 text-sm">Data Pemesan</h3>
        <div className="space-y-3">
          <Input label="Nama lengkap" required value={customerName} onChange={e => setCustomerName(e.target.value)} />
          <Input label="Nomor WhatsApp" placeholder="08xxxxxxxxxx" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
        </div>
      </div>

      <Textarea label="Catatan (opsional)" rows={2} value={note} onChange={e => setNote(e.target.value)} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</> : "Pesan Carter"}
      </Button>
      <p className="text-xs text-gray-500 text-center">Harga akan dikonfirmasi admin via WhatsApp jika belum otomatis.</p>
    </form>
  );
}
EOF

# ---- /cek-booking ----
cat > src/app/cek-booking/page.tsx << 'EOF'
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CekBookingForm } from "./CekBookingForm";

export const dynamic = "force-dynamic";

export default async function CekBookingPage() {
  const settings = await getSettings();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar travelName={settings.travel_name} />
      <main className="mx-auto max-w-xl px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold">Cek Booking</h1>
        <p className="text-sm text-gray-600">Masukkan kode booking dan nomor WhatsApp yang digunakan saat memesan.</p>
        <CekBookingForm />
      </main>
      <Footer travelName={settings.travel_name} address={settings.contact_address} email={settings.contact_email} footerText={settings.footer_text} />
      <WhatsAppFloat phone={settings.whatsapp_number} />
    </div>
  );
}
EOF

cat > src/app/cek-booking/CekBookingForm.tsx << 'EOF'
"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Search } from "lucide-react";
import { formatDateID, formatIDR } from "@/lib/utils";

type Booking = {
  code: string; customerName: string; passengerCount: number; totalPrice: number;
  departureDate: string; status: string; paymentStatus: string;
  route: { origin: string; destination: string } | null;
  schedule: { departureTime: string } | null;
  charter: { vehicleType: { name: string }; origin: string; destination: string } | null;
};

const statusMap: Record<string, { label: string; color: "yellow" | "blue" | "green" | "red" | "gray" }> = {
  PENDING_PAYMENT: { label: "Menunggu Pembayaran", color: "yellow" },
  WAITING_VERIFY: { label: "Menunggu Verifikasi", color: "blue" },
  PAID: { label: "Dibayar", color: "blue" },
  CONFIRMED: { label: "Dikonfirmasi", color: "green" },
  COMPLETED: { label: "Selesai", color: "green" },
  CANCELLED: { label: "Dibatalkan", color: "red" },
};
const payMap: Record<string, { label: string; color: "yellow" | "blue" | "green" | "red" | "gray" }> = {
  UNPAID: { label: "Belum Bayar", color: "gray" },
  PENDING: { label: "Menunggu Verifikasi", color: "yellow" },
  PAID: { label: "Lunas", color: "green" },
  REJECTED: { label: "Ditolak", color: "red" },
  REFUNDED: { label: "Refund", color: "gray" },
};

export function CekBookingForm() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBooking(null); setLoading(true);
    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Tidak ditemukan");
      setBooking(data.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="card space-y-3">
        <Input label="Kode Booking" placeholder="TRV-XXXXXXXX-XXXX" required value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
        <Input label="Nomor WhatsApp" placeholder="08xxxxxxxxxx" required value={phone} onChange={e => setPhone(e.target.value)} />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Mencari...</> : <><Search className="h-4 w-4" /> Cek Booking</>}
        </Button>
      </form>

      {error && <div className="card text-center text-red-600 py-6 text-sm">{error}</div>}

      {booking && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono font-bold text-brand-700">{booking.code}</div>
            <Badge color={statusMap[booking.status]?.color ?? "gray"}>{statusMap[booking.status]?.label ?? booking.status}</Badge>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-600">Nama</dt><dd className="font-medium">{booking.customerName}</dd></div>
            {booking.charter ? (
              <div className="flex justify-between"><dt className="text-gray-600">Carter</dt><dd className="font-medium">{booking.charter.vehicleType.name} · {booking.charter.origin} → {booking.charter.destination}</dd></div>
            ) : (
              <>
                <div className="flex justify-between"><dt className="text-gray-600">Rute</dt><dd className="font-medium">{booking.route?.origin} → {booking.route?.destination}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-600">Jam</dt><dd className="font-medium">{booking.schedule?.departureTime} WIB</dd></div>
              </>
            )}
            <div className="flex justify-between"><dt className="text-gray-600">Tanggal</dt><dd className="font-medium">{formatDateID(booking.departureDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-600">Jumlah</dt><dd className="font-medium">{booking.passengerCount} orang</dd></div>
            <div className="flex justify-between"><dt className="text-gray-600">Total</dt><dd className="font-bold text-brand-700">{formatIDR(booking.totalPrice)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-600">Pembayaran</dt><dd><Badge color={payMap[booking.paymentStatus]?.color ?? "gray"}>{payMap[booking.paymentStatus]?.label ?? booking.paymentStatus}</Badge></dd></div>
          </dl>
        </div>
      )}
    </div>
  );
}
EOF

# ---- /payment/[code] ----
mkdir -p src/app/payment/\[code\]
cat > 'src/app/payment/[code]/page.tsx' << 'EOF'
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { notFound } from "next/navigation";
import { PaymentClient } from "./PaymentClient";

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: { params: { code: string } }) {
  const settings = await getSettings();
  const booking = await prisma.booking.findUnique({
    where: { code: params.code },
    include: { payment: true, route: true, charter: { include: { vehicleType: true } } },
  });
  if (!booking) notFound();

  const methods = await prisma.paymentMethod.findMany({
    where: { isActive: true },
    include: { bankAccounts: { where: { isActive: true } } },
    orderBy: { order: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar travelName={settings.travel_name} />
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold">Pembayaran</h1>
        <PaymentClient
          code={booking.code}
          customerPhone={booking.customerPhone}
          customerName={booking.customerName}
          route={booking.charter
            ? `${booking.charter.vehicleType.name}: ${booking.charter.origin} → ${booking.charter.destination}`
            : `${booking.route?.origin} → ${booking.route?.destination}`}
          date={new Date(booking.departureDate).toISOString().slice(0, 10)}
          passengers={booking.passengerCount}
          total={booking.totalPrice}
          paymentStatus={booking.paymentStatus}
          proofUrl={booking.payment?.proofUrl ?? null}
          methods={methods.map(m => ({ id: m.id, type: m.type, name: m.name, bankAccounts: m.bankAccounts }))}
          whatsapp={settings.whatsapp_number}
          qrisImage={settings.qris_image_url}
        />
      </main>
      <Footer travelName={settings.travel_name} address={settings.contact_address} email={settings.contact_email} footerText={settings.footer_text} />
    </div>
  );
}
EOF

cat > 'src/app/payment/[code]/PaymentClient.tsx' << 'EOF'
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Upload, Loader2, CheckCircle, XCircle, Copy } from "lucide-react";
import { formatIDR, formatDateID } from "@/lib/utils";

type BankAccount = { id: string; bankName: string; accountNumber: string; accountName: string };
type Method = { id: string; type: "BANK_TRANSFER" | "QRIS" | "WHATSAPP"; name: string; bankAccounts: BankAccount[] };

export function PaymentClient(props: {
  code: string; customerPhone: string; customerName: string; route: string;
  date: string; passengers: number; total: number;
  paymentStatus: string; proofUrl: string | null;
  methods: Method[]; whatsapp: string; qrisImage: string;
}) {
  const [tab, setTab] = useState<"BANK_TRANSFER" | "QRIS" | "WHATSAPP">(
    (props.methods.find(m => m.type === "BANK_TRANSFER")?.type as "BANK_TRANSFER") ?? "BANK_TRANSFER"
  );
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const waMsg = encodeURIComponent([
    "Halo Admin, saya ingin melakukan pembayaran booking.", "",
    `Kode Booking: ${props.code}`, `Nama: ${props.customerName}`, `Rute: ${props.route}`,
    `Tanggal: ${formatDateID(props.date)}`, `Jumlah: ${props.passengers} orang`,
    `Total: Rp ${props.total.toLocaleString("id-ID")}`, "", "Saya akan melakukan pembayaran.",
  ].join("\n"));

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true); setError(""); setMessage("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("code", props.code);
      fd.append("phone", props.customerPhone);
      const res = await fetch("/api/payments/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal upload");
      setMessage("Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.");
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally { setUploading(false); }
  }

  const bankMethods = props.methods.filter(m => m.type === "BANK_TRANSFER");

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Kode Booking</span>
          <Badge color={props.paymentStatus === "PAID" ? "green" : props.paymentStatus === "PENDING" ? "yellow" : "gray"}>
            {props.paymentStatus === "PAID" ? "Lunas" : props.paymentStatus === "PENDING" ? "Menunggu Verifikasi" : "Belum Bayar"}
          </Badge>
        </div>
        <div className="font-mono font-bold text-lg text-brand-700">{props.code}</div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">Total Pembayaran</h2>
        <div className="text-3xl font-bold text-brand-700">{formatIDR(props.total)}</div>
      </div>

      <div className="card">
        <div className="flex gap-2 border-b mb-3 overflow-x-auto">
          {(["BANK_TRANSFER","QRIS","WHATSAPP"] as const).map(t => {
            const label = t === "BANK_TRANSFER" ? "Transfer Bank" : t === "QRIS" ? "QRIS" : "WhatsApp";
            return (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                  tab === t ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500"
                }`}>
                {label}
              </button>
            );
          })}
        </div>

        {tab === "BANK_TRANSFER" && (
          <div className="space-y-3">
            {bankMethods.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada rekening. Hubungi admin.</p>
            ) : bankMethods.map(m => (
              <div key={m.id} className="space-y-2">
                {m.bankAccounts.map(b => (
                  <div key={b.id} className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                    <div className="text-xs text-gray-500">{b.bankName}</div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="font-mono font-bold">{b.accountNumber}</div>
                      <button type="button"
                        onClick={() => navigator.clipboard.writeText(b.accountNumber)}
                        className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1">
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">a/n {b.accountName}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === "QRIS" && (
          <div className="text-center space-y-3">
            {props.qrisImage ? (
              <>
                <p className="text-sm text-gray-600">Scan QR untuk melakukan pembayaran.</p>
                <img src={props.qrisImage} alt="QRIS" className="mx-auto max-w-xs rounded-lg border" />
              </>
            ) : (
              <p className="text-sm text-gray-500 py-6">QRIS belum tersedia. Hubungi admin via WhatsApp.</p>
            )}
          </div>
        )}

        {tab === "WHATSAPP" && (
          <div className="text-center space-y-3 py-2">
            <p className="text-sm text-gray-600">Konfirmasi pembayaran langsung ke admin via WhatsApp.</p>
            <a href={`https://wa.me/${props.whatsapp.replace(/\D/g, "")}?text=${waMsg}`}
              target="_blank" rel="noopener noreferrer" className="btn-wa w-full">
              Buka WhatsApp
            </a>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3">Upload Bukti Pembayaran</h2>
        {props.paymentStatus === "PAID" ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" /> Pembayaran sudah diterima.
          </div>
        ) : props.paymentStatus === "REJECTED" ? (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <XCircle className="h-4 w-4" /> Pembayaran ditolak, silakan hubungi admin.
          </div>
        ) : (
          <form onSubmit={upload} className="space-y-3">
            {props.proofUrl && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                Bukti sudah diunggah: <a href={props.proofUrl} target="_blank" rel="noopener noreferrer" className="underline">Lihat</a>
              </div>
            )}
            <input type="file" accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-brand-700" />
            <p className="text-xs text-gray-500">Format: JPG, PNG, PDF. Maks 5MB.</p>
            <Button type="submit" disabled={!file || uploading} className="w-full">
              {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengunggah...</> : <><Upload className="h-4 w-4" /> Upload Bukti</>}
            </Button>
            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
EOF

echo "✅ Halaman customer selesai."

# ============================================================
# [2/5] API ROUTES
# ============================================================
echo "▶ [2/5] Menulis API routes..."

cat > src/app/api/bookings/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { CreateBookingSchema } from "@/lib/validators";
import { createTicketBooking } from "@/services/bookingService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Input tidak valid" }, { status: 400 });
    }
    const booking = await createTicketBooking(parsed.data);
    return NextResponse.json({ code: booking.code, id: booking.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Terjadi kesalahan" }, { status: 400 });
  }
}
EOF

cat > src/app/api/bookings/lookup/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { LookupBookingSchema } from "@/lib/validators";
import { lookupBooking } from "@/services/bookingService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LookupBookingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
    const booking = await lookupBooking(parsed.data.code, parsed.data.phone);
    if (!booking) return NextResponse.json({ error: "Tidak ada booking dengan data tersebut." }, { status: 404 });
    return NextResponse.json({ booking });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
EOF

cat > src/app/api/charters/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { CreateCharterSchema } from "@/lib/validators";
import { createCharterBooking } from "@/services/bookingService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateCharterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Input tidak valid" }, { status: 400 });
    }
    const { booking } = await createCharterBooking(parsed.data);
    return NextResponse.json({ code: booking.code, id: booking.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Terjadi kesalahan" }, { status: 400 });
  }
}
EOF

cat > src/app/api/payments/upload/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { uploadPaymentProof } from "@/services/paymentService";

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const file = fd.get("file") as File | null;
    const code = fd.get("code") as string | null;
    const phone = fd.get("phone") as string | null;
    if (!file || !code || !phone) return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    const result = await uploadPaymentProof(code, phone, file);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Terjadi kesalahan" }, { status: 400 });
  }
}
EOF

cat > src/app/api/auth/login/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { LoginSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });

    const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!admin || !admin.isActive) return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });

    const ok = await verifyPassword(parsed.data.password, admin.passwordHash);
    if (!ok) return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });

    const token = signToken({ sub: admin.id, email: admin.email, role: admin.role, name: admin.name });
    setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
EOF

cat > src/app/api/auth/logout/route.ts << 'EOF'
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
EOF

cat > src/app/api/auth/me/route.ts << 'EOF'
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ admin });
}
EOF

# Admin API
cat > src/app/api/admin/bookings/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const status = url.searchParams.get("status") ?? "";
    const where: any = {};
    if (q) where.OR = [
      { code: { contains: q } },
      { customerName: { contains: q } },
      { customerPhone: { contains: q } },
    ];
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where, orderBy: { createdAt: "desc" }, take: 200,
      include: { route: true, charter: { include: { vehicleType: true } } },
    });
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
EOF

mkdir -p src/app/api/admin/bookings/\[id\]
cat > 'src/app/api/admin/bookings/[id]/route.ts' << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data: any = {};
    if (body.status) data.status = body.status;
    if (body.paymentStatus) data.paymentStatus = body.paymentStatus;

    await prisma.booking.update({ where: { id: params.id }, data });

    if (body.paymentStatus) {
      await prisma.payment.updateMany({
        where: { bookingId: params.id },
        data: { status: body.paymentStatus },
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal update" }, { status: 400 });
  }
}
EOF

cat > src/app/api/admin/settings/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { updateSettings, getSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ settings: await getSettings() });
  } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    await updateSettings(body);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Gagal simpan" }, { status: 400 }); }
}
EOF

echo "✅ API routes selesai."

# ============================================================
# [3/5] ADMIN DASHBOARD
# ============================================================
echo "▶ [3/5] Menulis admin dashboard..."

# Admin layout (auth guard)
cat > src/app/admin/layout.tsx << 'EOF'
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Calendar, Map, Settings, LogOut, CreditCard } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  // Biarkan /admin/login lewat tanpa auth
  // Deteksi sederhana: layout ini akan tetap render; login page tidak butuh admin
  // Jadi kita cek di page/page yg memerlukan.
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {admin && (
        <aside className="md:w-60 md:min-h-screen bg-white border-b md:border-b-0 md:border-r border-gray-200">
          <div className="p-4 border-b">
            <div className="font-bold text-brand-700">Admin Panel</div>
            <div className="text-xs text-gray-500 mt-1">{admin.name}</div>
          </div>
          <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-2 gap-1">
            {[
              { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
              { href: "/admin/bookings", label: "Booking", icon: Calendar },
              { href: "/admin/payments", label: "Pembayaran", icon: CreditCard },
              { href: "/admin/settings", label: "Pengaturan", icon: Settings },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap">
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ))}
            <form action="/api/auth/logout" method="post" className="md:mt-auto">
              <button type="submit" className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </form>
          </nav>
        </aside>
      )}
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
EOF

cat > src/app/admin/login/page.tsx << 'EOF'
import { LoginForm } from "./LoginForm";
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Admin Login</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Masuk untuk mengelola booking</p>
        <LoginForm />
      </div>
    </div>
  );
}
EOF

cat > src/app/admin/login/LoginForm.tsx << 'EOF'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal login");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
      <Input label="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Masuk...</> : "Masuk"}
      </Button>
    </form>
  );
}
EOF

cat > src/app/admin/page.tsx << 'EOF'
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const [total, todayCount, pending, paidCount, completed, revenueAgg] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.booking.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.booking.count({ where: { paymentStatus: "PAID" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.aggregate({ where: { paymentStatus: "PAID" }, _sum: { totalPrice: true } }),
  ]);

  const recent = await prisma.booking.findMany({
    take: 10, orderBy: { createdAt: "desc" },
    include: { route: true, charter: { include: { vehicleType: true } } },
  });

  const stats = [
    { label: "Total Booking", value: total },
    { label: "Booking Hari Ini", value: todayCount },
    { label: "Menunggu Pembayaran", value: pending },
    { label: "Sudah Dibayar", value: paidCount },
    { label: "Selesai", value: completed },
    { label: "Pendapatan", value: formatIDR(revenueAgg._sum.totalPrice ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => (
          <div key={s.label} className="card">
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className="text-2xl font-bold text-brand-700 mt-1">{s.value}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Booking Terbaru</h2>
          <Link href="/admin/bookings" className="text-sm text-brand-600 hover:underline">Lihat semua</Link>
        </div>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-3 py-2">Kode</th><th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Rute</th><th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(b => (
                <tr key={b.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{b.code}</td>
                  <td className="px-3 py-2">{b.customerName}</td>
                  <td className="px-3 py-2 text-xs">
                    {b.charter ? `${b.charter.vehicleType.name} ${b.charter.origin}→${b.charter.destination}`
                      : `${b.route?.origin} → ${b.route?.destination}`}
                  </td>
                  <td className="px-3 py-2 text-xs">{b.status}</td>
                  <td className="px-3 py-2 text-right">{formatIDR(b.totalPrice)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-400">Belum ada booking</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
EOF

# Admin Bookings page
cat > src/app/admin/bookings/page.tsx << 'EOF'
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateID, formatIDR } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const where: any = {};
  if (searchParams.q) where.OR = [
    { code: { contains: searchParams.q } },
    { customerName: { contains: searchParams.q } },
    { customerPhone: { contains: searchParams.q } },
  ];
  if (searchParams.status) where.status = searchParams.status;

  const bookings = await prisma.booking.findMany({
    where, orderBy: { createdAt: "desc" }, take: 200,
    include: { route: true, charter: { include: { vehicleType: true } }, payment: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Booking</h1>
      <form className="card flex flex-wrap gap-2 items-end">
        <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Cari kode/nama/phone"
          className="input flex-1 min-w-[180px]" />
        <select name="status" defaultValue={searchParams.status ?? ""} className="input">
          <option value="">Semua Status</option>
          {["PENDING_PAYMENT","WAITING_VERIFY","PAID","CONFIRMED","COMPLETED","CANCELLED"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn-primary">Cari</button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-3 py-2">Kode</th><th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Rute</th><th className="px-3 py-2">Tanggal</th>
              <th className="px-3 py-2">Total</th><th className="px-3 py-2">Status Bayar</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs">
                  <Link href={`/admin/bookings/${b.id}`} className="text-brand-600 hover:underline">{b.code}</Link>
                </td>
                <td className="px-3 py-2">{b.customerName}<br /><span className="text-xs text-gray-500">{b.customerPhone}</span></td>
                <td className="px-3 py-2 text-xs">
                  {b.charter ? `${b.charter.vehicleType.name} ${b.charter.origin}→${b.charter.destination}`
                    : `${b.route?.origin} → ${b.route?.destination}`}
                </td>
                <td className="px-3 py-2 text-xs">{formatDateID(b.departureDate)}</td>
                <td className="px-3 py-2">{formatIDR(b.totalPrice)}</td>
                <td className="px-3 py-2 text-xs">{b.paymentStatus}</td>
                <td className="px-3 py-2 text-xs">{b.status}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
EOF

# Admin booking detail
mkdir -p src/app/admin/bookings/\[id\]
cat > 'src/app/admin/bookings/[id]/page.tsx' << 'EOF'
import { redirect, notFound } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateID, formatIDR } from "@/lib/utils";
import { BookingActions } from "./BookingActions";

export const dynamic = "force-dynamic";

export default async function AdminBookingDetail({ params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const b = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      route: true, schedule: true, passengers: true, payment: true,
      charter: { include: { vehicleType: true } },
    },
  });
  if (!b) notFound();

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Detail Booking</h1>
      <div className="card">
        <div className="font-mono font-bold text-lg text-brand-700">{b.code}</div>
        <dl className="grid gap-2 sm:grid-cols-2 mt-3 text-sm">
          <div><dt className="text-gray-500">Nama</dt><dd className="font-medium">{b.customerName}</dd></div>
          <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{b.customerPhone}</dd></div>
          <div><dt className="text-gray-500">Tanggal</dt><dd className="font-medium">{formatDateID(b.departureDate)}</dd></div>
          <div><dt className="text-gray-500">Jumlah</dt><dd className="font-medium">{b.passengerCount} orang</dd></div>
          <div><dt className="text-gray-500">Total</dt><dd className="font-bold text-brand-700">{formatIDR(b.totalPrice)}</dd></div>
          <div><dt className="text-gray-500">Status Bayar</dt><dd className="font-medium">{b.paymentStatus}</dd></div>
          <div><dt className="text-gray-500">Status Booking</dt><dd className="font-medium">{b.status}</dd></div>
        </dl>
        {b.pickupAddress && <p className="text-sm mt-2"><span className="text-gray-500">Jemput:</span> {b.pickupAddress}</p>}
        {b.note && <p className="text-sm mt-1"><span className="text-gray-500">Catatan:</span> {b.note}</p>}
        {b.payment?.proofUrl && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1">Bukti Pembayaran</div>
            {b.payment.proofUrl.endsWith(".pdf")
              ? <a href={b.payment.proofUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline text-sm">Buka PDF</a>
              : <a href={b.payment.proofUrl} target="_blank" rel="noopener noreferrer"><img src={b.payment.proofUrl} alt="Bukti" className="max-w-xs rounded border" /></a>}
          </div>
        )}
      </div>

      {b.passengers.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-2">Penumpang</h2>
          <ul className="text-sm space-y-1">
            {b.passengers.map(p => <li key={p.id}>{p.name}{p.idNumber ? ` — ${p.idNumber}` : ""}</li>)}
          </ul>
        </div>
      )}

      <BookingActions id={b.id} status={b.status} paymentStatus={b.paymentStatus} />
    </div>
  );
}
EOF

cat > 'src/app/admin/bookings/[id]/BookingActions.tsx' << 'EOF'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";

export function BookingActions({ id, status, paymentStatus }: { id: string; status: string; paymentStatus: string }) {
  const router = useRouter();
  const [s, setS] = useState(status);
  const [ps, setPs] = useState(paymentStatus);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setLoading(true); setMsg("");
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s, paymentStatus: ps }),
      });
      if (!res.ok) throw new Error("Gagal");
      setMsg("Tersimpan ✓");
      router.refresh();
    } catch { setMsg("Gagal simpan"); }
    finally { setLoading(false); }
  }

  return (
    <div className="card space-y-3">
      <h2 className="font-semibold">Ubah Status</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label="Status Booking" value={s} onChange={e => setS(e.target.value)}>
          {["PENDING_PAYMENT","WAITING_VERIFY","PAID","CONFIRMED","COMPLETED","CANCELLED"].map(x => <option key={x} value={x}>{x}</option>)}
        </Select>
        <Select label="Status Pembayaran" value={ps} onChange={e => setPs(e.target.value)}>
          {["UNPAID","PENDING","PAID","REJECTED","REFUNDED"].map(x => <option key={x} value={x}>{x}</option>)}
        </Select>
      </div>
      <Button onClick={save} disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
EOF

# Admin Payments page
cat > src/app/admin/payments/page.tsx << 'EOF'
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateID, formatIDR } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" }, take: 200,
    include: { booking: { include: { route: true, charter: { include: { vehicleType: true } } } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pembayaran</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-3 py-2">Kode</th><th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Status</th><th className="px-3 py-2">Bukti</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2 font-mono text-xs">
                  <Link href={`/admin/bookings/${p.booking.id}`} className="text-brand-600 hover:underline">{p.booking.code}</Link>
                </td>
                <td className="px-3 py-2">{p.booking.customerName}</td>
                <td className="px-3 py-2 text-xs">{formatDateID(p.createdAt)}</td>
                <td className="px-3 py-2">{formatIDR(p.amount)}</td>
                <td className="px-3 py-2 text-xs">{p.status}</td>
                <td className="px-3 py-2 text-xs">
                  {p.proofUrl ? <a href={p.proofUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">Lihat</a> : "—"}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-400">Belum ada pembayaran</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
EOF

# Admin Settings
cat > src/app/admin/settings/page.tsx << 'EOF'
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  const settings = await getSettings();
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Pengaturan</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
EOF

cat > src/app/admin/settings/SettingsForm.tsx << 'EOF'
"use client";
import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) { setForm({ ...form, [k]: v }); }

  async function save() {
    setLoading(true); setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gagal");
      setMsg("Tersimpan ✓");
    } catch { setMsg("Gagal simpan"); }
    finally { setLoading(false); }
  }

  const fields: { key: string; label: string; type?: "text" | "textarea" }[] = [
    { key: "travel_name", label: "Nama Travel" },
    { key: "travel_tagline", label: "Tagline" },
    { key: "whatsapp_number", label: "Nomor WhatsApp Admin" },
    { key: "contact_address", label: "Alamat" },
    { key: "contact_email", label: "Email" },
    { key: "qris_image_url", label: "URL Gambar QRIS" },
    { key: "footer_text", label: "Footer Text", type: "textarea" },
  ];

  return (
    <div className="card space-y-3">
      {fields.map(f => (
        f.type === "textarea"
          ? <Textarea key={f.key} label={f.label} value={form[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} rows={2} />
          : <Input key={f.key} label={f.label} value={form[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} />
      ))}
      <Button onClick={save} disabled={loading}>{loading ? "Menyimpan..." : "Simpan Pengaturan"}</Button>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
EOF

echo "✅ Admin dashboard selesai."

# ============================================================
# [4/5] SEED + README + ROBOTS + SITEMAP
# ============================================================
echo "▶ [4/5] Menulis seed & README..."

cat > prisma/seed.ts << 'EOF'
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  const email = process.env.ADMIN_EMAIL ?? "admin@travel.local";
  const password = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const hash = await bcrypt.hash(password, 10);
  await prisma.admin.upsert({
    where: { email },
    create: { email, name: "Super Admin", passwordHash: hash, role: "superadmin" },
    update: { passwordHash: hash },
  });
  console.log(`✅ Admin: ${email} / ${password}`);

  const cityNames = [
    { name: "Tegal", region: "Tegal" },
    { name: "Jakarta", region: "Jabodetabek" },
    { name: "Bogor", region: "Jabodetabek" },
    { name: "Depok", region: "Jabodetabek" },
    { name: "Tangerang", region: "Jabodetabek" },
    { name: "Bekasi", region: "Jabodetabek" },
  ];
  for (const c of cityNames) {
    await prisma.city.upsert({ where: { name: c.name }, create: c, update: {} });
  }

  const routeDefs = [
    { origin: "Tegal", destination: "Jakarta", price: 150000 },
    { origin: "Jakarta", destination: "Tegal", price: 150000 },
    { origin: "Tegal", destination: "Bogor", price: 175000 },
    { origin: "Bogor", destination: "Tegal", price: 175000 },
    { origin: "Tegal", destination: "Depok", price: 165000 },
    { origin: "Depok", destination: "Tegal", price: 165000 },
    { origin: "Tegal", destination: "Tangerang", price: 160000 },
    { origin: "Tangerang", destination: "Tegal", price: 160000 },
    { origin: "Tegal", destination: "Bekasi", price: 165000 },
    { origin: "Bekasi", destination: "Tegal", price: 165000 },
  ];
  for (const r of routeDefs) {
    await prisma.route.upsert({
      where: { origin_destination: { origin: r.origin, destination: r.destination } },
      create: { ...r, basePrice: r.price, durationMin: 300, isActive: true } as any,
      update: { basePrice: r.price, isActive: true },
    });
  }

  const vtDefs = [
    { name: "MPV", capacity: 5, description: "Avanza / Innova" },
    { name: "Minibus", capacity: 12, description: "Hiace / Elf kecil" },
    { name: "Elf", capacity: 16, description: "Elf long" },
    { name: "Hiace", capacity: 14, description: "Hiace Commuter" },
  ];
  const vts: Record<string, { id: string }> = {};
  for (const vt of vtDefs) {
    const row = await prisma.vehicleType.upsert({
      where: { name: vt.name },
      create: vt,
      update: { capacity: vt.capacity, description: vt.description },
    });
    vts[vt.name] = row;
  }

  const vehDefs = [
    { name: "Hiace 01", plateNumber: "G 1234 AB", typeName: "Hiace", capacity: 14 },
    { name: "Hiace 02", plateNumber: "G 1235 AB", typeName: "Hiace", capacity: 14 },
    { name: "Avanza 01", plateNumber: "G 5678 CD", typeName: "MPV", capacity: 5 },
  ];
  const vehicles: Record<string, { id: string }> = {};
  for (const v of vehDefs) {
    const row = await prisma.vehicle.upsert({
      where: { plateNumber: v.plateNumber },
      create: { name: v.name, plateNumber: v.plateNumber, vehicleTypeId: vts[v.typeName].id, capacity: v.capacity },
      update: {},
    });
    vehicles[v.name] = row;
  }

  const routes = await prisma.route.findMany();
  const times = ["05:00", "07:00", "09:00", "13:00", "17:00", "20:00"];
  for (const route of routes) {
    for (const time of times) {
      const exists = await prisma.schedule.findFirst({ where: { routeId: route.id, departureTime: time } });
      if (!exists) {
        await prisma.schedule.create({
          data: { routeId: route.id, vehicleId: vehicles["Hiace 01"].id, departureTime: time, capacity: 10, isActive: true },
        });
      }
    }
  }

  const bankMethod = await prisma.paymentMethod.upsert({
    where: { id: "pm-bank" },
    create: { id: "pm-bank", type: "BANK_TRANSFER", name: "Transfer Bank", order: 1 },
    update: {},
  });
  await prisma.bankAccount.upsert({
    where: { id: "ba-bca" },
    create: { id: "ba-bca", paymentMethodId: bankMethod.id, bankName: "BCA", accountNumber: "1234567890", accountName: "PT Tegal Travel" },
    update: {},
  });
  await prisma.paymentMethod.upsert({ where: { id: "pm-qris" }, create: { id: "pm-qris", type: "QRIS", name: "QRIS", order: 2 }, update: {} });
  await prisma.paymentMethod.upsert({ where: { id: "pm-wa" }, create: { id: "pm-wa", type: "WHATSAPP", name: "Konfirmasi WhatsApp", order: 3 }, update: {} });

  const charterPrices = [
    { typeName: "MPV", origin: "Tegal", destination: "Jakarta", price: 750000 },
    { typeName: "Minibus", origin: "Tegal", destination: "Jakarta", price: 1200000 },
    { typeName: "Elf", origin: "Tegal", destination: "Jakarta", price: 1500000 },
    { typeName: "Hiace", origin: "Tegal", destination: "Jakarta", price: 1400000 },
  ];
  for (const cp of charterPrices) {
    await prisma.charterPrice.upsert({
      where: { vehicleTypeId_origin_destination: { vehicleTypeId: vts[cp.typeName].id, origin: cp.origin, destination: cp.destination } },
      create: { vehicleTypeId: vts[cp.typeName].id, origin: cp.origin, destination: cp.destination, price: cp.price, pricePerDay: cp.price },
      update: { price: cp.price, pricePerDay: cp.price },
    });
  }

  const settings = [
    { key: "travel_name", value: process.env.NEXT_PUBLIC_TRAVEL_NAME ?? "Tegal Travel" },
    { key: "travel_tagline", value: "Perjalanan nyaman, aman, dan mudah dipesan." },
    { key: "whatsapp_number", value: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281234567890" },
    { key: "contact_address", value: "Jl. Ahmad Yani No. 1, Tegal" },
    { key: "contact_email", value: "info@tegaltravel.id" },
    { key: "footer_text", value: "© 2026 Tegal Travel. All rights reserved." },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, create: s, update: {} });
  }

  console.log("✅ Seed selesai.");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
EOF

cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Sitemap: /sitemap.xml
EOF

cat > src/app/sitemap.ts << 'EOF'
import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const now = new Date();
  return [
    { url: base, lastModified: now, priority: 1 },
    { url: `${base}/search`, lastModified: now, priority: 0.9 },
    { url: `${base}/carter`, lastModified: now, priority: 0.9 },
    { url: `${base}/cek-booking`, lastModified: now, priority: 0.8 },
  ];
}
EOF

cat > README.md << 'EOF'
# Travel Tegal ↔ Jabodetabek

Website travel online untuk layanan Tegal ↔ Jabodetabek.

## Fitur
- Booking tiket online
- Carter mobil
- Cek booking
- Upload bukti pembayaran
- Konfirmasi WhatsApp otomatis
- Admin dashboard
- Manajemen booking, pembayaran, pengaturan

## Tech Stack
- Next.js 14 + TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite (default)
- JWT auth (httpOnly cookie)

## Cara Menjalankan

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
