"use client";

import { useState, type FormEvent } from "react";
import { addToPlantCollection, updatePlantCollection } from "@/lib/favorites";
import type {
  PlantCollectionEntry,
  PlantCollectionInput,
} from "@/types/plant";

interface CollectionPlantFormProps {
  plant: PlantCollectionInput;
  existing?: PlantCollectionEntry;
  onClose: () => void;
  onSaved: (plant: PlantCollectionEntry) => void;
}

export default function CollectionPlantForm({
  plant,
  existing,
  onClose,
  onSaved,
}: CollectionPlantFormProps) {
  const [nickname, setNickname] = useState(existing?.nickname ?? "");
  const [purchaseDate, setPurchaseDate] = useState(
    existing?.purchase_date ?? "",
  );
  const [location, setLocation] = useState(existing?.location ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const input: PlantCollectionInput = {
      ...plant,
      nickname: nickname.trim() || null,
      purchase_date: purchaseDate || null,
      location: location.trim() || null,
      notes: notes.trim() || null,
    };

    try {
      const savedPlant = existing
        ? await updatePlantCollection(existing.id, input)
        : await addToPlantCollection(input);
      onSaved(savedPlant);
    } catch (caughtError: unknown) {
      console.error("Could not save plant collection entry:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible d’enregistrer cette plante.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-form-title"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !isSaving) onClose();
        }}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-7"
      >
        <h2
          id="collection-form-title"
          className="text-xl font-semibold text-stone-900"
        >
          {existing ? "Modifier ma plante" : "Ajouter à ma collection"}
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          {plant.common_name} · <i>{plant.scientific_name}</i>
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              Nom personnalisé
            </span>
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              maxLength={80}
              placeholder="Ex. Mon monstera du salon"
              className="h-11 w-full rounded-xl border border-stone-200 px-3.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              Date d’acquisition
            </span>
            <input
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
              className="h-11 w-full rounded-xl border border-stone-200 px-3.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              Emplacement
            </span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={120}
              placeholder="Ex. Salon, près de la fenêtre"
              className="h-11 w-full rounded-xl border border-stone-200 px-3.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              Notes
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Observations, rempotage, conseils…"
              className="w-full resize-y rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-11 rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-11 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {isSaving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
