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
