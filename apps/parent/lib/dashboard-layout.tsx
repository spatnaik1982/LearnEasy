import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect, type ReactNode } from "react";
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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">LearnEasy Parent</h1>
            {selectedChildData && (
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
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
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex gap-1 py-2" role="tablist">
            {NAV_ITEMS.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={`${item.href}?child=${selectedChild}`}
                  role="tab"
                  aria-selected={isActive}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="mb-6 text-2xl font-bold text-slate-800">{title}</h2>
        {children}
      </main>
    </div>
  );
}