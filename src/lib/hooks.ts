"use client";

import useSWR, { mutate } from "swr";
import { fetcher } from "./fetcher";
import type { Account, TagWithUsage } from "./types";

export function useTags() {
  const { data, isLoading } = useSWR<TagWithUsage[]>("/api/tags", fetcher);
  return { tags: data ?? [], isLoading };
}

export function useAccounts() {
  const { data, isLoading } = useSWR<Account[]>("/api/accounts", fetcher);
  return { accounts: data ?? [], isLoading };
}

/** Refreshes every cached list and summary after a write. */
export function refreshAll() {
  return mutate((key) => typeof key === "string" && key.startsWith("/api/"));
}

/** fetch() with a JSON body; throws the API's error message when the call fails. */
export async function sendJSON(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Something went wrong. Try again.");
  }
  return res.json();
}
