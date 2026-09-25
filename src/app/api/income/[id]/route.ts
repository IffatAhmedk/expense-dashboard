import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, isNotFound, optionalText, parseAmount, parseDate } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Prisma.IncomeUncheckedUpdateInput = {};

  if (body.source !== undefined) {
    const source = optionalText(body.source);
    if (!source) return badRequest("Say where the money came from");
    data.source = source;
  }
  if (body.amount !== undefined) {
    const amount = parseAmount(body.amount);
    if (amount == null) return badRequest("Enter an amount above zero");
    data.amount = amount;
  }
  if (body.date !== undefined) {
    const date = parseDate(body.date);
    if (!date) return badRequest("That date doesn't look right");
    data.date = date;
  }
  if (body.note !== undefined) data.note = optionalText(body.note);
  if (body.accountId !== undefined) data.accountId = optionalText(body.accountId);

  try {
    const income = await prisma.income.update({
      where: { id },
      data,
      include: { account: { select: { id: true, name: true } } },
    });
    return NextResponse.json(income);
  } catch (e) {
    if (isNotFound(e)) return badRequest("That income entry no longer exists", 404);
    throw e;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.income.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
