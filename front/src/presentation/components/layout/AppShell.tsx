"use client";

import { useState, type ReactNode } from "react";
import AuthGuard from "@/presentation/auth/AuthGuard";
import Sidebar from "@/presentation/components/layout/Sidebar";
import Topbar from "@/presentation/components/layout/Topbar";

interface AppShellProps {
  title: string;
  breadcrumb?: string;
  showSearch?: boolean;
  children: ReactNode;
}

/**
 * Shared authenticated layout: fixed sidebar (desktop) / slide-in drawer (mobile)
 * + sticky topbar + scrollable canvas. Wrapped in AuthGuard.
 */
export default function AppShell({ title, breadcrumb, showSearch, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        <div className="flex flex-1 flex-col overflow-hidden md:ml-[260px]">
          <Topbar
            title={title}
            breadcrumb={breadcrumb}
            showSearch={showSearch}
            onMenuToggle={() => setMobileOpen((o) => !o)}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-container-margin">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
