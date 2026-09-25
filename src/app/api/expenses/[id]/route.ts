import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, isNotFound, optionalText, parseAmount, parseDate } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Prisma.ExpenseUpdateInput = {};

  if (body.description !== undefined) {
    const description = optionalText(body.description);
    if (!description) return badRequest("Say what the money was spent on");
    data.description = description;
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
  if (Array.isArray(body.tagIds)) {
    data.tags = { set: body.tagIds.filter((t: unknown) => typeof t === "string").map((tagId: string) => ({ id: tagId })) };
  }

  try {
    const expense = await prisma.expense.update({
      where: { id },
      data,
      include: { tags: { select: { id: true, name: true, color: true }, orderBy: { name: "asc" } } },
    });
    return NextResponse.json(expense);
  } catch (e) {
    if (isNotFound(e)) return badRequest("That expense no longer exists", 404);
    throw e;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.expense.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
