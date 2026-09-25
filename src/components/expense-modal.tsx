"use client";

import { useState } from "react";
import { Modal } from "./ui";
import { FormFooter } from "./form-footer";
import TagPicker from "./tag-picker";
import { refreshAll, sendJSON } from "@/lib/hooks";
import { toDateInput } from "@/lib/format";
import type { Expense } from "@/lib/types";

/** Add a new expense, or edit one when `expense` is given. */
export default function ExpenseModal({ expense, onClose }: { expense?: Expense; onClose: () => void }) {
  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [date, setDate] = useState(toDateInput(expense?.date));
  const [note, setNote] = useState(expense?.note ?? "");
  const [tagIds, setTagIds] = useState<string[]>(expense?.tags.map((t) => t.id) ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = { description, amount, date, note, tagIds };
      if (expense) await sendJSON(`/api/expenses/${expense.id}`, "PATCH", body);
      else await sendJSON("/api/expenses", "POST", body);
      await refreshAll();
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <Modal title={expense ? "Edit expense" : "Add an expense"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-5">
        <label className="block text-label font-bold text-ink-muted">
          What was it?
          <input
            required
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Groceries at Imtiaz"
            className="mt-1 w-full"
          />
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
        <TagPicker value={tagIds} onChange={setTagIds} />
        <label className="block text-label font-bold text-ink-muted">
          Note <span className="font-normal">(optional)</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="mt-1 w-full py-2" />
        </label>
        <FormFooter error={error} saving={saving} label={expense ? "Save" : "Add expense"} onCancel={onClose} />
      </form>
    </Modal>
  );
}
