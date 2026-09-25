"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Modal, TagChip } from "./ui";
import { FormFooter } from "./form-footer";
import { refreshAll, sendJSON } from "@/lib/hooks";
import { TAG_COLORS, TAG_COLOR_LABELS, type TagColor, type TagRef } from "@/lib/tags";

/** Make a new tag, or rename / recolour one when `tag` is given. */
export default function TagModal({ tag, onClose }: { tag?: TagRef; onClose: () => void }) {
  const [name, setName] = useState(tag?.name ?? "");
  const [color, setColor] = useState<string>(tag?.color ?? TAG_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (tag) await sendJSON(`/api/tags/${tag.id}`, "PATCH", { name, color });
      else await sendJSON("/api/tags", "POST", { name, color });
      await refreshAll();
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <Modal title={tag ? "Edit tag" : "New tag"} onClose={onClose} width="max-w-md">
      <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-5">
        <label className="block text-label font-bold text-ink-muted">
          Name
          <input
            required
            autoFocus
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Groceries"
            className="mt-1 w-full"
          />
        </label>
        <fieldset>
          <legend className="text-label font-bold text-ink-muted">Colour</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TAG_COLORS.map((c: TagColor) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-pressed={color === c}
                aria-label={TAG_COLOR_LABELS[c]}
                title={TAG_COLOR_LABELS[c]}
                className="flex h-10 w-10 items-center justify-center rounded-pill border-2"
                style={{ background: `var(--tag-${c}-soft)`, borderColor: color === c ? `var(--tag-${c})` : "transparent" }}
              >
                {color === c ? (
                  <Check size={18} strokeWidth={3} style={{ color: `var(--tag-${c})` }} />
                ) : (
                  <span className="h-4 w-4 rounded-pill" style={{ background: `var(--tag-${c})` }} />
                )}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <p className="text-label font-bold text-ink-muted">Preview</p>
          <div className="mt-2">
            <TagChip name={name.trim() || "Tag name"} color={color} />
          </div>
        </div>
        <FormFooter error={error} saving={saving} label={tag ? "Save" : "Create tag"} onCancel={onClose} />
      </form>
    </Modal>
  );
}
