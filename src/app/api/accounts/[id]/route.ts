import { NextRequest, NextResponse } from "next/server";
import { AccountKind, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ACCOUNT_KINDS } from "@/lib/format";
import { badRequest, isNotFound, optionalText } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Prisma.AccountUpdateInput = {};

  if (body.name !== undefined) {
    const name = optionalText(body.name);
    if (!name) return badRequest("Give the account a name");
    data.name = name;
  }
  if (body.bank !== undefined) data.bank = optionalText(body.bank);
  if (body.kind !== undefined) {
    if (!(ACCOUNT_KINDS as readonly string[]).includes(body.kind)) return badRequest("Pick an account type");
    data.kind = body.kind as AccountKind;
  }
  if (body.balance !== undefined) {
    const balance = Number(body.balance);
    if (!Number.isFinite(balance)) return badRequest("Enter the balance as a number");
    data.balance = balance;
    data.balanceUpdatedAt = new Date();
  }

  try {
    return NextResponse.json(await prisma.account.update({ where: { id }, data }));
  } catch (e) {
    if (isNotFound(e)) return badRequest("That account no longer exists", 404);
    throw e;
  }
}

/** Removes the account. Income that landed in it stays in the income log, just without an account. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.account.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
