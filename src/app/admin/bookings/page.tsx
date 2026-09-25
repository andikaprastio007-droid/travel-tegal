import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateID, formatIDR } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const where: any = {};
  if (searchParams.q) where.OR = [
    { code: { contains: searchParams.q } },
    { customerName: { contains: searchParams.q } },
    { customerPhone: { contains: searchParams.q } },
  ];
  if (searchParams.status) where.status = searchParams.status;

  const bookings = await prisma.booking.findMany({
    where, orderBy: { createdAt: "desc" }, take: 200,
    include: { route: true, charter: { include: { vehicleType: true } }, payment: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Booking</h1>
      <form className="card flex flex-wrap gap-2 items-end">
        <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Cari kode/nama/phone"
          className="input flex-1 min-w-[180px]" />
        <select name="status" defaultValue={searchParams.status ?? ""} className="input">
          <option value="">Semua Status</option>
          {["PENDING_PAYMENT","WAITING_VERIFY","PAID","CONFIRMED","COMPLETED","CANCELLED"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn-primary">Cari</button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-3 py-2">Kode</th><th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Rute</th><th className="px-3 py-2">Tanggal</th>
              <th className="px-3 py-2">Total</th><th className="px-3 py-2">Status Bayar</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs">
                  <Link href={`/admin/bookings/${b.id}`} className="text-brand-600 hover:underline">{b.code}</Link>
                </td>
                <td className="px-3 py-2">{b.customerName}<br /><span className="text-xs text-gray-500">{b.customerPhone}</span></td>
                <td className="px-3 py-2 text-xs">
                  {b.charter ? `${b.charter.vehicleType.name} ${b.charter.origin}→${b.charter.destination}`
                    : `${b.route?.origin} → ${b.route?.destination}`}
                </td>
                <td className="px-3 py-2 text-xs">{formatDateID(b.departureDate)}</td>
                <td className="px-3 py-2">{formatIDR(b.totalPrice)}</td>
                <td className="px-3 py-2 text-xs">{b.paymentStatus}</td>
                <td className="px-3 py-2 text-xs">{b.status}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
