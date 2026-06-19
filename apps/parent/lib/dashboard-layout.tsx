import { useRouter } from "next/router";
import { useState, useEffect, type ReactNode } from "react";
import { AppShell, ParentTabBar } from "@learn-easy/ui";
import { getChildren } from "../lib/api";
import { type Child } from "../lib/mockData";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/progress", label: "Progress" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/insights", label: "Insights" },
];

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter();
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");

  useEffect(() => {
    getChildren("parent-1").then((res) => {
      if (res.data) {
        setChildrenList(res.data);
        const stored = localStorage.getItem("selected-child");
        if (stored && res.data.some((c) => c.id === stored)) {
          setSelectedChild(stored);
        } else {
          setSelectedChild(res.data[0].id);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (selectedChild) {
      localStorage.setItem("selected-child", selectedChild);
    }
  }, [selectedChild]);

  const selectedChildData = childrenList.find((c) => c.id === selectedChild);

  return (
    <div className="min-h-screen bg-warm-off-white">
      <header className="border-b border-outline-variant bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-text">LearnEasy Parent</h1>
            {selectedChildData && (
              <span className="rounded-full bg-soft-blue/10 px-3 py-1 text-sm font-medium text-soft-blue">
                {selectedChildData.name}, Age {selectedChildData.age} &middot; {selectedChildData.level}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="child-select" className="sr-only">Select child</label>
            <select
              id="child-select"
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="min-h-[56px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-text focus:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue"
            >
              {childrenList.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <AppShell
        variant="parent"
        primaryNav={
          <ParentTabBar
            tabs={NAV_ITEMS}
            activeHref={router.pathname}
          />
        }
      >
        <h2 className="mb-6 text-2xl font-bold text-slate-text">{title}</h2>
        {children}
      </AppShell>
    </div>
  );
}