"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { btnPrimary } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Could not sign in");
      return;
    }
    // Only follow local paths.
    router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg bg-card p-6 shadow-card">
      <div>
        <p className="font-wordmark text-2xl text-leaf">Hisaab</p>
        <p className="font-urdu text-xl text-ink">میرا حساب</p>
      </div>
      <label className="block text-label font-bold text-ink-muted">
        Password
        <input
          type="password"
          autoFocus
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full"
        />
      </label>
      {error && <p className="text-base text-danger">{error}</p>}
      <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ground p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
