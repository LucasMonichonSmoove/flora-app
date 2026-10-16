import Image from "next/image";
import {
  BadgeCheck,
  BookOpenText,
  Droplets,
  ExternalLink,
  Heart,
  Flower2,
  House,
  Leaf,
  Tag,
  Sun,
  Sprout,
} from "lucide-react";
import { getPlantCareInfo, getPlacementLabel } from "@/lib/plant-care";
import { truncateText } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import type { PlantIdentificationResponse, SavedPlant } from "@/types/plant";

interface ResultCardProps {
  result: PlantIdentificationResponse;
}

export default function ResultCard({ result }: ResultCardProps) {
  const { favorites, isReady, error, toggleFavorite } = useFavorites();
  const bestResult = result.plantnet.results[0];
  if (!bestResult) return null;

  const { species } = bestResult;
  const confidencePercent = Math.round(bestResult.score * 100);
  const care = getPlantCareInfo(species.family.scientificName);
  const favoriteId = species.scientificNameWithoutAuthor
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, "-");
  const isFavorite = favorites.some((favorite) => favorite.id === favoriteId);
  const savedPlant: SavedPlant = {
    id: favoriteId,
    commonName: species.commonNames[0] ?? species.scientificName,
    scientificName: species.scientificName,
    family: species.family.scientificName,
    addedAt: new Date().toISOString(),
    wikipediaUrl: result.details?.wikipediaUrl ?? null,
    summary: result.details?.summary ?? null,
    image: result.details?.image ?? null,
    care,
  };

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
            {species.commonNames[0] ?? species.scientificName}
          </h2>
          <p className="mt-1 text-sm italic text-stone-500">
            {species.scientificName}
          </p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
          <Sprout size={24} aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Flower2 size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-stone-500">Famille botanique</p>
            <p className="truncate text-sm font-medium text-stone-800">
              {species.family.scientificName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Leaf size={18} aria-hidden="true" />
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

      <section className="mt-5 rounded-2xl border border-emerald-100 bg-white/90 p-4 sm:p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
          <Leaf size={17} className="text-emerald-700" aria-hidden="true" />
          Conseils d’entretien
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Droplets
              size={18}
              className="mt-0.5 shrink-0 text-sky-600"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-medium text-stone-500">Arrosage</p>
              <p className="mt-1 text-sm leading-5 text-stone-700">
                {care.watering}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            {care.placement === "outdoor" ? (
              <Sun
                size={18}
                className="mt-0.5 shrink-0 text-amber-600"
                aria-hidden="true"
              />
            ) : (
              <House
                size={18}
                className="mt-0.5 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
            )}
            <div>
              <p className="text-xs font-medium text-stone-500">
                Intérieur / extérieur
              </p>
              <p className="mt-1 text-sm leading-5 text-stone-700">
                {getPlacementLabel(care.placement)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:col-span-2">
            <Tag
              size={18}
              className="mt-0.5 shrink-0 text-emerald-700"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-medium text-stone-500">
                Prix indicatif
              </p>
              <p className="mt-1 text-sm leading-5 text-stone-700">
                {care.estimatedPrice
                  ? `${care.estimatedPrice.min} à ${care.estimatedPrice.max} € (estimation)`
                  : "À vérifier auprès d’un vendeur local"}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 border-t border-stone-100 pt-3 text-xs leading-5 text-stone-500">
          Conseils généraux basés sur la famille botanique et prix estimatifs :
          les besoins et tarifs réels varient selon l’espèce, la taille et la
          région.
        </p>
      </section>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => toggleFavorite(savedPlant)}
          disabled={!isReady}
          aria-pressed={isFavorite}
          className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
            isFavorite
              ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              : "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
          }`}
        >
          <Heart
            size={17}
            fill={isFavorite ? "currentColor" : "none"}
            aria-hidden="true"
          />
          {isFavorite ? "Retirer des favoris" : "Ajouter à ma wishlist"}
        </button>
        {error && (
          <p role="alert" className="mt-2 text-sm text-rose-700">
            {error}
          </p>
        )}
        <p className="mt-2 text-center text-xs text-stone-500">
          Favoris enregistrés sur cet appareil jusqu’à la connexion de Supabase.
        </p>
      </div>

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
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </section>
      )}
    </article>
  );
}
