import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, dateFilter, optionalText, parseAmount, parseDate } from "@/lib/api";

const include = { account: { select: { id: true, name: true } } };

export async function GET(req: NextRequest) {
  const date = dateFilter(req.nextUrl.searchParams);
  const income = await prisma.income.findMany({
    where: date ? { date } : undefined,
    include,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(income);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const source = optionalText(body.source);
  const amount = parseAmount(body.amount);
  const date = body.date ? parseDate(body.date) : new Date();
  if (!source) return badRequest("Say where the money came from");
  if (amount == null) return badRequest("Enter an amount above zero");
  if (!date) return badRequest("That date doesn't look right");

  const income = await prisma.income.create({
    data: { source, amount, date, note: optionalText(body.note), accountId: optionalText(body.accountId) },
    include,
  });
  return NextResponse.json(income, { status: 201 });
}
