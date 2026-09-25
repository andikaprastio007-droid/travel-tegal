import { NextRequest, NextResponse } from "next/server";
import { CreateCharterSchema } from "@/lib/validators";
import { createCharterBooking } from "@/services/bookingService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateCharterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Input tidak valid" }, { status: 400 });
    }
    const { booking } = await createCharterBooking(parsed.data);
    return NextResponse.json({ code: booking.code, id: booking.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Terjadi kesalahan" }, { status: 400 });
  }
}
