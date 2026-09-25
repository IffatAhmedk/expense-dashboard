import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, dateFilter, optionalText, parseAmount, parseDate } from "@/lib/api";

const include = { tags: { select: { id: true, name: true, color: true }, orderBy: { name: "asc" as const } } };

/** ?from&to to limit dates, ?tag=<id> or ?tag=untagged to filter. */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const tag = params.get("tag");
  const where: Prisma.ExpenseWhereInput = {};
  const date = dateFilter(params);
  if (date) where.date = date;
  if (tag === "untagged") where.tags = { none: {} };
  else if (tag) where.tags = { some: { id: tag } };

  const expenses = await prisma.expense.findMany({ where, include, orderBy: [{ date: "desc" }, { createdAt: "desc" }] });
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const description = optionalText(body.description);
  const amount = parseAmount(body.amount);
  const date = body.date ? parseDate(body.date) : new Date();
  if (!description) return badRequest("Say what the money was spent on");
  if (amount == null) return badRequest("Enter an amount above zero");
  if (!date) return badRequest("That date doesn't look right");
  const tagIds: string[] = Array.isArray(body.tagIds) ? body.tagIds.filter((t: unknown) => typeof t === "string") : [];

  const expense = await prisma.expense.create({
    data: {
      description,
      amount,
      date,
      note: optionalText(body.note),
      tags: { connect: tagIds.map((id) => ({ id })) },
    },
    include,
  });
  return NextResponse.json(expense, { status: 201 });
}
