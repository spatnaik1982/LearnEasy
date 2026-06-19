import Link from "next/link";

export interface ParentTabItem {
  href: string;
  label: string;
}

export interface ParentTabBarProps {
  tabs: ParentTabItem[];
  activeHref: string;
}

export function ParentTabBar({ tabs, activeHref }: ParentTabBarProps) {
  return (
    <div className="flex gap-1 py-2" role="tablist">
      {tabs.map((item) => {
        const isActive = activeHref === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            role="tab"
            aria-selected={isActive}
            className={`min-h-[56px] rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-soft-blue inline-flex items-center ${
              isActive
                ? "bg-soft-blue/10 text-soft-blue"
                : "text-on-surface-variant hover:bg-slate-100 hover:text-slate-text"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
