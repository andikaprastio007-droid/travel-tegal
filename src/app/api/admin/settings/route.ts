import { NextRequest, NextResponse } from "next/server";
import { updateSettings, getSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ settings: await getSettings() });
  } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    await updateSettings(body);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Gagal simpan" }, { status: 400 }); }
}
