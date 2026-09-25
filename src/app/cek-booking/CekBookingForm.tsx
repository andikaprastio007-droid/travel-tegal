"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Search } from "lucide-react";
import { formatDateID, formatIDR } from "@/lib/utils";

type Booking = {
  code: string; customerName: string; passengerCount: number; totalPrice: number;
  departureDate: string; status: string; paymentStatus: string;
  route: { origin: string; destination: string } | null;
  schedule: { departureTime: string } | null;
  charter: { vehicleType: { name: string }; origin: string; destination: string } | null;
};

const statusMap: Record<string, { label: string; color: "yellow" | "blue" | "green" | "red" | "gray" }> = {
  PENDING_PAYMENT: { label: "Menunggu Pembayaran", color: "yellow" },
  WAITING_VERIFY: { label: "Menunggu Verifikasi", color: "blue" },
  PAID: { label: "Dibayar", color: "blue" },
  CONFIRMED: { label: "Dikonfirmasi", color: "green" },
  COMPLETED: { label: "Selesai", color: "green" },
  CANCELLED: { label: "Dibatalkan", color: "red" },
};
const payMap: Record<string, { label: string; color: "yellow" | "blue" | "green" | "red" | "gray" }> = {
  UNPAID: { label: "Belum Bayar", color: "gray" },
  PENDING: { label: "Menunggu Verifikasi", color: "yellow" },
  PAID: { label: "Lunas", color: "green" },
  REJECTED: { label: "Ditolak", color: "red" },
  REFUNDED: { label: "Refund", color: "gray" },
};

export function CekBookingForm() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBooking(null); setLoading(true);
    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Tidak ditemukan");
      setBooking(data.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="card space-y-3">
        <Input label="Kode Booking" placeholder="TRV-XXXXXXXX-XXXX" required value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
        <Input label="Nomor WhatsApp" placeholder="08xxxxxxxxxx" required value={phone} onChange={e => setPhone(e.target.value)} />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Mencari...</> : <><Search className="h-4 w-4" /> Cek Booking</>}
        </Button>
      </form>

      {error && <div className="card text-center text-red-600 py-6 text-sm">{error}</div>}

      {booking && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono font-bold text-brand-700">{booking.code}</div>
            <Badge color={statusMap[booking.status]?.color ?? "gray"}>{statusMap[booking.status]?.label ?? booking.status}</Badge>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-600">Nama</dt><dd className="font-medium">{booking.customerName}</dd></div>
            {booking.charter ? (
              <div className="flex justify-between"><dt className="text-gray-600">Carter</dt><dd className="font-medium">{booking.charter.vehicleType.name} · {booking.charter.origin} → {booking.charter.destination}</dd></div>
            ) : (
              <>
                <div className="flex justify-between"><dt className="text-gray-600">Rute</dt><dd className="font-medium">{booking.route?.origin} → {booking.route?.destination}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-600">Jam</dt><dd className="font-medium">{booking.schedule?.departureTime} WIB</dd></div>
              </>
            )}
            <div className="flex justify-between"><dt className="text-gray-600">Tanggal</dt><dd className="font-medium">{formatDateID(booking.departureDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-600">Jumlah</dt><dd className="font-medium">{booking.passengerCount} orang</dd></div>
            <div className="flex justify-between"><dt className="text-gray-600">Total</dt><dd className="font-bold text-brand-700">{formatIDR(booking.totalPrice)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-600">Pembayaran</dt><dd><Badge color={payMap[booking.paymentStatus]?.color ?? "gray"}>{payMap[booking.paymentStatus]?.label ?? booking.paymentStatus}</Badge></dd></div>
          </dl>
        </div>
      )}
    </div>
  );
}
