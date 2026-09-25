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
