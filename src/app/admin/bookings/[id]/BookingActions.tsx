"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";

export function BookingActions({ id, status, paymentStatus }: { id: string; status: string; paymentStatus: string }) {
  const router = useRouter();
  const [s, setS] = useState(status);
  const [ps, setPs] = useState(paymentStatus);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setLoading(true); setMsg("");
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s, paymentStatus: ps }),
      });
      if (!res.ok) throw new Error("Gagal");
      setMsg("Tersimpan ✓");
      router.refresh();
    } catch { setMsg("Gagal simpan"); }
    finally { setLoading(false); }
  }

  return (
    <div className="card space-y-3">
      <h2 className="font-semibold">Ubah Status</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label="Status Booking" value={s} onChange={e => setS(e.target.value)}>
          {["PENDING_PAYMENT","WAITING_VERIFY","PAID","CONFIRMED","COMPLETED","CANCELLED"].map(x => <option key={x} value={x}>{x}</option>)}
        </Select>
        <Select label="Status Pembayaran" value={ps} onChange={e => setPs(e.target.value)}>
          {["UNPAID","PENDING","PAID","REJECTED","REFUNDED"].map(x => <option key={x} value={x}>{x}</option>)}
        </Select>
      </div>
      <Button onClick={save} disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
