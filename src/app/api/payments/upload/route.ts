import { NextRequest, NextResponse } from "next/server";
import { uploadPaymentProof } from "@/services/paymentService";

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const file = fd.get("file") as File | null;
    const code = fd.get("code") as string | null;
    const phone = fd.get("phone") as string | null;
    if (!file || !code || !phone) return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    const result = await uploadPaymentProof(code, phone, file);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Terjadi kesalahan" }, { status: 400 });
  }
}
