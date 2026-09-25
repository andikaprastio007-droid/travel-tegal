import { prisma } from "@/lib/db";
import { calculateTicketPrice, calculateCharterPrice } from "./pricingService";
import type { CreateBookingInput, CreateCharterInput } from "@/lib/validators";
import { isPastDate, normalizePhone } from "@/lib/utils";

async function generateBookingCode(): Promise<string> {
  const n = new Date();
  const ymd = n.getFullYear().toString() +
    String(n.getMonth()+1).padStart(2,"0") +
    String(n.getDate()).padStart(2,"0");
  for (let i = 0; i < 10; i++) {
    const r = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    const code = `TRV-${ymd}-${r}`;
    const exists = await prisma.booking.findUnique({ where: { code } });
    if (!exists) return code;
  }
  throw new Error("Gagal membuat kode booking");
}

export async function createTicketBooking(input: CreateBookingInput) {
  if (isPastDate(input.departureDate)) throw new Error("Tanggal tidak boleh di masa lalu");
  if (input.passengers.length === 0) throw new Error("Data penumpang kosong");

  const { schedule, route, unitPrice, totalPrice } = await calculateTicketPrice(
    input.scheduleId, input.passengers.length
  );
  const phone = normalizePhone(input.customerPhone);
  const code = await generateBookingCode();
  const departureDate = new Date(input.departureDate + "T00:00:00");

  // cek kursi tersisa
  const used = await prisma.booking.aggregate({
    where: { scheduleId: schedule.id, departureDate, status: { not: "CANCELLED" } },
    _sum: { passengerCount: true },
  });
  const usedCount = used._sum.passengerCount ?? 0;
  if (usedCount + input.passengers.length > schedule.capacity)
    throw new Error("Kursi tidak mencukupi untuk jadwal ini");

  return prisma.$transaction(async (tx) => {
    return tx.booking.create({
      data: {
        code, type: "TICKET",
        customerName: input.customerName.trim(),
        customerPhone: phone,
        pickupAddress: input.pickupAddress || null,
        note: input.note || null,
        routeId: route.id, scheduleId: schedule.id, departureDate,
        passengerCount: input.passengers.length,
        unitPrice, totalPrice,
        status: "PENDING_PAYMENT", paymentStatus: "UNPAID",
        passengers: { create: input.passengers.map(p => ({
          name: p.name.trim(), idNumber: p.idNumber || null,
        })) },
        payment: { create: { amount: totalPrice, status: "UNPAID" } },
      },
      include: { route: true, schedule: true, passengers: true, payment: true },
    });
  });
}

export async function createCharterBooking(input: CreateCharterInput) {
  if (isPastDate(input.departureDate)) throw new Error("Tanggal tidak boleh di masa lalu");
  const vt = await prisma.vehicleType.findUnique({ where: { id: input.vehicleTypeId } });
  if (!vt || !vt.isActive) throw new Error("Kendaraan tidak tersedia");
  if (input.passengerCount > vt.capacity) throw new Error(`Kapasitas maksimal ${vt.capacity} orang`);

  const priceQuoted = await calculateCharterPrice(vt.id, input.origin, input.destination, input.durationDays);
  const phone = normalizePhone(input.customerPhone);
  const code = await generateBookingCode();
  const departureDate = new Date(input.departureDate + "T00:00:00");
  const totalPrice = priceQuoted ?? 0;

  const booking = await prisma.$transaction(async (tx) =>
    tx.booking.create({
      data: {
        code, type: "CHARTER",
        customerName: input.customerName.trim(),
        customerPhone: phone,
        note: input.note || null,
        departureDate,
        passengerCount: input.passengerCount,
        unitPrice: totalPrice, totalPrice,
        status: "PENDING_PAYMENT", paymentStatus: "UNPAID",
        payment: { create: { amount: totalPrice, status: "UNPAID" } },
        charter: {
          create: {
            vehicleTypeId: vt.id, origin: input.origin, destination: input.destination,
            pickupAddress: input.pickupAddress, dropAddress: input.dropAddress,
            departureDate, departureTime: input.departureTime,
            durationDays: input.durationDays, priceQuoted,
          },
        },
      },
      include: { charter: true, payment: true },
    })
  );
  return { booking, priceQuoted };
}

export async function lookupBooking(code: string, phone: string) {
  const normalized = normalizePhone(phone);
  return prisma.booking.findFirst({
    where: { code: code.trim().toUpperCase(), customerPhone: normalized },
    include: {
      route: true, schedule: true, passengers: true, payment: true,
      charter: { include: { vehicleType: true } },
    },
  });
}
