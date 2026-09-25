import type { ReactNode } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { X, type LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export const btnPrimary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-pill bg-brand px-6 text-label font-bold text-on-brand hover:opacity-90 disabled:opacity-50";
export const btnSecondary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-pill border border-control bg-card px-6 text-label font-bold text-ink hover:bg-sunken";
export const btnQuiet =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-pill px-4 text-label font-bold text-brand hover:bg-brand-soft";
export const fieldClass =
  "w-full rounded-sm border border-control bg-card px-4 text-base text-ink";

type Tone = "neutral" | "good" | "bad" | "warn" | "info" | "brand";

const TONE_BADGE: Record<Tone, string> = {
  neutral: "bg-stone-soft text-stone",
  info: "bg-stone-soft text-stone",
  good: "bg-leaf-soft text-leaf",
  bad: "bg-danger-soft text-danger",
  warn: "bg-warn-soft text-warn",
  brand: "bg-brand-soft text-brand-deep",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-pill px-4 py-1 text-caption font-bold ${TONE_BADGE[tone]}`}>
      {children}
    </span>
  );
}

const TONE_CARD: Record<Tone, string> = {
  neutral: "bg-card",
  info: "bg-card",
  brand: "bg-card",
  warn: "bg-warn-soft",
  good: "bg-leaf-soft",
  bad: "bg-danger-soft",
};
const TONE_VALUE: Record<Tone, string> = {
  neutral: "text-ink",
  info: "text-ink",
  brand: "text-ink",
  warn: "text-warn",
  good: "text-leaf",
  bad: "text-danger",
};

const TONE_COLOR: Record<Tone, string> = {
  neutral: "var(--stone)",
  info: "var(--stone)",
  brand: "var(--brand)",
  warn: "var(--warn)",
  good: "var(--leaf)",
  bad: "var(--danger)",
};

/** One money answer: a label, a big number, a plain-words hint and (optionally) a trend line. */
export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  size = "kpi",
  format = "money",
  icon: Icon,
  series,
  onClick,
}: {
  label: string;
  value: number;
  hint?: ReactNode;
  tone?: Tone;
  size?: "kpi" | "small";
  format?: "money" | "count" | "percent";
  icon?: LucideIcon;
  series?: { date: string; value: number }[];
  onClick?: () => void;
}) {
  const compact = size === "small";
  const color = TONE_COLOR[tone];
  const gradientId = `spark-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  return (
    <div
      className={`overflow-hidden rounded-lg shadow-card ${TONE_CARD[tone]} ${onClick ? "cursor-pointer transition hover:ring-2 hover:ring-brand" : ""}`}
      {...(onClick
        ? {
            role: "button",
            tabIndex: 0,
            onClick,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            },
          }
        : {})}
    >
      <div className={compact ? "p-4" : "p-5 pb-2"}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-label font-bold text-ink-muted">{label}</p>
          {Icon && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-sunken" style={{ color }}>
              <Icon size={18} strokeWidth={2.2} />
            </span>
          )}
        </div>
        <p className={`mt-1 font-bold ${compact ? "text-xl" : "text-5xl"} ${TONE_VALUE[tone]}`}>
          {format === "count"
            ? value.toLocaleString("en-PK")
            : format === "percent"
              ? `${Math.round(value)}%`.replace("-", "−")
              : formatCurrency(value)}
        </p>
        {hint && <p className="mt-1 flex items-center gap-1 text-caption text-ink-muted">{hint}</p>}
      </div>
      {series && series.length > 1 && (
        <div className="h-14 w-full" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.35 }} />
                  <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** A tag as a coloured pill. */
export function TagChip({ name, color, size = "md" }: { name: string; color: string; size?: "sm" | "md" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill font-bold ${size === "sm" ? "px-3 py-0.5 text-caption" : "px-4 py-1 text-label"}`}
      style={{ color: `var(--tag-${color})`, background: `var(--tag-${color}-soft)` }}
    >
      <span className="h-2 w-2 shrink-0 rounded-pill" style={{ background: `var(--tag-${color})` }} aria-hidden="true" />
      {name}
    </span>
  );
}

/** The shared modal shell: dimmed backdrop, card, title bar with Close. */
export function Modal({
  title,
  onClose,
  children,
  width = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className={`relative flex max-h-[90vh] w-full ${width} flex-col overflow-hidden rounded-lg bg-card shadow-xl`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-heading text-2xl text-ink">{title}</h2>
          <button onClick={onClose} className="flex items-center gap-1 rounded-pill px-4 text-label font-bold text-ink hover:bg-sunken">
            <X size={18} strokeWidth={2.4} /> Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-lg bg-card p-8 text-center text-base text-ink-muted shadow-card">{children}</div>;
}
