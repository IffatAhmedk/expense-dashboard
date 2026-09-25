"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { refreshAll, sendJSON, useTags } from "@/lib/hooks";
import type { TagWithUsage } from "@/lib/types";
import { EmptyState, TagChip, btnPrimary } from "@/components/ui";
import { useDialogs } from "@/components/dialogs";
import TagModal from "@/components/tag-modal";
import { PERIOD_WORDS, useSummary } from "../range-context";

export default function TagsPage() {
  const { tags, isLoading } = useTags();
  const { summary, preset } = useSummary();
  const { confirm } = useDialogs();
  const [editing, setEditing] = useState<TagWithUsage | "new" | null>(null);

  const periodTotal = new Map((summary?.byTag ?? []).map((t) => [t.id, t.total]));
  const period = PERIOD_WORDS[preset];

  async function handleDelete(t: TagWithUsage) {
    const ok = await confirm({
      title: `Delete "${t.name}"?`,
      message:
        t.count > 0
          ? `It's on ${t.count} expense${t.count === 1 ? "" : "s"}. They stay — they just lose this tag.`
          : "It isn't on any expenses.",
      confirmLabel: "Delete tag",
      tone: "danger",
    });
    if (!ok) return;
    await sendJSON(`/api/tags/${t.id}`, "DELETE");
    await refreshAll();
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-ink">Tags</h1>
          <p className="text-base text-ink-muted">Your own labels for grouping expenses. An expense can have several.</p>
        </div>
        <button onClick={() => setEditing("new")} className={btnPrimary}>
          <Plus size={16} strokeWidth={2.4} /> New tag
        </button>
      </div>

      {isLoading ? (
        <p className="text-base text-ink-muted">Loading…</p>
      ) : tags.length === 0 ? (
        <EmptyState>
          No tags yet. Start with a few like <strong className="text-ink">Groceries</strong>,{" "}
          <strong className="text-ink">Bills</strong> and <strong className="text-ink">Eating out</strong>.
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-card shadow-card">
          <table className="w-full text-left">
            <thead className="border-b border-line text-label text-ink-muted">
              <tr>
                <th className="px-5 font-bold">Tag</th>
                <th className="px-5 text-right font-bold">Spent {period}</th>
                <th className="px-5 text-right font-bold">All time</th>
                <th className="hidden px-5 text-right font-bold sm:table-cell">Expenses</th>
                <th className="hidden px-5 font-bold md:table-cell">Last used</th>
                <th className="px-5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tags.map((t) => (
                <tr key={t.id}>
                  <td className="px-5 py-2">
                    <Link href={`/expenses?tag=${t.id}`} title="See these expenses">
                      <TagChip name={t.name} color={t.color} />
                    </Link>
                  </td>
                  <td className="px-5 text-right font-bold text-ink">{formatCurrency(periodTotal.get(t.id) ?? 0)}</td>
                  <td className="px-5 text-right text-ink-muted">{formatCurrency(t.total)}</td>
                  <td className="hidden px-5 text-right text-ink-muted sm:table-cell">{t.count}</td>
                  <td className="hidden px-5 text-ink-muted md:table-cell">{t.lastUsed ? formatDate(t.lastUsed) : "Never"}</td>
                  <td className="px-5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(t)}
                        aria-label={`Edit ${t.name}`}
                        title="Rename or recolour"
                        className="flex items-center justify-center rounded-pill text-ink hover:bg-sunken"
                      >
                        <Pencil size={16} strokeWidth={2.4} />
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        aria-label={`Delete ${t.name}`}
                        title="Delete"
                        className="flex items-center justify-center rounded-pill text-danger hover:bg-danger-soft"
                      >
                        <Trash2 size={16} strokeWidth={2.4} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <TagModal tag={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
