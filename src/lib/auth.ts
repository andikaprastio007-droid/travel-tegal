import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const SECRET = process.env.AUTH_SECRET;
if (!SECRET) throw new Error("AUTH_SECRET tidak diset");
const COOKIE = "travel_admin_token";
const MAX_AGE = 60 * 60 * 24 * 7;

export type JWTPayload = { sub: string; email: string; role: string; name: string };

export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const verifyPassword = (pw: string, h: string) => bcrypt.compare(pw, h);

export function signToken(p: JWTPayload) {
  return jwt.sign(p, SECRET as string, { expiresIn: MAX_AGE });
}
export function verifyToken(t: string): JWTPayload | null {
  try { return jwt.verify(t, SECRET as string) as JWTPayload; } catch { return null; }
}
export function setSessionCookie(t: string) {
  cookies().set(COOKIE, t, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: MAX_AGE,
  });
}
export function clearSessionCookie() { cookies().set(COOKIE, "", { path: "/", maxAge: 0 }); }

export async function getCurrentAdmin(): Promise<JWTPayload | null> {
  const t = cookies().get(COOKIE)?.value;
  if (!t) return null;
  const p = verifyToken(t);
  if (!p) return null;
  const a = await prisma.admin.findUnique({ where: { id: p.sub } });
  if (!a || !a.isActive) return null;
  return { sub: a.id, email: a.email, role: a.role, name: a.name };
}
export async function requireAdmin(): Promise<JWTPayload> {
  const a = await getCurrentAdmin();
  if (!a) throw new Error("UNAUTHORIZED");
  return a;
}
