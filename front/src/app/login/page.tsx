"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/presentation/components/ui/Icon";
import Reveal from "@/presentation/components/ui/Reveal";
import { useAuth } from "@/presentation/auth/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const ok = await login(username.trim(), password);
      if (ok) {
        router.push("/dashboard");
      } else {
        setError("Identifiants incorrects. Utilisez admin / admin.");
      }
    } catch {
      setError("Impossible de joindre le serveur. Vérifiez que le backend est démarré.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[#0b1c30]">
        <div
          className="animate-ken-burns h-full w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(11,28,48,0.85), rgba(19,27,46,0.72)), url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* Glass card */}
      <main className="relative z-10 w-full max-w-md px-4 sm:px-container-margin">
        <Reveal animation="zoom-in" delay={100} className="w-full">
          <div className="flex flex-col gap-[32px] rounded-xl border border-surface-container-highest/50 bg-surface-container-lowest/80 p-6 shadow-elevated backdrop-blur-xl sm:p-[32px]">
            <Reveal animation="fade-up" delay={220} className="w-full">
              <div className="flex flex-col items-center gap-[12px] text-center">
                <div className="motion-hover flex h-16 w-16 items-center justify-center rounded-full bg-primary-container shadow-sm">
                  <Icon name="flight_takeoff" filled className="text-[32px] text-on-primary" />
                </div>
                <div>
                  <h1 className="font-headline-md text-headline-md text-primary">Monastir Airport</h1>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    Operations Intelligence
                  </p>
                </div>
              </div>
            </Reveal>

            <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[16px]">
                <Reveal animation="fade-up" delay={320}>
                  <div>
                    <label
                      htmlFor="username"
                      className="mb-[8px] block font-label-caps text-label-caps uppercase text-on-surface"
                    >
                      Nom d'utilisateur
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                        person
                      </span>
                      <input
                        id="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full rounded bg-surface py-[10px] pl-10 pr-3 font-body-md text-body-md text-on-surface placeholder:text-outline transition-all focus:border-secondary focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>
                </Reveal>

                <Reveal animation="fade-up" delay={400}>
                  <div>
                    <div className="mb-[8px] flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block font-label-caps text-label-caps uppercase text-on-surface"
                      >
                        Mot de passe
                      </label>
                      <a
                        className="font-body-sm text-body-sm text-secondary transition-colors hover:text-primary"
                        href="#"
                      >
                        Mot de passe oublié ?
                      </a>
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                        lock
                      </span>
                      <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded bg-surface py-[10px] pl-10 pr-3 font-body-md text-body-md text-on-surface placeholder:text-outline transition-all focus:border-secondary focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>
                </Reveal>

                {error && (
                  <Reveal animation="fade-up" delay={0}>
                    <div className="flex items-center gap-2 rounded bg-error-container/60 px-3 py-2 font-body-sm text-body-sm text-on-error-container">
                      <Icon name="error" className="text-[18px]" />
                      {error}
                    </div>
                  </Reveal>
                )}
              </div>

              <Reveal animation="fade-up" delay={480}>
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-outline-variant bg-surface text-secondary focus:ring-secondary"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block font-body-sm text-body-sm text-on-surface-variant"
                  >
                    Se souvenir de moi
                  </label>
                </div>
              </Reveal>

              <Reveal animation="fade-up" delay={560} className="w-full">
                <button
                  type="submit"
                  disabled={submitting}
                  className="motion-hover flex w-full items-center justify-center gap-2 rounded bg-primary-container px-4 py-[12px] font-headline-sm text-headline-sm text-on-primary transition-all duration-200 hover:bg-tertiary-container hover:shadow-md disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </Reveal>
            </form>

            <Reveal animation="fade-in" delay={680} className="w-full">
              <div className="mt-[-8px] text-center font-body-sm text-body-sm text-on-surface-variant">
                <p>Accès restreint au personnel autorisé.</p>
                <p className="mt-1 rounded bg-surface-container-low px-2 py-1 text-on-surface-variant">
                  Démo : utilisateur <span className="font-mono">admin</span> · mot de passe{" "}
                  <span className="font-mono">admin</span>
                </p>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
