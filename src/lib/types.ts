import type { TagRef } from "./tags";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  note: string | null;
  tags: TagRef[];
}

export interface TagWithUsage extends TagRef {
  count: number;
  total: number;
  lastUsed: string | null;
}

export interface Account {
  id: string;
  name: string;
  bank: string | null;
  kind: string;
  balance: number;
  balanceUpdatedAt: string;
}

export interface IncomeEntry {
  id: string;
  source: string;
  amount: number;
  date: string;
  note: string | null;
  accountId: string | null;
  account: { id: string; name: string } | null;
}

export interface Summary {
  spent: number;
  income: number;
  saved: number;
  expenseCount: number;
  incomeCount: number;
  daily: { date: string; spent: number; income: number }[];
  byTag: (TagRef & { total: number; count: number })[];
  untagged: { total: number; count: number };
  bySource: { source: string; total: number }[];
  totalBalance: number;
  accountCount: number;
}
