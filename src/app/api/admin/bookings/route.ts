import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const status = url.searchParams.get("status") ?? "";
    const where: any = {};
    if (q) where.OR = [
      { code: { contains: q } },
      { customerName: { contains: q } },
      { customerPhone: { contains: q } },
    ];
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where, orderBy: { createdAt: "desc" }, take: 200,
      include: { route: true, charter: { include: { vehicleType: true } } },
    });
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
