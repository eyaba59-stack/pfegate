"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/presentation/auth/AuthContext";
import Icon from "@/presentation/components/ui/Icon";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Client-side route guard: redirects unauthenticated users to /login and shows
 * a branded splash while auth state resolves.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="flex h-16 w-16 animate-pulse-soft items-center justify-center rounded-full bg-primary-container shadow-sm">
          <Icon name="flight_takeoff" filled className="text-[32px] text-on-primary" />
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Vérification de session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
