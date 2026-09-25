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
