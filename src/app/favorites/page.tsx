"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  getCurrentUser,
  getFavorites,
  removeFavorite,
} from "@/lib/favorites";
import type { Favorite } from "@/types/plant";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadFavorites() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace("/login?next=%2Ffavorites");
          return;
        }
        const rows = await getFavorites();
        if (isActive) setFavorites(rows);
      } catch (caughtError: unknown) {
        console.error("Could not load favorites:", caughtError);
        if (isActive) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger vos favoris.",
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadFavorites();
    return () => {
      isActive = false;
    };
  }, [router]);

  async function handleRemove(favorite: Favorite) {
    setRemovingId(favorite.id);
    setError(null);
    try {
      await removeFavorite(favorite.id);
      setFavorites((current) =>
        current.filter((entry) => entry.id !== favorite.id),
      );
    } catch (caughtError: unknown) {
      console.error("Could not remove favorite:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de supprimer ce favori.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-emerald-800"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à l’identification
        </Link>
        <div className="mt-6 flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Heart size={23} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              Mes plantes favorites
            </h1>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Les plantes que vous souhaitez garder sous la main.
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
            Chargement de vos favoris…
          </p>
        ) : favorites.length === 0 ? (
          <section className="mt-10 rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center">
            <Heart
              size={28}
              className="mx-auto text-emerald-700"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold text-stone-900">
              Votre liste est encore vide
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
              Identifiez une plante et ajoutez-la à vos favoris pour la
              retrouver ici.
            </p>
            <Button asChild className="mt-5">
              <Link href="/">Identifier une plante</Link>
            </Button>
          </section>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <li
                key={favorite.id}
                className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_16px_50px_-36px_rgba(39,72,48,0.3)]"
              >
                {favorite.image_url && (
                  <Image
                    src={favorite.image_url}
                    alt={`Illustration de ${favorite.common_name}`}
                    width={1200}
                    height={600}
                    unoptimized
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-stone-900">
                    {favorite.common_name}
                  </h2>
                  <p className="mt-1 text-sm italic text-stone-500">
                    {favorite.scientific_name}
                  </p>
                  <p className="mt-3 text-xs font-medium text-emerald-800">
                    Famille · {favorite.family_name}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950"
                    >
                      Refaire l’identification
                      <ExternalLink size={14} aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleRemove(favorite)}
                      disabled={removingId === favorite.id}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-rose-200 px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      {removingId === favorite.id ? "Suppression…" : "Retirer"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
