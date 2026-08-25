import type { Metadata } from "next";
import "@/app/globals.css";
import { AuthProvider } from "@/presentation/auth/AuthContext";

export const metadata: Metadata = {
  title: "Monastir Airport · Operations Intelligence",
  description:
    "Tableau de bord d'intelligence opérationnelle pour l'Aéroport International de Monastir (MIR).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="light">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
