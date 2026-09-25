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
