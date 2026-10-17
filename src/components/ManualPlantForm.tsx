"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addPlantToHistory, addToPlantCollection } from "@/lib/favorites";
import { uploadPlantImage } from "@/lib/storage";
import type { PlantSuggestion } from "@/types/plant";
import PlantSearchInput from "@/components/PlantSearchInput";

interface ManualPlantFormProps {
  initialPlant?: Partial<PlantSuggestion>;
}

export default function ManualPlantForm({
  initialPlant,
}: ManualPlantFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [commonName, setCommonName] = useState(
    searchParams.get("name") ?? initialPlant?.commonName ?? "",
  );
  const [scientificName, setScientificName] = useState(
    searchParams.get("scientific") ?? initialPlant?.scientificName ?? "",
  );
  const [family, setFamily] = useState(
    searchParams.get("family") ?? initialPlant?.family ?? "",
  );
  const [description, setDescription] = useState(
    searchParams.get("description") ?? initialPlant?.description ?? "",
  );
  const [imageUrl, setImageUrl] = useState(
    searchParams.get("image") ?? initialPlant?.image ?? "",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [nickname, setNickname] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState<"manual" | "search">("manual");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function handleSuggestion(suggestion: PlantSuggestion) {
    setCommonName(suggestion.commonName);
    setScientificName(suggestion.scientificName);
    setFamily(suggestion.family ?? "");
    setDescription(suggestion.description ?? "");
    setImageUrl(suggestion.image ?? "");
    setImageFile(null);
    setSource("search");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanCommonName = commonName.trim();
    const cleanScientificName = scientificName.trim();
    if (!cleanCommonName) {
      setError("Le nom commun est obligatoire.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);
    let uploadedImage: string | null = null;

    try {
      const finalImageUrl = imageFile
        ? (uploadedImage = await uploadPlantImage(imageFile))
        : imageUrl.trim() || null;
      const savedPlant = await addToPlantCollection({
        common_name: cleanCommonName,
        scientific_name: cleanScientificName || cleanCommonName,
        family_name: family.trim(),
        description: description.trim() || null,
        image_url: finalImageUrl,
        nickname: nickname.trim() || null,
        purchase_date: purchaseDate || null,
        location: location.trim() || null,
        notes: notes.trim() || null,
        is_manual: source === "manual",
        source,
      });

      try {
        await addPlantToHistory({
          common_name: savedPlant.common_name,
          scientific_name: savedPlant.scientific_name,
          family_name: savedPlant.family_name,
          image_url: savedPlant.image_url,
          source,
        });
        router.push("/collection");
        router.refresh();
      } catch (historyError: unknown) {
        console.error("Could not save manual plant history:", historyError);
        setNotice("Plante enregistrée, mais l’historique n’a pas pu être mis à jour.");
        setIsSaved(true);
      }
    } catch (caughtError: unknown) {
      console.error("Could not save manual plant:", caughtError);
      if (uploadedImage) {
        try {
          const { deletePlantImage } = await import("@/lib/storage");
          await deletePlantImage(uploadedImage);
        } catch (cleanupError: unknown) {
          console.error("Could not remove an unused plant image:", cleanupError);
        }
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
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="mt-7 space-y-5 rounded-3xl border border-white bg-white p-5 shadow-sm sm:p-7"
    >
      <PlantSearchInput onSelect={handleSuggestion} />

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
          Image (optionnelle)
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
          <p className="mt-1 truncate text-xs text-stone-500">
            Image Wikipédia sélectionnée
          </p>
        )}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-stone-700">
          Description
        </span>
        <textarea
          rows={3}
          maxLength={4000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full resize-y rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-stone-700">
            Surnom
          </span>
          <input
            maxLength={80}
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
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
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-stone-700">
            Emplacement
          </span>
          <input
            maxLength={120}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Ex. Salon, près de la fenêtre"
            className="h-11 w-full rounded-xl border border-stone-200 px-3.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-stone-700">
          Notes personnelles
        </span>
        <textarea
          rows={3}
          maxLength={2000}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full resize-y rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
          {notice}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSaving || isSaved}
          className="h-11 rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="h-11 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {isSaving
            ? "Enregistrement…"
            : isSaved
              ? "Plante enregistrée"
              : "Enregistrer la plante"}
        </button>
      </div>
      {isSaved && (
        <a
          href="/collection"
          className="block text-right text-sm font-semibold text-emerald-800 underline"
        >
          Voir ma collection
        </a>
      )}
    </form>
  );
}
