"use client";

import Image from "next/image";
import { ArrowLeft, Droplets, ExternalLink, Heart, Tag } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { getPlacementLabel } from "@/lib/plant-care";
import { truncateText } from "@/lib/utils";

export default function FavoritesPage() {
  const { favorites, isReady, error, removeFavorite } = useFavorites();

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
              Ma wishlist
            </h1>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Les plantes que vous souhaitez garder sous la main.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-900">
          Cette liste est enregistrée uniquement dans ce navigateur. Elle ne
          sera pas synchronisée entre appareils avant le branchement de
          Supabase.
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            {error}
          </p>
        )}

        {!isReady ? (
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
              Votre wishlist est encore vide
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
          <ul className="mt-8 grid gap-5 md:grid-cols-2">
            {favorites.map((plant) => (
              <li
                key={plant.id}
                className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_16px_50px_-36px_rgba(39,72,48,0.3)]"
              >
                {plant.image && (
                  <Image
                    src={plant.image}
                    alt={`Illustration de ${plant.commonName}`}
                    width={1200}
                    height={600}
                    unoptimized
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-stone-900">
                    {plant.commonName}
                  </h2>
                  <p className="mt-1 text-sm italic text-stone-500">
                    {plant.scientificName}
                  </p>
                  <p className="mt-3 text-xs font-medium text-emerald-800">
                    Famille · {plant.family}
                  </p>
                  {plant.summary && (
                    <p className="mt-3 text-sm leading-6 text-stone-600">
                      {truncateText(plant.summary, 300)}
                    </p>
                  )}

                  <div className="mt-4 space-y-3 rounded-2xl bg-stone-50 p-4">
                    <div className="flex items-start gap-2.5 text-sm leading-5 text-stone-700">
                      <Droplets
                        size={17}
                        className="mt-0.5 shrink-0 text-sky-600"
                        aria-hidden="true"
                      />
                      <span>{plant.care.watering}</span>
                    </div>
                    <p className="text-sm text-stone-700">
                      {getPlacementLabel(plant.care.placement)}
                    </p>
                    <div className="flex items-center gap-2.5 text-sm text-stone-700">
                      <Tag
                        size={17}
                        className="shrink-0 text-emerald-700"
                        aria-hidden="true"
                      />
                      {plant.care.estimatedPrice
                        ? `${plant.care.estimatedPrice.min} à ${plant.care.estimatedPrice.max} € (estimation)`
                        : "Prix à vérifier chez un vendeur local"}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    {plant.wikipediaUrl ? (
                      <a
                        href={plant.wikipediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950"
                      >
                        Voir la fiche Wikipédia
                        <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-xs text-stone-400">
                        Ajoutée à la wishlist
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFavorite(plant.id)}
                      className="min-h-10 rounded-xl border border-rose-200 px-3.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                    >
                      Retirer
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
