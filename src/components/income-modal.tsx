"use client";

import { useState } from "react";
import { Modal } from "./ui";
import { FormFooter } from "./form-footer";
import { refreshAll, sendJSON, useAccounts } from "@/lib/hooks";
import { toDateInput } from "@/lib/format";
import type { IncomeEntry } from "@/lib/types";

/** Log money that came in, or edit an entry when `income` is given. */
export default function IncomeModal({ income, onClose }: { income?: IncomeEntry; onClose: () => void }) {
  const { accounts } = useAccounts();
  const [source, setSource] = useState(income?.source ?? "");
  const [amount, setAmount] = useState(income ? String(income.amount) : "");
  const [date, setDate] = useState(toDateInput(income?.date));
  const [accountId, setAccountId] = useState(income?.accountId ?? "");
  const [note, setNote] = useState(income?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = { source, amount, date, accountId, note };
      if (income) await sendJSON(`/api/income/${income.id}`, "PATCH", body);
      else await sendJSON("/api/income", "POST", body);
      await refreshAll();
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <Modal title={income ? "Edit income" : "Add income"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-5">
        <label className="block text-label font-bold text-ink-muted">
          Where did it come from?
          <input
            required
            autoFocus
            list="income-sources"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. Salary, Freelance, Rent"
            className="mt-1 w-full"
          />
          <datalist id="income-sources">
            <option value="Salary" />
            <option value="Freelance" />
            <option value="Rent" />
            <option value="Business" />
            <option value="Profit / interest" />
            <option value="Gift" />
          </datalist>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-label font-bold text-ink-muted">
            Amount (Rs)
            <input
              required
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full"
            />
          </label>
          <label className="block text-label font-bold text-ink-muted">
            Date
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full" />
          </label>
        </div>
        <label className="block text-label font-bold text-ink-muted">
          Went into
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="mt-1 w-full">
            <option value="">No particular account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
                {a.bank ? ` · ${a.bank}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-label font-bold text-ink-muted">
          Note <span className="font-normal">(optional)</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="mt-1 w-full py-2" />
        </label>
        <FormFooter error={error} saving={saving} label={income ? "Save" : "Add income"} onCancel={onClose} />
      </form>
    </Modal>
  );
}
