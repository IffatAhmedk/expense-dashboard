import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTagColor } from "@/lib/tags";
import { badRequest, isUniqueViolation } from "@/lib/api";

/** Every tag with how often it's used and how much has been spent under it, all time. */
export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { expenses: { select: { amount: true, date: true } } },
  });
  return NextResponse.json(
    tags.map(({ expenses, ...tag }) => ({
      ...tag,
      count: expenses.length,
      total: expenses.reduce((sum, e) => sum + e.amount, 0),
      lastUsed: expenses.reduce<Date | null>((last, e) => (!last || e.date > last ? e.date : last), null),
    }))
  );
}

export async function POST(req: NextRequest) {
  const { name, color } = await req.json();
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) return badRequest("Give the tag a name");
  try {
    const tag = await prisma.tag.create({ data: { name: trimmed, color: isTagColor(color) ? color : "stone" } });
    return NextResponse.json(tag, { status: 201 });
  } catch (e) {
    if (isUniqueViolation(e)) return badRequest(`You already have a tag called "${trimmed}"`, 409);
    throw e;
  }
}
