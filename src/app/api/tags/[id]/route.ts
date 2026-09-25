import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTagColor } from "@/lib/tags";
import { badRequest, isNotFound, isUniqueViolation } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, color } = await req.json();
  const data: { name?: string; color?: string } = {};
  if (name !== undefined) {
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) return badRequest("Give the tag a name");
    data.name = trimmed;
  }
  if (color !== undefined) {
    if (!isTagColor(color)) return badRequest("Pick one of the colours");
    data.color = color;
  }
  try {
    return NextResponse.json(await prisma.tag.update({ where: { id }, data }));
  } catch (e) {
    if (isUniqueViolation(e)) return badRequest(`You already have a tag called "${data.name}"`, 409);
    if (isNotFound(e)) return badRequest("That tag no longer exists", 404);
    throw e;
  }
}

/** Removes the tag. Expenses that had it stay — they just lose the label. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.tag.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
