"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  BookOpenText,
  Heart,
  Sprout,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CollectionPlantForm from "@/components/CollectionPlantForm";
import PlantCareCard from "@/components/PlantCareCard";
import {
  addFavorite,
  getCurrentUser,
  getFavoriteId,
  removeFavoriteByScientificName,
} from "@/lib/favorites";
import { getCareGuide } from "@/lib/plant-care";
import { truncateText } from "@/lib/utils";
import type {
  PlantCollectionInput,
  PlantIdentificationResponse,
} from "@/types/plant";

interface ResultCardProps {
  result: PlantIdentificationResponse;
}

export default function ResultCard({ result }: ResultCardProps) {
  const router = useRouter();
  const bestResult = result.plantnet.results[0];
  const species = bestResult?.species;
  const scientificName = species?.scientificName ?? "";
  const scientificNameWithoutAuthor =
    species?.scientificNameWithoutAuthor ?? scientificName;
  const commonName = species?.commonNames[0] ?? scientificName;
  const family = species?.family.scientificName ?? "";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadFavoriteState() {
      try {
        const user = await getCurrentUser();
        if (!isActive) return;
        setIsAuthenticated(Boolean(user));
        if (user) {
          const id = await getFavoriteId(scientificNameWithoutAuthor);
          if (isActive) setFavoriteId(id);
        } else {
          setFavoriteId(null);
        }
      } catch (error: unknown) {
        console.error("Could not load plant favorite state:", error);
        if (isActive) {
          setActionError(
            error instanceof Error
              ? error.message
              : "Impossible de vérifier vos favoris.",
          );
        }
      } finally {
        if (isActive) setIsCheckingAuth(false);
      }
    }

    void loadFavoriteState();
    return () => {
      isActive = false;
    };
  }, [scientificNameWithoutAuthor]);

  if (!bestResult || !species) return null;

  const confidencePercent = Math.round(bestResult.score * 100);
  const careGuide = getCareGuide(scientificName, commonName);
  const collectionInput: PlantCollectionInput = {
    scientific_name: scientificName,
    common_name: commonName,
    image_url: result.details?.image ?? null,
    nickname: null,
    purchase_date: null,
    location: null,
    notes: null,
  };

  async function handleToggleFavorite() {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent("/")}`);
      return;
    }

    setIsUpdatingFavorite(true);
    setActionError(null);
    try {
      if (favoriteId) {
        await removeFavoriteByScientificName(scientificNameWithoutAuthor);
        setFavoriteId(null);
      } else {
        const favorite = await addFavorite({
          scientific_name: scientificNameWithoutAuthor,
          common_name: commonName,
          family_name: family,
          image_url: result.details?.image ?? null,
        });
        setFavoriteId(favorite.id);
      }
    } catch (error: unknown) {
      console.error("Could not update plant favorite:", error);
      setActionError(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour vos favoris.",
      );
    } finally {
      setIsUpdatingFavorite(false);
    }
  }

  function openCollectionForm() {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent("/")}`);
      return;
    }
    setActionError(null);
    setIsCollectionFormOpen(true);
  }

  return (
    <article
      aria-live="polite"
      className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70 p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            <BadgeCheck size={15} aria-hidden="true" />
            Identification trouvée
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            {commonName}
          </h2>
          <p className="mt-1 text-sm italic text-stone-500">
            {scientificName}
          </p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
          <Sprout size={24} aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Sprout size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-stone-500">Famille botanique</p>
            <p className="truncate text-sm font-medium text-stone-800">
              {family}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <BadgeCheck size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-stone-500">Confiance</p>
              <p className="text-sm font-semibold text-emerald-800">
                {confidencePercent}%
              </p>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100"
              role="progressbar"
              aria-label="Score de confiance"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={confidencePercent}
            >
              <div
                className="h-full rounded-full bg-emerald-600 transition-[width]"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => void handleToggleFavorite()}
          disabled={isCheckingAuth || isUpdatingFavorite}
          aria-pressed={Boolean(favoriteId)}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
            favoriteId
              ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              : "border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
          }`}
        >
          <Heart
            size={17}
            fill={favoriteId ? "currentColor" : "none"}
            aria-hidden="true"
          />
          {isUpdatingFavorite
            ? "Mise à jour…"
            : favoriteId
              ? "Retirer des favoris"
              : "Ajouter aux favoris"}
        </button>
        <button
          type="button"
          onClick={openCollectionForm}
          disabled={isCheckingAuth}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
        >
          <Sprout size={17} aria-hidden="true" />
          Je possède cette plante
        </button>
      </div>
      {!isAuthenticated && !isCheckingAuth && (
        <p className="mt-2 text-center text-xs text-stone-500">
          Connectez-vous pour enregistrer un favori ou une plante.
        </p>
      )}
      {actionError && (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800"
        >
          {actionError}
        </p>
      )}

      {result.details && (
        <section className="mt-5 overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
          {result.details.image && (
            <Image
              src={result.details.image}
              alt={`Illustration de ${result.details.title}`}
              width={1200}
              height={700}
              unoptimized
              className="h-48 w-full object-cover sm:h-56"
            />
          )}
          <div className="p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <BookOpenText size={18} aria-hidden="true" />
              En savoir plus
            </div>
            <h3 className="text-base font-semibold text-stone-900">
              📖 Description
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {truncateText(result.details.summary, 500)}
            </p>
            <a
              href={result.details.wikipediaUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-950"
            >
              🌍 Source · Wikipédia
            </a>
          </div>
        </section>
      )}

      <PlantCareCard guide={careGuide} family={family} />

      {isCollectionFormOpen && (
        <CollectionPlantForm
          plant={collectionInput}
          onClose={() => setIsCollectionFormOpen(false)}
          onSaved={() => setIsCollectionFormOpen(false)}
        />
      )}
    </article>
  );
}
