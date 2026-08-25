"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/presentation/components/ui/Icon";
import { useAuth } from "@/presentation/auth/AuthContext";

interface TopbarProps {
  title: string;
  showSearch?: boolean;
  breadcrumb?: string;
  onMenuToggle?: () => void;
}

export default function Topbar({ title, showSearch = true, breadcrumb, onMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState<"FR" | "EN">("FR");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = (user?.fullName ?? "AD")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-gutter">
      <div className="flex min-w-0 items-center gap-4">
        <button className="text-primary md:hidden" onClick={onMenuToggle} aria-label="Ouvrir le menu">
          <Icon name="menu" />
        </button>
        <div className="min-w-0">
          {breadcrumb ? (
            <nav className="hidden truncate text-body-sm text-on-surface-variant md:block">
              <span>Operations</span>
              <span className="mx-2">/</span>
              <span className="font-medium text-primary">{breadcrumb}</span>
            </nav>
          ) : (
            <h2 className="hidden truncate font-headline-md text-headline-md font-bold text-primary md:block">
              {title}
            </h2>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {showSearch && (
          <div className="relative hidden w-52 lg:block">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full rounded border border-outline-variant bg-surface-container-low py-1.5 pl-9 pr-3 text-body-sm transition-all focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
          </div>
        )}

        <nav className="flex items-center gap-4">
          {(["FR", "EN"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={[
                "font-label-caps text-label-caps transition-all",
                lang === l ? "font-bold text-secondary" : "text-on-surface-variant hover:text-secondary",
              ].join(" ")}
            >
              {l}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
          <div className="hidden items-center gap-2 sm:flex">
            <button
              className="motion-hover rounded-full p-2 text-primary hover:bg-surface-variant/50 hover:text-secondary"
              title="Notifications"
            >
              <Icon name="notifications" />
            </button>
            <button
              className="motion-hover rounded-full p-2 text-primary hover:bg-surface-variant/50 hover:text-secondary"
              title="Planning"
            >
              <Icon name="schedule" />
            </button>
          </div>

          {/* User menu */}
          <div ref={menuRef} className="relative ml-1">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="motion-hover flex items-center gap-2 rounded-full border border-outline-variant bg-tertiary-fixed-dim py-0.5 pl-0.5 pr-2 transition-all hover:shadow-sm"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container text-label-caps font-bold text-on-primary">
                {initials}
              </span>
              <span className="hidden max-w-[120px] truncate font-body-sm text-body-sm text-on-surface sm:block">
                {user?.fullName ?? "Admin"}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 w-52 origin-top-right rounded-lg border border-outline-variant bg-surface-container-lowest p-1.5 shadow-elevated">
                <div className="border-b border-surface-container px-3 py-2">
                  <p className="truncate font-body-md text-body-md font-medium text-on-surface">
                    {user?.fullName}
                  </p>
                  <p className="truncate font-body-sm text-body-sm text-on-surface-variant">{user?.email}</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="motion-hover flex items-center gap-2 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface hover:bg-surface-container-high"
                >
                  <Icon name="person" className="text-[18px]" />
                  Mon profil
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="motion-hover flex w-full items-center gap-2 rounded-lg px-3 py-2 font-body-md text-body-md text-error hover:bg-error-container/30"
                >
                  <Icon name="logout" className="text-[18px]" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
