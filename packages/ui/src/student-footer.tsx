import Link from "next/link";
import { useRouter } from "next/router";
import { Home, Heart, Settings, UserCircle } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StudentFooterProps {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StudentFooter(_props: StudentFooterProps) {
  const router = useRouter();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/calm-zone", label: "Calm Zone", icon: Heart },
    { href: "/profile", label: "Profile", icon: UserCircle },
    { href: "/settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <footer className="border-t border-outline-variant bg-white px-4 py-3">
      <nav className="flex items-center justify-center gap-4">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center min-h-[56px] min-w-[56px] rounded-lg ${
                isActive
                  ? "bg-soft-blue/10 text-soft-blue"
                  : "text-on-surface-variant"
              }`}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
