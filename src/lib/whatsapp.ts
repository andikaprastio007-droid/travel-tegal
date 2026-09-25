export type WaContext =
  | { type: "general" }
  | { type: "booking"; code: string; name: string; route: string; date: string; passengers: number; total: number }
  | { type: "charter"; code: string; name: string; vehicle: string; origin: string; destination: string; date: string }
  | { type: "payment"; code: string; name: string; route: string; date: string; passengers: number; total: number };

export function buildWhatsAppUrl(phone: string, ctx: WaContext): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(buildMessage(ctx))}`;
}

function buildMessage(ctx: WaContext): string {
  switch (ctx.type) {
    case "general": return "Halo Admin, saya ingin bertanya tentang travel Tegal ↔ Jabodetabek.";
    case "booking": return [
      "Halo Admin, saya sudah membuat booking.", "",
      `Kode Booking: ${ctx.code}`, `Nama: ${ctx.name}`, `Rute: ${ctx.route}`,
      `Tanggal: ${ctx.date}`, `Jumlah: ${ctx.passengers} orang`,
      `Total: Rp ${ctx.total.toLocaleString("id-ID")}`,
    ].join("\n");
    case "charter": return [
      "Halo Admin, saya ingin carter mobil.", "",
      `Kode Booking: ${ctx.code}`, `Nama: ${ctx.name}`, `Kendaraan: ${ctx.vehicle}`,
      `Rute: ${ctx.origin} → ${ctx.destination}`, `Tanggal: ${ctx.date}`,
    ].join("\n");
    case "payment": return [
      "Halo Admin, saya ingin melakukan pembayaran booking.", "",
      `Kode Booking: ${ctx.code}`, `Nama: ${ctx.name}`, `Rute: ${ctx.route}`,
      `Tanggal: ${ctx.date}`, `Jumlah: ${ctx.passengers} orang`,
      `Total: Rp ${ctx.total.toLocaleString("id-ID")}`, "", "Saya akan melakukan pembayaran.",
    ].join("\n");
  }
}
