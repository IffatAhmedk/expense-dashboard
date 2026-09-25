import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { fromDateInput } from "./format";

export function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** A positive amount, or null when the value isn't one. */
export function parseAmount(value: unknown) {
  const n = typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Accepts yyyy-mm-dd (from a date input) or a full ISO string. */
export function parseDate(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? fromDateInput(value) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** from/to query params as a Prisma date filter. */
export function dateFilter(params: URLSearchParams) {
  const from = params.get("from");
  const to = params.get("to");
  if (!from && !to) return undefined;
  return { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) };
}

export function isUniqueViolation(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

export function isNotFound(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
}
