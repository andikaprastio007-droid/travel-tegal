import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const [total, todayCount, pending, paidCount, completed, revenueAgg] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.booking.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.booking.count({ where: { paymentStatus: "PAID" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.aggregate({ where: { paymentStatus: "PAID" }, _sum: { totalPrice: true } }),
  ]);

  const recent = await prisma.booking.findMany({
    take: 10, orderBy: { createdAt: "desc" },
    include: { route: true, charter: { include: { vehicleType: true } } },
  });

  const stats = [
    { label: "Total Booking", value: total },
    { label: "Booking Hari Ini", value: todayCount },
    { label: "Menunggu Pembayaran", value: pending },
    { label: "Sudah Dibayar", value: paidCount },
    { label: "Selesai", value: completed },
    { label: "Pendapatan", value: formatIDR(revenueAgg._sum.totalPrice ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => (
          <div key={s.label} className="card">
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className="text-2xl font-bold text-brand-700 mt-1">{s.value}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Booking Terbaru</h2>
          <Link href="/admin/bookings" className="text-sm text-brand-600 hover:underline">Lihat semua</Link>
        </div>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-3 py-2">Kode</th><th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Rute</th><th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(b => (
                <tr key={b.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{b.code}</td>
                  <td className="px-3 py-2">{b.customerName}</td>
                  <td className="px-3 py-2 text-xs">
                    {b.charter ? `${b.charter.vehicleType.name} ${b.charter.origin}→${b.charter.destination}`
                      : `${b.route?.origin} → ${b.route?.destination}`}
                  </td>
                  <td className="px-3 py-2 text-xs">{b.status}</td>
                  <td className="px-3 py-2 text-right">{formatIDR(b.totalPrice)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-400">Belum ada booking</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
