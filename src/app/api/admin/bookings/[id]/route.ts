import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data: any = {};
    if (body.status) data.status = body.status;
    if (body.paymentStatus) data.paymentStatus = body.paymentStatus;

    await prisma.booking.update({ where: { id: params.id }, data });

    if (body.paymentStatus) {
      await prisma.payment.updateMany({
        where: { bookingId: params.id },
        data: { status: body.paymentStatus },
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal update" }, { status: 400 });
  }
}
