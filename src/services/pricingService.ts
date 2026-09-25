import { prisma } from "@/lib/db";

export async function calculateTicketPrice(scheduleId: string, passengerCount: number) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId }, include: { route: true },
  });
  if (!schedule || !schedule.isActive) throw new Error("Jadwal tidak tersedia");
  if (passengerCount < 1) throw new Error("Jumlah penumpang tidak valid");
  if (passengerCount > schedule.capacity) throw new Error("Jumlah penumpang melebihi kapasitas");
  const unitPrice = schedule.priceOverride ?? schedule.route.basePrice;
  return { schedule, route: schedule.route, unitPrice, totalPrice: unitPrice * passengerCount };
}

export async function calculateCharterPrice(
  vehicleTypeId: string, origin: string, destination: string, durationDays: number
): Promise<number | null> {
  const price = await prisma.charterPrice.findUnique({
    where: { vehicleTypeId_origin_destination: { vehicleTypeId, origin, destination } },
  });
  if (!price || !price.isActive) return null;
  const perDay = price.pricePerDay ?? price.price;
  return perDay * Math.max(1, durationDays);
}
