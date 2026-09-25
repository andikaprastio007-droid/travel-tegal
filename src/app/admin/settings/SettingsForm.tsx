"use client";
import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) { setForm({ ...form, [k]: v }); }

  async function save() {
    setLoading(true); setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gagal");
      setMsg("Tersimpan ✓");
    } catch { setMsg("Gagal simpan"); }
    finally { setLoading(false); }
  }

  const fields: { key: string; label: string; type?: "text" | "textarea" }[] = [
    { key: "travel_name", label: "Nama Travel" },
    { key: "travel_tagline", label: "Tagline" },
    { key: "whatsapp_number", label: "Nomor WhatsApp Admin" },
    { key: "contact_address", label: "Alamat" },
    { key: "contact_email", label: "Email" },
    { key: "qris_image_url", label: "URL Gambar QRIS" },
    { key: "footer_text", label: "Footer Text", type: "textarea" },
  ];

  return (
    <div className="card space-y-3">
      {fields.map(f => (
        f.type === "textarea"
          ? <Textarea key={f.key} label={f.label} value={form[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} rows={2} />
          : <Input key={f.key} label={f.label} value={form[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} />
      ))}
      <Button onClick={save} disabled={loading}>{loading ? "Menyimpan..." : "Simpan Pengaturan"}</Button>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
