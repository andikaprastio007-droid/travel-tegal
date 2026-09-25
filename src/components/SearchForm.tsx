"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select } from "./ui/Input";
import { Button } from "./ui/Button";
import { Search } from "lucide-react";
import { todayISO } from "@/lib/utils";

export function SearchForm({ cities, defaultOrigin = "Tegal", defaultDestination = "Jakarta", compact = false }: {
  cities: { id: string; name: string; region: string }[];
  defaultOrigin?: string; defaultDestination?: string; compact?: boolean;
}) {
  const router = useRouter();
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [date, setDate] = useState(todayISO());
  const [passengers, setPassengers] = useState(1);
  const [error, setError] = useState("");

  const tegal = cities.filter(c => c.region === "Tegal");
  const jabodetabek = cities.filter(c => c.region === "Jabodetabek");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (origin === destination) { setError("Asal dan tujuan tidak boleh sama"); return; }
    setError("");
    const q = new URLSearchParams({ origin, destination, date, passengers: String(passengers) });
    router.push(`/search?${q.toString()}`);
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <div className={compact ? "space-y-3" : "grid gap-3 md:grid-cols-2"}>
        <Select label="Dari" value={origin} onChange={e => setOrigin(e.target.value)}>
          <optgroup label="Tegal">{tegal.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</optgroup>
          <optgroup label="Jabodetabek">{jabodetabek.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</optgroup>
        </Select>
        <Select label="Ke" value={destination} onChange={e => setDestination(e.target.value)}>
          <optgroup label="Tegal">{tegal.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</optgroup>
          <optgroup label="Jabodetabek">{jabodetabek.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</optgroup>
        </Select>
      </div>
      <div className={compact ? "space-y-3" : "grid gap-3 md:grid-cols-2"}>
        <Input label="Tanggal" type="date" value={date} min={todayISO()} onChange={e => setDate(e.target.value)} required />
        <Input label="Jumlah Penumpang" type="number" min={1} max={20} value={passengers}
          onChange={e => setPassengers(Number(e.target.value))} required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full">
        <Search className="h-4 w-4" /> Cari Travel
      </Button>
    </form>
  );
}
