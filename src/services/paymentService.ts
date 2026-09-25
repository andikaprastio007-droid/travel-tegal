import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { normalizePhone } from "@/lib/utils";

const ALLOWED = ["image/jpeg","image/jpg","image/png","application/pdf"];
const MAX = 5 * 1024 * 1024;
const DIR = path.join(process.cwd(), "public", "uploads", "payments");

export async function uploadPaymentProof(bookingCode: string, phone: string, file: File) {
  const normalized = normalizePhone(phone);
  const booking = await prisma.booking.findFirst({
    where: { code: bookingCode.trim().toUpperCase(), customerPhone: normalized },
    include: { payment: true },
  });
  if (!booking) throw new Error("Booking tidak ditemukan");
  if (!booking.payment) throw new Error("Data pembayaran tidak ditemukan");
  if (booking.paymentStatus === "PAID") throw new Error("Pembayaran sudah diterima");
  if (file.size > MAX) throw new Error("Ukuran file maksimal 5MB");
  if (!ALLOWED.includes(file.type)) throw new Error("Hanya JPG, PNG, atau PDF");

  await mkdir(DIR, { recursive: true });
  const ext = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
  const filename = `${booking.code}-${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(DIR, filename), buffer);

  const url = `/uploads/payments/${filename}`;
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: booking.payment.id },
      data: { proofUrl: url, status: "PENDING" },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: "WAITING_VERIFY", paymentStatus: "PENDING" },
    }),
  ]);
  return { url };
}
