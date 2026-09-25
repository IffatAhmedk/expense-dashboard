"use client";

import { useState } from "react";
import { Modal } from "./ui";
import { FormFooter } from "./form-footer";
import { refreshAll, sendJSON } from "@/lib/hooks";
import { ACCOUNT_KINDS, ACCOUNT_KIND_LABELS } from "@/lib/format";
import type { Account } from "@/lib/types";

/** Add an account, or edit one (including its balance) when `account` is given. */
export default function AccountModal({ account, onClose }: { account?: Account; onClose: () => void }) {
  const [name, setName] = useState(account?.name ?? "");
  const [bank, setBank] = useState(account?.bank ?? "");
  const [kind, setKind] = useState(account?.kind ?? "BANK");
  const [balance, setBalance] = useState(account ? String(account.balance) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { name, bank, kind };
      // Only send the balance when it changed, so "last updated" stays honest.
      if (!account || Number(balance) !== account.balance) body.balance = Number(balance || 0);
      if (account) await sendJSON(`/api/accounts/${account.id}`, "PATCH", body);
      else await sendJSON("/api/accounts", "POST", body);
      await refreshAll();
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <Modal title={account ? "Edit account" : "Add an account"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-5">
        <label className="block text-label font-bold text-ink-muted">
          Account name
          <input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Salary account"
            className="mt-1 w-full"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-label font-bold text-ink-muted">
            Bank <span className="font-normal">(optional)</span>
            <input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="e.g. Meezan" className="mt-1 w-full" />
          </label>
          <label className="block text-label font-bold text-ink-muted">
            Type
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="mt-1 w-full">
              {ACCOUNT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {ACCOUNT_KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-label font-bold text-ink-muted">
          Current balance (Rs)
          <input
            required
            type="number"
            inputMode="decimal"
            step="any"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="mt-1 w-full"
          />
          <span className="mt-1 block text-caption font-normal">What your bank app shows right now.</span>
        </label>
        <FormFooter error={error} saving={saving} label={account ? "Save" : "Add account"} onCancel={onClose} />
      </form>
    </Modal>
  );
}
