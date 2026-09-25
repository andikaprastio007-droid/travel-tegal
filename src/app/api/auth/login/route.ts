import { NextRequest, NextResponse } from "next/server";
import { LoginSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });

    const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!admin || !admin.isActive) return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });

    const ok = await verifyPassword(parsed.data.password, admin.passwordHash);
    if (!ok) return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });

    const token = signToken({ sub: admin.id, email: admin.email, role: admin.role, name: admin.name });
    setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
