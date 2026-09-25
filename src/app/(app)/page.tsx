"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Plus, TrendingUp, TrendingDown, Receipt, Percent, Landmark, PiggyBank } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/format";
import type { Expense } from "@/lib/types";
import { StatCard, btnPrimary, btnSecondary, btnQuiet } from "@/components/ui";
import ExpenseList from "@/components/expense-list";
import ExpenseModal from "@/components/expense-modal";
import IncomeModal from "@/components/income-modal";
import DateRangeFilter from "./date-range-filter";
import { PERIOD_WORDS, useSummary } from "./range-context";

export default function OverviewPage() {
  const { summary: s, preset, query } = useSummary();
  const { data: expenses = [] } = useSWR<Expense[]>(`/api/expenses${query}`, fetcher);
  const [editing, setEditing] = useState<Expense | "new" | null>(null);
  const [addingIncome, setAddingIncome] = useState(false);

  const period = PERIOD_WORDS[preset];
  const savedTone = !s || s.saved >= 0 ? "good" : "bad";
  const rate = s && s.income > 0 ? (s.saved / s.income) * 100 : 0;

  const daily = s?.daily ?? [];
  const spentSeries = daily.map((d) => ({ date: d.date, value: d.spent }));
  const incomeSeries = daily.map((d) => ({ date: d.date, value: d.income }));
  // Running total, so the line shows savings building up (or draining) over the period.
  const savedSeries = daily.reduce<{ date: string; value: number }[]>(
    (acc, d) => [...acc, { date: d.date, value: (acc.at(-1)?.value ?? 0) + d.income - d.spent }],
    []
  );

  const topTags = (s?.byTag ?? []).slice(0, 9);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-ink">Assalam o Alaikum</h1>
          <p className="text-base text-ink-muted">Here is where your money went {period}.</p>
        </div>
        <DateRangeFilter />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Spent ${period}`}
          value={s?.spent ?? 0}
          icon={Receipt}
          series={spentSeries}
          hint={s ? `${s.expenseCount} expense${s.expenseCount === 1 ? "" : "s"}` : undefined}
        />
        <StatCard
          label={`Income ${period}`}
          value={s?.income ?? 0}
          icon={TrendingUp}
          series={incomeSeries}
          hint={s ? `${s.incomeCount} payment${s.incomeCount === 1 ? "" : "s"} in` : undefined}
        />
        <StatCard
          label="Saved"
          value={s?.saved ?? 0}
          tone={savedTone}
          icon={savedTone === "good" ? PiggyBank : TrendingDown}
          series={savedSeries}
          hint={savedTone === "good" ? "Income left after spending" : "You spent more than came in"}
        />
        <StatCard
          label="Savings rate"
          value={rate}
          format="percent"
          icon={Percent}
          hint="Of every Rs 100 earned, this is kept"
        />
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl text-ink">Where the money went</h2>
          <Link href="/tags" className={btnQuiet}>
            Manage tags
          </Link>
        </div>
        {topTags.length === 0 && !s?.untagged.count ? (
          <p className="text-base text-ink-muted">Nothing spent {period} yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {topTags.map((t) => (
              <Link
                key={t.id}
                href={`/expenses?tag=${t.id}`}
                className="rounded-lg bg-card p-4 shadow-card transition hover:ring-2 hover:ring-brand"
                style={{ borderTop: `4px solid var(--tag-${t.color})` }}
              >
                <p className="truncate text-label font-bold" style={{ color: `var(--tag-${t.color})` }}>
                  {t.name}
                </p>
                <p className="mt-1 text-xl font-bold text-ink">{formatCurrency(t.total)}</p>
                <p className="text-caption text-ink-muted">
                  {s && s.spent > 0 ? `${Math.round((t.total / s.spent) * 100)}% · ` : ""}
                  {t.count} expense{t.count === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
            {!!s?.untagged.count && (
              <Link
                href="/expenses?tag=untagged"
                className="rounded-lg border-2 border-dashed border-line p-4 transition hover:ring-2 hover:ring-brand"
              >
                <p className="text-label font-bold text-ink-muted">No tag</p>
                <p className="mt-1 text-xl font-bold text-ink">{formatCurrency(s.untagged.total)}</p>
                <p className="text-caption text-ink-muted">
                  {s.untagged.count} expense{s.untagged.count === 1 ? "" : "s"} to tag
                </p>
              </Link>
            )}
          </div>
        )}
        {s && s.byTag.length > 0 && (
          <p className="text-caption text-ink-muted">An expense with more than one tag counts under each of them.</p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl text-ink">Recent expenses</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAddingIncome(true)} className={btnSecondary}>
              <Plus size={16} strokeWidth={2.4} /> Add income
            </button>
            <button onClick={() => setEditing("new")} className={btnPrimary}>
              <Plus size={16} strokeWidth={2.4} /> Add an expense
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[7fr_3fr]">
          <div className="space-y-2">
            <ExpenseList expenses={expenses.slice(0, 10)} onEdit={setEditing} empty={`Nothing spent ${period} yet.`} />
            {expenses.length > 10 && (
              <Link href="/expenses" className={btnQuiet}>
                See all {expenses.length} expenses
              </Link>
            )}
          </div>
          <Link
            href="/income"
            className="rounded-lg bg-card p-5 shadow-card transition hover:ring-2 hover:ring-brand order-first xl:order-none xl:self-start"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-label font-bold text-ink-muted">Money in your accounts</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-sunken text-leaf">
                <Landmark size={18} strokeWidth={2.2} />
              </span>
            </div>
            <p className="mt-1 text-3xl font-bold text-ink">{formatCurrency(s?.totalBalance ?? 0)}</p>
            <p className="mt-1 text-caption text-ink-muted">
              {s?.accountCount ? `Across ${s.accountCount} account${s.accountCount === 1 ? "" : "s"}` : "Add your accounts →"}
            </p>
          </Link>
        </div>
      </section>

      {editing && <ExpenseModal expense={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
      {addingIncome && <IncomeModal onClose={() => setAddingIncome(false)} />}
    </div>
  );
}
