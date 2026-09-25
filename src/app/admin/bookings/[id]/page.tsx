import { redirect, notFound } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateID, formatIDR } from "@/lib/utils";
import { BookingActions } from "./BookingActions";

export const dynamic = "force-dynamic";

export default async function AdminBookingDetail({ params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const b = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      route: true, schedule: true, passengers: true, payment: true,
      charter: { include: { vehicleType: true } },
    },
  });
  if (!b) notFound();

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Detail Booking</h1>
      <div className="card">
        <div className="font-mono font-bold text-lg text-brand-700">{b.code}</div>
        <dl className="grid gap-2 sm:grid-cols-2 mt-3 text-sm">
          <div><dt className="text-gray-500">Nama</dt><dd className="font-medium">{b.customerName}</dd></div>
          <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{b.customerPhone}</dd></div>
          <div><dt className="text-gray-500">Tanggal</dt><dd className="font-medium">{formatDateID(b.departureDate)}</dd></div>
          <div><dt className="text-gray-500">Jumlah</dt><dd className="font-medium">{b.passengerCount} orang</dd></div>
          <div><dt className="text-gray-500">Total</dt><dd className="font-bold text-brand-700">{formatIDR(b.totalPrice)}</dd></div>
          <div><dt className="text-gray-500">Status Bayar</dt><dd className="font-medium">{b.paymentStatus}</dd></div>
          <div><dt className="text-gray-500">Status Booking</dt><dd className="font-medium">{b.status}</dd></div>
        </dl>
        {b.pickupAddress && <p className="text-sm mt-2"><span className="text-gray-500">Jemput:</span> {b.pickupAddress}</p>}
        {b.note && <p className="text-sm mt-1"><span className="text-gray-500">Catatan:</span> {b.note}</p>}
        {b.payment?.proofUrl && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1">Bukti Pembayaran</div>
            {b.payment.proofUrl.endsWith(".pdf")
              ? <a href={b.payment.proofUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline text-sm">Buka PDF</a>
              : <a href={b.payment.proofUrl} target="_blank" rel="noopener noreferrer"><img src={b.payment.proofUrl} alt="Bukti" className="max-w-xs rounded border" /></a>}
          </div>
        )}
      </div>

      {b.passengers.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-2">Penumpang</h2>
          <ul className="text-sm space-y-1">
            {b.passengers.map(p => <li key={p.id}>{p.name}{p.idNumber ? ` — ${p.idNumber}` : ""}</li>)}
          </ul>
        </div>
      )}

      <BookingActions id={b.id} status={b.status} paymentStatus={b.paymentStatus} />
    </div>
  );
}
