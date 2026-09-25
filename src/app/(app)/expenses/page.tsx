"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Plus, Search } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/format";
import { useTags } from "@/lib/hooks";
import type { Expense } from "@/lib/types";
import { btnPrimary } from "@/components/ui";
import ExpenseList from "@/components/expense-list";
import ExpenseModal from "@/components/expense-modal";
import DateRangeFilter from "../date-range-filter";
import { PERIOD_WORDS, useDateRange } from "../range-context";

function ExpensesView() {
  const router = useRouter();
  const tag = useSearchParams().get("tag") ?? "";
  const { query, preset } = useDateRange();
  const { tags } = useTags();
  const { data: expenses, isLoading } = useSWR<Expense[]>(
    `/api/expenses${query}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`,
    fetcher
  );
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Expense | "new" | null>(null);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = expenses ?? [];
    return q ? list.filter((e) => e.description.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q)) : list;
  }, [expenses, search]);
  const total = shown.reduce((sum, e) => sum + e.amount, 0);

  function pickTag(id: string) {
    router.replace(id ? `/expenses?tag=${id}` : "/expenses", { scroll: false });
  }

  const chip = (active: boolean) =>
    `rounded-pill border px-4 text-label font-bold ${active ? "border-ink bg-ink text-on-ink" : "border-control bg-card text-ink hover:bg-sunken"}`;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-ink">Expenses</h1>
          <p className="text-base text-ink-muted">Everything you spent {PERIOD_WORDS[preset]}.</p>
        </div>
        <DateRangeFilter />
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tag">
        <button onClick={() => pickTag("")} aria-pressed={!tag} className={chip(!tag)}>
          All
        </button>
        {tags.map((t) => (
          <button
            key={t.id}
            onClick={() => pickTag(t.id)}
            aria-pressed={tag === t.id}
            className="inline-flex items-center gap-1.5 rounded-pill border-2 px-4 text-label font-bold"
            style={{
              color: `var(--tag-${t.color})`,
              background: tag === t.id ? `var(--tag-${t.color}-soft)` : "var(--surface-card)",
              borderColor: tag === t.id ? `var(--tag-${t.color})` : "var(--line)",
            }}
          >
            <span className="h-2 w-2 rounded-pill" style={{ background: `var(--tag-${t.color})` }} aria-hidden="true" />
            {t.name}
          </button>
        ))}
        <button onClick={() => pickTag("untagged")} aria-pressed={tag === "untagged"} className={chip(tag === "untagged")}>
          No tag
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            aria-label="Search expenses"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full !pl-11"
          />
        </div>
        <div className="flex items-center gap-4">
          <p className="text-base text-ink-muted">
            {shown.length} expense{shown.length === 1 ? "" : "s"} ·{" "}
            <span className="text-lg font-bold text-ink">{formatCurrency(total)}</span>
          </p>
          <button onClick={() => setEditing("new")} className={btnPrimary}>
            <Plus size={16} strokeWidth={2.4} /> Add an expense
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-base text-ink-muted">Loading…</p>
      ) : (
        <ExpenseList
          expenses={shown}
          onEdit={setEditing}
          empty={search ? "Nothing matches that search." : `No expenses ${PERIOD_WORDS[preset]}${tag ? " with this tag" : ""}.`}
        />
      )}

      {editing && <ExpenseModal expense={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense>
      <ExpensesView />
    </Suspense>
  );
}
