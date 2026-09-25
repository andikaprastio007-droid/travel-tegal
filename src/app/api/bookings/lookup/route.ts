import { NextRequest, NextResponse } from "next/server";
import { LookupBookingSchema } from "@/lib/validators";
import { lookupBooking } from "@/services/bookingService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LookupBookingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
    const booking = await lookupBooking(parsed.data.code, parsed.data.phone);
    if (!booking) return NextResponse.json({ error: "Tidak ada booking dengan data tersebut." }, { status: 404 });
    return NextResponse.json({ booking });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
