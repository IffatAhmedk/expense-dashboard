"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useTags } from "@/lib/hooks";

/** Toggle existing tags on and off. New tags are made on the Tags page. */
export default function TagPicker({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const { tags, isLoading } = useTags();

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((t) => t !== id) : [...value, id]);
  }

  return (
    <fieldset>
      <legend className="text-label font-bold text-ink-muted">Tags</legend>
      {!isLoading && tags.length === 0 ? (
        <p className="mt-1 text-base text-ink-muted">
          No tags yet.{" "}
          <Link href="/tags" className="font-bold text-brand underline">
            Make some on the Tags page
          </Link>
          .
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((t) => {
            const on = value.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                aria-pressed={on}
                className="inline-flex items-center gap-1.5 rounded-pill border-2 px-4 text-label font-bold"
                style={{
                  color: `var(--tag-${t.color})`,
                  background: on ? `var(--tag-${t.color}-soft)` : "transparent",
                  borderColor: on ? `var(--tag-${t.color})` : "var(--line)",
                }}
              >
                {on ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span className="h-2 w-2 rounded-pill" style={{ background: `var(--tag-${t.color})` }} aria-hidden="true" />
                )}
                {t.name}
              </button>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
