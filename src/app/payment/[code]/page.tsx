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
