"use client";

import { Pencil, Trash2 } from "lucide-react";
import { TagChip, EmptyState } from "./ui";
import { useDialogs } from "./dialogs";
import { formatCurrency, formatDate } from "@/lib/format";
import { refreshAll, sendJSON } from "@/lib/hooks";
import type { Expense } from "@/lib/types";

export default function ExpenseList({
  expenses,
  onEdit,
  empty = "No expenses in this period.",
}: {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  empty?: string;
}) {
  const { confirm } = useDialogs();

  async function handleDelete(e: Expense) {
    const ok = await confirm({
      title: "Delete this expense?",
      message: `${e.description} · ${formatCurrency(e.amount)} on ${formatDate(e.date)}`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    await sendJSON(`/api/expenses/${e.id}`, "DELETE");
    await refreshAll();
  }

  if (expenses.length === 0) return <EmptyState>{empty}</EmptyState>;

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-lg bg-card shadow-card">
      {expenses.map((e) => (
        <li key={e.id} className="flex items-start gap-x-4 px-5 py-3">
          <div className="hidden w-24 shrink-0 pt-0.5 text-caption text-ink-muted sm:block">{formatDate(e.date)}</div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink">{e.description}</p>
            <p className="text-caption text-ink-muted sm:hidden">{formatDate(e.date)}</p>
            {e.note && <p className="truncate text-caption text-ink-muted">{e.note}</p>}
            {e.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {e.tags.map((t) => (
                  <TagChip key={t.id} name={t.name} color={t.color} size="sm" />
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-right text-lg font-bold text-ink">{formatCurrency(e.amount)}</span>
            <button
              onClick={() => onEdit(e)}
              aria-label={`Edit ${e.description}`}
              title="Edit"
              className="flex items-center justify-center rounded-pill text-ink hover:bg-sunken"
            >
              <Pencil size={16} strokeWidth={2.4} />
            </button>
            <button
              onClick={() => handleDelete(e)}
              aria-label={`Delete ${e.description}`}
              title="Delete"
              className="flex items-center justify-center rounded-pill text-danger hover:bg-danger-soft"
            >
              <Trash2 size={16} strokeWidth={2.4} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
