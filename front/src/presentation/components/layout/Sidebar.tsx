"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/presentation/components/ui/Icon";
import { useAuth } from "@/presentation/auth/AuthContext";

interface NavItem {
  label: string;
  icon: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", icon: "dashboard", href: "/dashboard" },
  { label: "Suivi des vols", icon: "flight_takeoff", href: "/flights" },
  { label: "Compagnies", icon: "corporate_fare", href: "/airlines" },
  { label: "Destinations", icon: "map", href: "/destinations" },
  { label: "Analyse des retards", icon: "timer_off", href: "/analytics" },
  { label: "Paramètres", icon: "settings", href: "/settings" },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/login");
  };

  return (
    <nav
      className={[
        "fixed inset-y-0 left-0 z-40 flex h-screen w-[280px] flex-col bg-primary-container py-6 shadow-md transition-transform duration-300 md:w-[260px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      ].join(" ")}
    >
      <Link
        href="/dashboard"
        onClick={onClose}
        className="motion-hover mb-8 flex items-center gap-3 px-6"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container">
          <Icon name="flight" className="text-on-secondary-container" />
        </div>
        <div>
          <h1 className="font-headline-sm text-headline-sm text-on-primary">Operations Intelligence</h1>
          <p className="font-label-caps text-label-caps text-on-primary-container">Monastir Airport</p>
        </div>
      </Link>

      <ul className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={[
                  "motion-hover flex items-center gap-3 rounded-lg px-4 py-3",
                  isActive
                    ? "scale-[0.99] border-l-4 border-secondary bg-secondary-container text-on-secondary-container"
                    : "text-on-tertiary-container hover:bg-on-primary/10",
                ].join(" ")}
              >
                <Icon name={item.icon} filled={isActive} />
                <span className={`font-body-md text-body-md ${isActive ? "font-bold" : ""}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-on-primary/10 px-2 pt-2">
        <button
          type="button"
          onClick={handleLogout}
          className="motion-hover flex w-full items-center gap-3 rounded-lg px-4 py-3 text-on-tertiary-container transition-colors hover:bg-error-container/20 hover:text-error"
        >
          <Icon name="logout" />
          <span className="font-body-md text-body-md">Déconnexion</span>
        </button>
      </div>
    </nav>
  );
}
