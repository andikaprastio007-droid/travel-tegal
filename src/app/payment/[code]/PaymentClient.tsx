"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Upload, Loader2, CheckCircle, XCircle, Copy } from "lucide-react";
import { formatIDR, formatDateID } from "@/lib/utils";

type BankAccount = { id: string; bankName: string; accountNumber: string; accountName: string };
type Method = { id: string; type: "BANK_TRANSFER" | "QRIS" | "WHATSAPP"; name: string; bankAccounts: BankAccount[] };

export function PaymentClient(props: {
  code: string; customerPhone: string; customerName: string; route: string;
  date: string; passengers: number; total: number;
  paymentStatus: string; proofUrl: string | null;
  methods: Method[]; whatsapp: string; qrisImage: string;
}) {
  const [tab, setTab] = useState<"BANK_TRANSFER" | "QRIS" | "WHATSAPP">(
    (props.methods.find(m => m.type === "BANK_TRANSFER")?.type as "BANK_TRANSFER") ?? "BANK_TRANSFER"
  );
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const waMsg = encodeURIComponent([
    "Halo Admin, saya ingin melakukan pembayaran booking.", "",
    `Kode Booking: ${props.code}`, `Nama: ${props.customerName}`, `Rute: ${props.route}`,
    `Tanggal: ${formatDateID(props.date)}`, `Jumlah: ${props.passengers} orang`,
    `Total: Rp ${props.total.toLocaleString("id-ID")}`, "", "Saya akan melakukan pembayaran.",
  ].join("\n"));

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true); setError(""); setMessage("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("code", props.code);
      fd.append("phone", props.customerPhone);
      const res = await fetch("/api/payments/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal upload");
      setMessage("Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.");
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally { setUploading(false); }
  }

  const bankMethods = props.methods.filter(m => m.type === "BANK_TRANSFER");

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Kode Booking</span>
          <Badge color={props.paymentStatus === "PAID" ? "green" : props.paymentStatus === "PENDING" ? "yellow" : "gray"}>
            {props.paymentStatus === "PAID" ? "Lunas" : props.paymentStatus === "PENDING" ? "Menunggu Verifikasi" : "Belum Bayar"}
          </Badge>
        </div>
        <div className="font-mono font-bold text-lg text-brand-700">{props.code}</div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">Total Pembayaran</h2>
        <div className="text-3xl font-bold text-brand-700">{formatIDR(props.total)}</div>
      </div>

      <div className="card">
        <div className="flex gap-2 border-b mb-3 overflow-x-auto">
          {(["BANK_TRANSFER","QRIS","WHATSAPP"] as const).map(t => {
            const label = t === "BANK_TRANSFER" ? "Transfer Bank" : t === "QRIS" ? "QRIS" : "WhatsApp";
            return (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                  tab === t ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500"
                }`}>
                {label}
              </button>
            );
          })}
        </div>

        {tab === "BANK_TRANSFER" && (
          <div className="space-y-3">
            {bankMethods.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada rekening. Hubungi admin.</p>
            ) : bankMethods.map(m => (
              <div key={m.id} className="space-y-2">
                {m.bankAccounts.map(b => (
                  <div key={b.id} className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                    <div className="text-xs text-gray-500">{b.bankName}</div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="font-mono font-bold">{b.accountNumber}</div>
                      <button type="button"
                        onClick={() => navigator.clipboard.writeText(b.accountNumber)}
                        className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1">
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">a/n {b.accountName}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === "QRIS" && (
          <div className="text-center space-y-3">
            {props.qrisImage ? (
              <>
                <p className="text-sm text-gray-600">Scan QR untuk melakukan pembayaran.</p>
                <img src={props.qrisImage} alt="QRIS" className="mx-auto max-w-xs rounded-lg border" />
              </>
            ) : (
              <p className="text-sm text-gray-500 py-6">QRIS belum tersedia. Hubungi admin via WhatsApp.</p>
            )}
          </div>
        )}

        {tab === "WHATSAPP" && (
          <div className="text-center space-y-3 py-2">
            <p className="text-sm text-gray-600">Konfirmasi pembayaran langsung ke admin via WhatsApp.</p>
            <a href={`https://wa.me/${props.whatsapp.replace(/\D/g, "")}?text=${waMsg}`}
              target="_blank" rel="noopener noreferrer" className="btn-wa w-full">
              Buka WhatsApp
            </a>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3">Upload Bukti Pembayaran</h2>
        {props.paymentStatus === "PAID" ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" /> Pembayaran sudah diterima.
          </div>
        ) : props.paymentStatus === "REJECTED" ? (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <XCircle className="h-4 w-4" /> Pembayaran ditolak, silakan hubungi admin.
          </div>
        ) : (
          <form onSubmit={upload} className="space-y-3">
            {props.proofUrl && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                Bukti sudah diunggah: <a href={props.proofUrl} target="_blank" rel="noopener noreferrer" className="underline">Lihat</a>
              </div>
            )}
            <input type="file" accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-brand-700" />
            <p className="text-xs text-gray-500">Format: JPG, PNG, PDF. Maks 5MB.</p>
            <Button type="submit" disabled={!file || uploading} className="w-full">
              {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengunggah...</> : <><Upload className="h-4 w-4" /> Upload Bukti</>}
            </Button>
            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
