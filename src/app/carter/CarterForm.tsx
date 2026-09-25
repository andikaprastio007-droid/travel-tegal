"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { todayISO } from "@/lib/utils";

type VT = { id: string; name: string; capacity: number; description: string | null };
type City = { id: string; name: string; region: string };

export function CarterForm({ vehicleTypes, cities, whatsapp }: { vehicleTypes: VT[]; cities: City[]; whatsapp: string }) {
  const router = useRouter();
  const [vehicleTypeId, setVehicleTypeId] = useState(vehicleTypes[0]?.id ?? "");
  const [origin, setOrigin] = useState("Tegal");
  const [destination, setDestination] = useState("Jakarta");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [departureDate, setDepartureDate] = useState(todayISO());
  const [departureTime, setDepartureTime] = useState("07:00");
  const [durationDays, setDurationDays] = useState(1);
  const [passengerCount, setPassengerCount] = useState(4);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/charters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleTypeId, origin, destination, pickupAddress, dropAddress,
          departureDate, departureTime, durationDays, passengerCount,
          customerName, customerPhone, note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal");
      router.push(`/booking/success/${data.code}?phone=${encodeURIComponent(customerPhone)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally { setLoading(false); }
  }

  const tegal = cities.filter(c => c.region === "Tegal");
  const jabodetabek = cities.filter(c => c.region === "Jabodetabek");

  return (
    <form onSubmit={submit} className="card space-y-4">
      <Select label="Jenis Kendaraan" value={vehicleTypeId} onChange={e => setVehicleTypeId(e.target.value)} required>
        {vehicleTypes.map(v => (
          <option key={v.id} value={v.id}>{v.name} (max {v.capacity} orang) {v.description ? `— ${v.description}` : ""}</option>
        ))}
      </Select>

      <div className="grid gap-3 md:grid-cols-2">
        <Select label="Asal" value={origin} onChange={e => setOrigin(e.target.value)}>
          <optgroup label="Tegal">{tegal.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</optgroup>
          <optgroup label="Jabodetabek">{jabodetabek.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</optgroup>
        </Select>
        <Select label="Tujuan" value={destination} onChange={e => setDestination(e.target.value)}>
          <optgroup label="Tegal">{tegal.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</optgroup>
          <optgroup label="Jabodetabek">{jabodetabek.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</optgroup>
        </Select>
      </div>

      <Input label="Alamat Penjemputan" required value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} />
      <Input label="Alamat Tujuan" required value={dropAddress} onChange={e => setDropAddress(e.target.value)} />

      <div className="grid gap-3 md:grid-cols-3">
        <Input label="Tanggal" type="date" min={todayISO()} value={departureDate} onChange={e => setDepartureDate(e.target.value)} required />
        <Input label="Jam Berangkat" type="time" value={departureTime} onChange={e => setDepartureTime(e.target.value)} required />
        <Input label="Durasi (hari)" type="number" min={1} max={30} value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} required />
      </div>

      <Input label="Jumlah Penumpang" type="number" min={1} max={50} value={passengerCount} onChange={e => setPassengerCount(Number(e.target.value))} required />

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3 text-sm">Data Pemesan</h3>
        <div className="space-y-3">
          <Input label="Nama lengkap" required value={customerName} onChange={e => setCustomerName(e.target.value)} />
          <Input label="Nomor WhatsApp" placeholder="08xxxxxxxxxx" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
        </div>
      </div>

      <Textarea label="Catatan (opsional)" rows={2} value={note} onChange={e => setNote(e.target.value)} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</> : "Pesan Carter"}
      </Button>
      <p className="text-xs text-gray-500 text-center">Harga akan dikonfirmasi admin via WhatsApp jika belum otomatis.</p>
    </form>
  );
}
