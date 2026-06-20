import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { JSX } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

function Breadcrumb({ items }: BreadcrumbProps): JSX.Element {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className="h-3 w-3 text-on-surface-variant"
                  aria-hidden="true"
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-on-surface-variant hover:text-slate-text"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-on-surface-variant"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Breadcrumb };
export type { BreadcrumbProps, BreadcrumbItem };
