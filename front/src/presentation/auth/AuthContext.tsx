"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { UserProfile } from "@/core/domain/entities/UserProfile";
import {
  apiFetch,
  ApiError,
  clearSession,
  getStoredSession,
  setClientToken,
  storeSession,
} from "@/config/api";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      const session = getStoredSession();
      if (!session?.token) {
        clearSession();
        if (active) setLoading(false);
        return;
      }

      // Fast path: restore the cached profile immediately.
      if (session.user) setUser(session.user as UserProfile);

      try {
        // Validate the token against the backend.
        const profile = await apiFetch<UserProfile>("/api/auth/me");
        if (!active) return;
        setClientToken(session.token);
        setUser(profile);
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          clearSession();
          setUser(null);
        }
        // Network issues: keep the cached session so the UI stays usable.
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await apiFetch<{ token: string; user: UserProfile }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setClientToken(res.token);
      storeSession(res.token, res.user);
      setUser(res.user);
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return false;
      throw err; // network / server error — surfaced to the login form
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, isAuthenticated: user !== null, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
