"use client";

import { useEffect, useState } from "react";
import type { PlantSuggestion } from "@/types/plant";
import {
  searchLocalPlants,
  searchUserPlants,
} from "@/lib/favorites";

interface PlantSearchInputProps {
  onSelect: (suggestion: PlantSuggestion) => void;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr")
    .trim();
}

function isPlantSuggestion(value: unknown): value is PlantSuggestion {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  if (
    typeof record.commonName !== "string" ||
    typeof record.scientificName !== "string"
  ) {
    return false;
  }
  const optionalStringKeys = ["family", "description", "image"] as const;
  for (const key of optionalStringKeys) {
    if (
      key in record &&
      record[key] !== undefined &&
      typeof record[key] !== "string"
    ) {
      return false;
    }
  }
  if (
    record.source !== undefined &&
    record.source !== "collection" &&
    record.source !== "favorite" &&
    record.source !== "history" &&
    record.source !== "wikipedia" &&
    record.source !== "local"
  ) {
    return false;
  }
  return true;
}

function sourceLabel(source: PlantSuggestion["source"]) {
  switch (source) {
    case "collection":
      return "Ma collection";
    case "favorite":
      return "Favori";
    case "history":
      return "Historique";
    case "wikipedia":
      return "Wikipédia";
    case "local":
      return "Base locale";
    default:
      return "Plante";
  }
}

export default function PlantSearchInput({
  onSelect,
}: PlantSearchInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlantSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isActive = true;
    const timer = window.setTimeout(() => {
      void loadSuggestions(value);
    }, 300);

    async function loadSuggestions(value: string) {
      setIsLoading(true);
      setError(null);
      const results: PlantSuggestion[] = [];
      const seen = new Set<string>();

      function add(suggestion: PlantSuggestion) {
        const key = normalize(suggestion.scientificName);
        if (seen.has(key)) {
          const index = results.findIndex(
            (item) => normalize(item.scientificName) === key,
          );
          if (index >= 0) {
            results[index] = {
              ...suggestion,
              ...results[index],
              family: results[index].family ?? suggestion.family,
              description:
                results[index].description ?? suggestion.description,
              image: results[index].image ?? suggestion.image,
            };
          }
          return;
        }
        seen.add(key);
        results.push(suggestion);
      }

      try {
        for (const suggestion of await searchUserPlants(value)) add(suggestion);
      } catch (caughtError: unknown) {
        console.error("Could not search user plants:", caughtError);
        if (isActive) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "La recherche dans vos plantes a échoué.",
          );
        }
      }

      try {
        const response = await fetch(
          `/api/plants/search?q=${encodeURIComponent(value)}`,
        );
        if (!response.ok) {
          throw new Error("La recherche Wikipédia est momentanément indisponible.");
        }
        const payload: unknown = await response.json();
        if (
          typeof payload === "object" &&
          payload !== null &&
          "suggestion" in payload &&
          isPlantSuggestion(payload.suggestion)
        ) {
          add(payload.suggestion);
        }
      } catch (caughtError: unknown) {
        console.error("Could not search Wikipedia plants:", caughtError);
        if (isActive) {
          setError((current) =>
            current ??
            (caughtError instanceof Error
              ? caughtError.message
              : "La recherche Wikipédia a échoué."),
          );
        }
      }

      for (const suggestion of searchLocalPlants(value)) add(suggestion);
      if (isActive) {
        setSuggestions(results);
        setIsLoading(false);
      }
    }

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="relative">
      <label
        htmlFor="plant-search"
        className="mb-1.5 block text-sm font-medium text-stone-700"
      >
        🔎 Rechercher une plante
      </label>
      <input
        id="plant-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
        placeholder="Ex. monstera, aloe vera…"
        className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      />
      {isLoading && (
        <p role="status" className="mt-2 text-xs text-stone-500">
          Recherche en cours…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-rose-700">
          {error}
        </p>
      )}
      {suggestions.length > 0 && (
        <ul
          aria-label="Suggestions de plantes"
          className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.scientificName}-${index}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect(suggestion);
                  setQuery("");
                  setSuggestions([]);
                }}
                className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition hover:bg-emerald-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-stone-900">
                    {suggestion.commonName}
                  </span>
                  <span className="block truncate text-xs italic text-stone-500">
                    {suggestion.scientificName}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] text-stone-500">
                  {sourceLabel(suggestion.source)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
