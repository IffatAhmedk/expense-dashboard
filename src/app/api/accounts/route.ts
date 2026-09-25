import { NextRequest, NextResponse } from "next/server";
import { AccountKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ACCOUNT_KINDS } from "@/lib/format";
import { badRequest, optionalText } from "@/lib/api";

export async function GET() {
  const accounts = await prisma.account.findMany({ orderBy: [{ balance: "desc" }, { name: "asc" }] });
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = optionalText(body.name);
  const balance = Number(body.balance ?? 0);
  if (!name) return badRequest("Give the account a name");
  if (!Number.isFinite(balance)) return badRequest("Enter the balance as a number");
  const kind = (ACCOUNT_KINDS as readonly string[]).includes(body.kind) ? (body.kind as AccountKind) : "BANK";

  const account = await prisma.account.create({
    data: { name, bank: optionalText(body.bank), kind, balance, balanceUpdatedAt: new Date() },
  });
  return NextResponse.json(account, { status: 201 });
}
