import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_DAYS, createSessionToken, passwordMatches } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !(await passwordMatches(password))) {
    return NextResponse.json({ error: "That password is not right" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return res;
}
