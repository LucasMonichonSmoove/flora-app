import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flora — Reconnaissance de plantes",
  description:
    "Identifiez une plante à partir d’une photo et découvrez son nom, sa famille et son score de confiance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
