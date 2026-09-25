import { NextRequest, NextResponse } from "next/server";
import { CreateBookingSchema } from "@/lib/validators";
import { createTicketBooking } from "@/services/bookingService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Input tidak valid" }, { status: 400 });
    }
    const booking = await createTicketBooking(parsed.data);
    return NextResponse.json({ code: booking.code, id: booking.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Terjadi kesalahan" }, { status: 400 });
  }
}
