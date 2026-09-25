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
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight">Restu Trans</h1>
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
