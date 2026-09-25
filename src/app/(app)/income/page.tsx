"use client";

import { useState } from "react";
import useSWR from "swr";
import { Landmark, Pencil, Plus, Trash2, TrendingUp, Wallet, PiggyBank, Banknote, Smartphone } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { ACCOUNT_KIND_LABELS, formatCurrency, formatDate } from "@/lib/format";
import { refreshAll, sendJSON, useAccounts } from "@/lib/hooks";
import type { Account, IncomeEntry } from "@/lib/types";
import { EmptyState, StatCard, btnPrimary, btnSecondary } from "@/components/ui";
import { useDialogs } from "@/components/dialogs";
import AccountModal from "@/components/account-modal";
import IncomeModal from "@/components/income-modal";
import DateRangeFilter from "../date-range-filter";
import { PERIOD_WORDS, useSummary } from "../range-context";

const KIND_ICON = { BANK: Landmark, SAVINGS: PiggyBank, WALLET: Smartphone, CASH: Banknote } as const;

export default function IncomePage() {
  const { summary: s, preset, query } = useSummary();
  const { accounts } = useAccounts();
  const { data: income = [] } = useSWR<IncomeEntry[]>(`/api/income${query}`, fetcher);
  const { confirm } = useDialogs();
  const [editingAccount, setEditingAccount] = useState<Account | "new" | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeEntry | "new" | null>(null);

  const period = PERIOD_WORDS[preset];
  const total = accounts.reduce((sum, a) => sum + a.balance, 0);
  const sources = s?.bySource ?? [];
  const maxSource = Math.max(1, ...sources.map((x) => x.total));
  const incomeSeries = (s?.daily ?? []).map((d) => ({ date: d.date, value: d.income }));

  async function deleteAccount(a: Account) {
    const ok = await confirm({
      title: `Delete "${a.name}"?`,
      message: "Income logged against it stays in your income list.",
      confirmLabel: "Delete account",
      tone: "danger",
    });
    if (!ok) return;
    await sendJSON(`/api/accounts/${a.id}`, "DELETE");
    await refreshAll();
  }

  async function deleteIncome(i: IncomeEntry) {
    const ok = await confirm({
      title: "Delete this income?",
      message: `${i.source} · ${formatCurrency(i.amount)} on ${formatDate(i.date)}`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    await sendJSON(`/api/income/${i.id}`, "DELETE");
    await refreshAll();
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-ink">Income & accounts</h1>
          <p className="text-base text-ink-muted">What came in {period}, and where your money sits.</p>
        </div>
        <DateRangeFilter />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Money in all accounts"
          value={total}
          icon={Wallet}
          tone="good"
          hint={`${accounts.length} account${accounts.length === 1 ? "" : "s"} · balances you entered`}
        />
        <StatCard
          label={`Income ${period}`}
          value={s?.income ?? 0}
          icon={TrendingUp}
          series={incomeSeries}
          hint={s ? `${s.incomeCount} payment${s.incomeCount === 1 ? "" : "s"} in` : undefined}
        />
        <StatCard
          label={`Left after spending ${period}`}
          value={s?.saved ?? 0}
          tone={!s || s.saved >= 0 ? "neutral" : "bad"}
          icon={PiggyBank}
          hint={s ? `${formatCurrency(s.spent)} spent` : undefined}
        />
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl text-ink">Accounts</h2>
          <button onClick={() => setEditingAccount("new")} className={btnSecondary}>
            <Plus size={16} strokeWidth={2.4} /> Add an account
          </button>
        </div>
        {accounts.length === 0 ? (
          <EmptyState>Add your bank accounts, wallets and cash to see everything you have in one place.</EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {accounts.map((a) => {
              const Icon = KIND_ICON[a.kind as keyof typeof KIND_ICON] ?? Landmark;
              const share = total > 0 ? Math.max(0, (a.balance / total) * 100) : 0;
              return (
                <div key={a.id} className="rounded-lg bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-sunken text-leaf">
                        <Icon size={20} strokeWidth={2.2} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink">{a.name}</p>
                        <p className="truncate text-caption text-ink-muted">
                          {[a.bank, ACCOUNT_KIND_LABELS[a.kind]].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0">
                      <button
                        onClick={() => setEditingAccount(a)}
                        aria-label={`Update ${a.name}`}
                        title="Update balance or details"
                        className="flex items-center justify-center rounded-pill text-ink hover:bg-sunken"
                      >
                        <Pencil size={16} strokeWidth={2.4} />
                      </button>
                      <button
                        onClick={() => deleteAccount(a)}
                        aria-label={`Delete ${a.name}`}
                        title="Delete"
                        className="flex items-center justify-center rounded-pill text-danger hover:bg-danger-soft"
                      >
                        <Trash2 size={16} strokeWidth={2.4} />
                      </button>
                    </div>
                  </div>
                  <p className={`mt-3 text-3xl font-bold ${a.balance < 0 ? "text-danger" : "text-ink"}`}>
                    {formatCurrency(a.balance)}
                  </p>
                  <div className="mt-2 h-2 rounded-pill bg-sunken" aria-hidden="true">
                    <div className="h-2 rounded-pill bg-leaf" style={{ width: `${share}%` }} />
                  </div>
                  <p className="mt-2 text-caption text-ink-muted">
                    {Math.round(share)}% of your total · updated {formatDate(a.balanceUpdatedAt)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl text-ink">Income {period}</h2>
          <button onClick={() => setEditingIncome("new")} className={btnPrimary}>
            <Plus size={16} strokeWidth={2.4} /> Add income
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[7fr_3fr]">
          {income.length === 0 ? (
            <EmptyState>No income logged {period}.</EmptyState>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-lg bg-card shadow-card xl:self-start">
              {income.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 sm:flex-nowrap">
                  <div className="w-24 shrink-0 text-caption text-ink-muted">{formatDate(i.date)}</div>
                  <div className="min-w-0 flex-1 basis-40">
                    <p className="font-bold text-ink">{i.source}</p>
                    <p className="truncate text-caption text-ink-muted">
                      {[i.account ? `Into ${i.account.name}` : null, i.note].filter(Boolean).join(" · ") || " "}
                    </p>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-1">
                    <span className="w-28 text-right text-lg font-bold text-leaf">+{formatCurrency(i.amount)}</span>
                    <button
                      onClick={() => setEditingIncome(i)}
                      aria-label={`Edit ${i.source}`}
                      title="Edit"
                      className="flex items-center justify-center rounded-pill text-ink hover:bg-sunken"
                    >
                      <Pencil size={16} strokeWidth={2.4} />
                    </button>
                    <button
                      onClick={() => deleteIncome(i)}
                      aria-label={`Delete ${i.source}`}
                      title="Delete"
                      className="flex items-center justify-center rounded-pill text-danger hover:bg-danger-soft"
                    >
                      <Trash2 size={16} strokeWidth={2.4} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="rounded-lg bg-card p-5 shadow-card xl:self-start">
            <h3 className="mb-3 font-heading text-lg text-ink">By source</h3>
            {sources.length === 0 ? (
              <p className="text-base text-ink-muted">Nothing yet.</p>
            ) : (
              <ul className="space-y-3">
                {sources.map((x) => (
                  <li key={x.source}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate font-bold text-ink">{x.source}</span>
                      <span className="shrink-0 font-bold text-leaf">{formatCurrency(x.total)}</span>
                    </div>
                    <div className="mt-1 h-3 rounded-sm bg-sunken">
                      <div className="h-3 rounded-sm bg-leaf" style={{ width: `${Math.max(2, (x.total / maxSource) * 100)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {editingAccount && (
        <AccountModal account={editingAccount === "new" ? undefined : editingAccount} onClose={() => setEditingAccount(null)} />
      )}
      {editingIncome && (
        <IncomeModal income={editingIncome === "new" ? undefined : editingIncome} onClose={() => setEditingIncome(null)} />
      )}
    </div>
  );
}
