import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateID, formatIDR } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" }, take: 200,
    include: { booking: { include: { route: true, charter: { include: { vehicleType: true } } } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pembayaran</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-3 py-2">Kode</th><th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Status</th><th className="px-3 py-2">Bukti</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2 font-mono text-xs">
                  <Link href={`/admin/bookings/${p.booking.id}`} className="text-brand-600 hover:underline">{p.booking.code}</Link>
                </td>
                <td className="px-3 py-2">{p.booking.customerName}</td>
                <td className="px-3 py-2 text-xs">{formatDateID(p.createdAt)}</td>
                <td className="px-3 py-2">{formatIDR(p.amount)}</td>
                <td className="px-3 py-2 text-xs">{p.status}</td>
                <td className="px-3 py-2 text-xs">
                  {p.proofUrl ? <a href={p.proofUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">Lihat</a> : "—"}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-400">Belum ada pembayaran</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
