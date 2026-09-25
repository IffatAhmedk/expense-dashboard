"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Receipt, Tags, Landmark, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { DateRangeProvider } from "./range-context";
import { DialogProvider } from "@/components/dialogs";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/income", label: "Income & accounts", icon: Landmark },
  { href: "/tags", label: "Tags", icon: Tags },
];

const STORAGE_KEY = "hisaab-sidebar-collapsed";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {}
  }, []);

  function toggle() {
    setCollapsed((c) => {
      try {
        localStorage.setItem(STORAGE_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  const linkClass = (active: boolean) =>
    `flex min-h-10 shrink-0 items-center gap-3 rounded-pill px-4 text-label font-bold ${
      collapsed ? "lg:justify-center lg:px-0" : ""
    } ${active ? "bg-ink text-on-ink" : "text-ink hover:bg-sunken"}`;

  return (
    <DialogProvider>
      <DateRangeProvider>
        <div className="min-h-screen bg-ground lg:flex">
          <aside
            className={`border-b border-line bg-card lg:sticky lg:top-0 lg:flex lg:h-screen lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r ${
              collapsed ? "lg:w-20" : "lg:w-64"
            }`}
          >
            <div className={`flex items-start justify-between gap-2 px-4 py-4 ${collapsed ? "lg:justify-center lg:px-2" : ""}`}>
              <div className={collapsed ? "lg:hidden" : ""}>
                <p className="font-wordmark text-xl text-leaf">Hisaab</p>
                <p className="font-urdu text-xl text-ink">میرا حساب</p>
              </div>
              <button
                onClick={toggle}
                aria-label={collapsed ? "Open the menu" : "Collapse the menu"}
                title={collapsed ? "Open the menu" : "Collapse the menu"}
                className="hidden items-center justify-center rounded-pill text-ink hover:bg-sunken lg:flex"
              >
                {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              </button>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-5">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = href === "/" ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    title={label}
                    aria-label={label}
                    aria-current={active ? "page" : undefined}
                    className={linkClass(active)}
                  >
                    <Icon size={20} strokeWidth={2.2} />
                    <span className={collapsed ? "lg:hidden" : ""}>{label}</span>
                  </Link>
                );
              })}
              <button onClick={signOut} title="Sign out" aria-label="Sign out" className={`${linkClass(false)} lg:mt-auto`}>
                <LogOut size={20} strokeWidth={2.2} />
                <span className={collapsed ? "lg:hidden" : ""}>Sign out</span>
              </button>
            </nav>
          </aside>
          <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </DateRangeProvider>
    </DialogProvider>
  );
}
