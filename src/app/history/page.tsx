"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, History, Leaf } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import {
  getCurrentUser,
  getIdentificationHistory,
} from "@/lib/favorites";
import type { IdentificationHistoryEntry } from "@/types/plant";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function historySourceLabel(source: IdentificationHistoryEntry["source"]) {
  switch (source) {
    case "plantnet":
      return "🤖 Identification IA";
    case "search":
      return "🔎 Recherche";
    case "manual":
      return "✍️ Ajout manuel";
  }
}

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<IdentificationHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadHistory() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace("/login?next=%2Fhistory");
          return;
        }
        const history = await getIdentificationHistory();
        if (isActive) setEntries(history);
      } catch (caughtError: unknown) {
        console.error("Could not load identification history:", caughtError);
        if (isActive) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger l’historique.",
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadHistory();
    return () => {
      isActive = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-emerald-800"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à l’identification
        </Link>
        <div className="mt-6 flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <History size={23} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              Historique des identifications
            </h1>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Vos plantes récemment reconnues par Flora.
            </p>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="mt-10 text-center text-sm text-stone-500">
            Chargement de l’historique…
          </p>
        ) : entries.length === 0 ? (
          <section className="mt-10 rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center">
            <Leaf
              size={30}
              className="mx-auto text-emerald-700"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold text-stone-900">
              Aucune identification enregistrée
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
              Les prochaines identifications réalisées pendant votre session
              apparaîtront ici.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Identifier une plante
            </Link>
          </section>
        ) : (
          <ol className="mt-8 space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-4 rounded-2xl border border-white bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                {entry.image_url ? (
                  <Image
                    src={entry.image_url}
                    alt={`Illustration de ${entry.common_name}`}
                    width={100}
                    height={100}
                    unoptimized
                    className="size-20 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Leaf size={28} aria-hidden="true" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-stone-900">
                    {entry.common_name}
                  </h2>
                  <p className="mt-0.5 truncate text-sm italic text-stone-500">
                    {entry.scientific_name}
                  </p>
                  <p className="mt-2 inline-flex rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                    {historySourceLabel(entry.source)}
                  </p>
                  {entry.family_name && (
                    <p className="mt-1 text-xs text-stone-500">
                      Famille · {entry.family_name}
                    </p>
                  )}
                </div>
                <div className="text-sm sm:text-right">
                  {entry.score !== null && (
                    <p className="font-semibold text-emerald-800">
                      {Math.round(entry.score * 100)} % de confiance
                    </p>
                  )}
                  <time
                    dateTime={entry.created_at}
                    className="mt-1 block text-xs text-stone-500"
                  >
                    {formatDate(entry.created_at)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
