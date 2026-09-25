"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Loader2 } from "lucide-react";

type Passenger = { name: string; idNumber: string };

export function BookingForm({
  scheduleId, departureDate, initialPassengers, price,
}: { scheduleId: string; departureDate: string; initialPassengers: number; price: number }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [note, setNote] = useState("");
  const [passengers, setPassengers] = useState<Passenger[]>(
    Array.from({ length: Math.max(1, initialPassengers) }, () => ({ name: "", idNumber: "" }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = price * passengers.length;

  function updatePassenger(i: number, key: keyof Passenger, val: string) {
    const next = [...passengers];
    next[i][key] = val;
    setPassengers(next);
  }
  function addPassenger() { setPassengers([...passengers, { name: "", idNumber: "" }]); }
  function removePassenger(i: number) {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (passengers.some(p => p.name.trim().length < 2)) { setError("Nama setiap penumpang minimal 2 karakter"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId, customerName, customerPhone, pickupAddress, note, departureDate, passengers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat booking");
      router.push(`/booking/success/${data.code}?phone=${encodeURIComponent(customerPhone)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h2 className="font-semibold">Data Pemesan</h2>
      <Input label="Nama lengkap" required minLength={2} value={customerName} onChange={e => setCustomerName(e.target.value)} />
      <Input label="Nomor WhatsApp" placeholder="08xxxxxxxxxx" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
      <Input label="Alamat / Titik Jemput (opsional)" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Data Penumpang ({passengers.length})</h3>
          <button type="button" onClick={addPassenger} className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1">
            <Plus className="h-3 w-3" /> Tambah
          </button>
        </div>
        <div className="space-y-2">
          {passengers.map((p, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <Input label={i === 0 ? "Nama" : undefined} placeholder={`Nama penumpang ${i + 1}`} required value={p.name} onChange={e => updatePassenger(i, "name", e.target.value)} />
              <Input label={i === 0 ? "No. Identitas (opsional)" : undefined} value={p.idNumber} onChange={e => updatePassenger(i, "idNumber", e.target.value)} />
              {passengers.length > 1 && (
                <button type="button" onClick={() => removePassenger(i)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg" aria-label="Hapus">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Textarea label="Catatan tambahan (opsional)" rows={2} value={note} onChange={e => setNote(e.target.value)} />

      <div className="border-t pt-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">Total</div>
          <div className="text-lg font-bold text-brand-700">Rp {total.toLocaleString("id-ID")}</div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</> : "Lanjut ke Pembayaran"}
      </Button>
    </form>
  );
}
