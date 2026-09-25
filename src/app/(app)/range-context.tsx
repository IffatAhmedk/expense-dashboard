"use client";

import { createContext, useContext, useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { rangeForPreset, RangePreset } from "@/lib/date-range";
import { toDateInput } from "@/lib/format";
import type { Summary } from "@/lib/types";

interface RangeState {
  preset: RangePreset;
  customFrom: string;
  customTo: string;
  setPreset: (p: RangePreset) => void;
  setCustom: (from: string, to: string) => void;
  fromISO: string;
  toISO: string;
  /** "?from=…&to=…" ready to append to an API path. */
  query: string;
}

const RangeContext = createContext<RangeState | null>(null);

export const PERIOD_WORDS: Record<RangePreset, string> = {
  week: "this week",
  month: "this month",
  lastMonth: "last month",
  year: "this year",
  custom: "in this period",
};

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const [preset, setPreset] = useState<RangePreset>("month");
  const [customFrom, setCustomFrom] = useState(toDateInput());
  const [customTo, setCustomTo] = useState(toDateInput());

  const value = useMemo(() => {
    const range = rangeForPreset(preset, { from: customFrom, to: customTo });
    const fromISO = range.from.toISOString();
    const toISO = range.to.toISOString();
    return {
      preset,
      customFrom,
      customTo,
      setPreset,
      setCustom: (f: string, t: string) => {
        setCustomFrom(f);
        setCustomTo(t);
      },
      fromISO,
      toISO,
      query: `?from=${fromISO}&to=${toISO}`,
    };
  }, [preset, customFrom, customTo]);

  return <RangeContext.Provider value={value}>{children}</RangeContext.Provider>;
}

export function useDateRange() {
  const ctx = useContext(RangeContext);
  if (!ctx) throw new Error("useDateRange must be used inside DateRangeProvider");
  return ctx;
}

export function useSummary() {
  const range = useDateRange();
  const { data } = useSWR<Summary>(`/api/summary${range.query}&tz=${new Date().getTimezoneOffset()}`, fetcher);
  return { summary: data, ...range };
}
