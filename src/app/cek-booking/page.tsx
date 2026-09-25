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
