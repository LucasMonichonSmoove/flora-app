"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarDays,
  Droplets,
  NotebookPen,
  Pencil,
  Sprout,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CollectionPlantForm from "@/components/CollectionPlantForm";
import Header from "@/components/Header";
import {
  getCurrentUser,
  getPlantCollection,
  removeFromPlantCollection,
  waterPlant,
} from "@/lib/favorites";
import { getDaysSinceWatering } from "@/lib/plant-care";
import type {
  PlantCollectionEntry,
  PlantCollectionInput,
} from "@/types/plant";

function formatDate(value: string | null) {
  if (!value) return "Non renseignée";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Non renseignée";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

function toCollectionInput(plant: PlantCollectionEntry): PlantCollectionInput {
  return {
    scientific_name: plant.scientific_name,
    common_name: plant.common_name,
    image_url: plant.image_url,
    nickname: plant.nickname,
    purchase_date: plant.purchase_date,
    location: plant.location,
    notes: plant.notes,
  };
}

export default function CollectionPage() {
  const router = useRouter();
  const [plants, setPlants] = useState<PlantCollectionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlant, setEditingPlant] =
    useState<PlantCollectionEntry | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadCollection() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace("/login?next=%2Fcollection");
          return;
        }
        const entries = await getPlantCollection();
        if (isActive) setPlants(entries);
      } catch (caughtError: unknown) {
        console.error("Could not load plant collection:", caughtError);
        if (isActive) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger votre collection.",
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadCollection();
    return () => {
      isActive = false;
    };
  }, [router]);

  async function handleWater(plant: PlantCollectionEntry) {
    setBusyId(plant.id);
    setError(null);
    try {
      const watered = await waterPlant(plant.id);
      setPlants((current) =>
        current.map((entry) => (entry.id === watered.id ? watered : entry)),
      );
    } catch (caughtError: unknown) {
      console.error("Could not update watering date:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible d’enregistrer l’arrosage.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(plant: PlantCollectionEntry) {
    if (
      !window.confirm(
        `Supprimer ${plant.nickname || plant.common_name} de votre collection ?`,
      )
    ) {
      return;
    }
    setBusyId(plant.id);
    setError(null);
    try {
      await removeFromPlantCollection(plant.id);
      setPlants((current) => current.filter((entry) => entry.id !== plant.id));
    } catch (caughtError: unknown) {
      console.error("Could not delete collection entry:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de supprimer cette plante.",
      );
    } finally {
      setBusyId(null);
    }
  }

  function handleSaved(updatedPlant: PlantCollectionEntry) {
    setPlants((current) => {
      const exists = current.some((plant) => plant.id === updatedPlant.id);
      return exists
        ? current.map((plant) =>
            plant.id === updatedPlant.id ? updatedPlant : plant,
          )
        : [updatedPlant, ...current];
    });
    setEditingPlant(null);
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
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <Sprout size={23} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              Ma collection
            </h1>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Retrouvez vos plantes et gardez leurs soins à jour.
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
            Chargement de votre collection…
          </p>
        ) : plants.length === 0 ? (
          <section className="mt-10 rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center">
            <Sprout
              size={30}
              className="mx-auto text-emerald-700"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold text-stone-900">
              Votre collection est encore vide
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
              Identifiez une plante puis choisissez « Ajouter à ma collection ».
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Identifier une plante
            </Link>
          </section>
        ) : (
          <ul className="mt-8 grid gap-5 md:grid-cols-2">
            {plants.map((plant) => {
              const daysSinceWatering = getDaysSinceWatering(
                plant.last_watered,
              );
              const isBusy = busyId === plant.id;

              return (
                <li
                  key={plant.id}
                  className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_16px_50px_-36px_rgba(39,72,48,0.3)]"
                >
                  {plant.image_url && (
                    <Image
                      src={plant.image_url}
                      alt={`Illustration de ${plant.common_name}`}
                      width={1200}
                      height={600}
                      unoptimized
                      className="h-52 w-full object-cover"
                    />
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-semibold text-stone-900">
                          {plant.nickname || plant.common_name}
                        </h2>
                        {plant.nickname && (
                          <p className="mt-1 text-sm text-stone-600">
                            {plant.common_name}
                          </p>
                        )}
                        <p className="mt-1 text-sm italic text-stone-500">
                          {plant.scientific_name}
                        </p>
                      </div>
                      <span className="rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                        {plant.location || "Emplacement à définir"}
                      </span>
                    </div>

                    <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="flex items-start gap-2.5">
                        <CalendarDays
                          size={16}
                          className="mt-0.5 shrink-0 text-stone-400"
                          aria-hidden="true"
                        />
                        <div>
                          <dt className="text-xs text-stone-500">Acquise le</dt>
                          <dd className="mt-0.5 text-stone-800">
                            {formatDate(plant.purchase_date)}
                          </dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Droplets
                          size={16}
                          className="mt-0.5 shrink-0 text-sky-600"
                          aria-hidden="true"
                        />
                        <div>
                          <dt className="text-xs text-stone-500">
                            Dernier arrosage
                          </dt>
                          <dd className="mt-0.5 text-stone-800">
                            {daysSinceWatering === null
                              ? "Pas encore renseigné"
                              : daysSinceWatering === 0
                                ? "Aujourd’hui"
                                : `Il y a ${daysSinceWatering} jour${daysSinceWatering > 1 ? "s" : ""}`}
                          </dd>
                        </div>
                      </div>
                    </dl>

                    {plant.notes && (
                      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-stone-50 p-3.5">
                        <NotebookPen
                          size={16}
                          className="mt-0.5 shrink-0 text-stone-500"
                          aria-hidden="true"
                        />
                        <p className="whitespace-pre-wrap text-sm leading-5 text-stone-700">
                          {plant.notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void handleWater(plant)}
                        disabled={isBusy}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-sky-600 px-3.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
                      >
                        <Droplets size={16} aria-hidden="true" />
                        {isBusy ? "Mise à jour…" : "Arroser"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPlant(plant)}
                        disabled={isBusy}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 px-3.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
                      >
                        <Pencil size={15} aria-hidden="true" />
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(plant)}
                        disabled={isBusy}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 px-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {editingPlant && (
        <CollectionPlantForm
          existing={editingPlant}
          plant={toCollectionInput(editingPlant)}
          onClose={() => setEditingPlant(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
