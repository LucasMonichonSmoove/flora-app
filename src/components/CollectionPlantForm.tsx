"use client";

import { useState, type FormEvent } from "react";
import { addToPlantCollection, updatePlantCollection } from "@/lib/favorites";
import { deletePlantImage, uploadPlantImage } from "@/lib/storage";
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
  const [commonName, setCommonName] = useState(plant.common_name);
  const [scientificName, setScientificName] = useState(plant.scientific_name);
  const [family, setFamily] = useState(plant.family_name);
  const [description, setDescription] = useState(plant.description ?? "");
  const [imageUrl, setImageUrl] = useState(plant.image_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
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

    let uploadedImage: string | null = null;
    try {
      const nextImageUrl = imageFile
        ? (uploadedImage = await uploadPlantImage(imageFile))
        : imageUrl.trim() || null;
      const input: PlantCollectionInput = {
        ...plant,
        common_name: commonName.trim(),
        scientific_name: scientificName.trim() || commonName.trim(),
        family_name: family.trim(),
        description: description.trim() || null,
        image_url: nextImageUrl,
        nickname: nickname.trim() || null,
        purchase_date: purchaseDate || null,
        location: location.trim() || null,
        notes: notes.trim() || null,
        is_manual: existing?.is_manual ?? plant.is_manual,
        source: existing?.source ?? plant.source,
      };
      const savedPlant = existing
        ? await updatePlantCollection(existing.id, input)
        : await addToPlantCollection(input);
      if (
        existing?.image_url &&
        existing.image_url !== nextImageUrl
      ) {
        await deletePlantImage(existing.image_url).catch((cleanupError: unknown) => {
          console.error("Could not remove replaced plant image:", cleanupError);
        });
      }
      onSaved(savedPlant);
    } catch (caughtError: unknown) {
      console.error("Could not save plant collection entry:", caughtError);
      if (uploadedImage) {
        await deletePlantImage(uploadedImage).catch((cleanupError: unknown) => {
          console.error("Could not remove an unused plant image:", cleanupError);
        });
      }
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
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">
                Nom commun *
              </span>
              <input
                required
                maxLength={120}
                value={commonName}
                onChange={(event) => setCommonName(event.target.value)}
                className="h-11 w-full rounded-xl border border-stone-200 px-3.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">
                Nom scientifique
              </span>
              <input
                maxLength={160}
                value={scientificName}
                onChange={(event) => setScientificName(event.target.value)}
                className="h-11 w-full rounded-xl border border-stone-200 px-3.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">
                Famille botanique
              </span>
              <input
                maxLength={120}
                value={family}
                onChange={(event) => setFamily(event.target.value)}
                className="h-11 w-full rounded-xl border border-stone-200 px-3.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              Image
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (file && file.size > 10 * 1024 * 1024) {
                  setError("L’image ne peut pas dépasser 10 Mo.");
                  event.target.value = "";
                  return;
                }
                setError(null);
                setImageFile(file);
                if (file) setImageUrl("");
              }}
              className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-emerald-800"
            />
            {imageUrl && !imageFile && (
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="mt-1 text-xs font-medium text-rose-700 underline"
              >
                Supprimer l’image actuelle
              </button>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              Description
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={4000}
              rows={3}
              className="w-full resize-y rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
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
