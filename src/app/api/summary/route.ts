import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dateFilter } from "@/lib/api";

/** The browser's day for a stored timestamp, given its getTimezoneOffset() in minutes. */
function dayKey(date: Date, tzOffset: number) {
  return new Date(date.getTime() - tzOffset * 60_000).toISOString().slice(0, 10);
}

function daysBetween(from: Date, to: Date, tzOffset: number) {
  const days: string[] = [];
  const cursor = new Date(dayKey(from, tzOffset) + "T00:00:00Z");
  const end = dayKey(to, tzOffset);
  while (cursor.toISOString().slice(0, 10) <= end && days.length < 400) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const date = dateFilter(params);
  const tzOffset = Number(params.get("tz") ?? 0) || 0;

  const [expenses, income, accounts] = await Promise.all([
    prisma.expense.findMany({
      where: date ? { date } : undefined,
      select: { amount: true, date: true, tags: { select: { id: true, name: true, color: true } } },
    }),
    prisma.income.findMany({ where: date ? { date } : undefined, select: { amount: true, date: true, source: true } }),
    prisma.account.findMany({ select: { balance: true } }),
  ]);

  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const earned = income.reduce((sum, i) => sum + i.amount, 0);

  // Daily series for the sparklines.
  const daily = new Map<string, { spent: number; income: number }>();
  const from = date?.gte ?? [...expenses, ...income].reduce<Date | null>((m, r) => (!m || r.date < m ? r.date : m), null);
  const to = date?.lte ?? new Date();
  if (from) for (const day of daysBetween(from, to, tzOffset)) daily.set(day, { spent: 0, income: 0 });
  for (const e of expenses) {
    const bucket = daily.get(dayKey(e.date, tzOffset));
    if (bucket) bucket.spent += e.amount;
  }
  for (const i of income) {
    const bucket = daily.get(dayKey(i.date, tzOffset));
    if (bucket) bucket.income += i.amount;
  }

  // Per-tag totals. An expense with two tags counts toward both.
  const byTag = new Map<string, { id: string; name: string; color: string; total: number; count: number }>();
  let untagged = { total: 0, count: 0 };
  for (const e of expenses) {
    if (e.tags.length === 0) untagged = { total: untagged.total + e.amount, count: untagged.count + 1 };
    for (const t of e.tags) {
      const row = byTag.get(t.id) ?? { ...t, total: 0, count: 0 };
      row.total += e.amount;
      row.count += 1;
      byTag.set(t.id, row);
    }
  }

  const bySource = new Map<string, number>();
  for (const i of income) bySource.set(i.source, (bySource.get(i.source) ?? 0) + i.amount);

  return NextResponse.json({
    spent,
    income: earned,
    saved: earned - spent,
    expenseCount: expenses.length,
    incomeCount: income.length,
    daily: [...daily].map(([day, v]) => ({ date: day, ...v })),
    byTag: [...byTag.values()].sort((a, b) => b.total - a.total),
    untagged,
    bySource: [...bySource].map(([source, total]) => ({ source, total })).sort((a, b) => b.total - a.total),
    totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
    accountCount: accounts.length,
  });
}
