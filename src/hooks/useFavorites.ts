"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlantCareInfo, SavedPlant } from "@/types/plant";

const STORAGE_KEY = "flora-favorites";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPlantCareInfo(value: unknown): value is PlantCareInfo {
  if (!isRecord(value) || typeof value.watering !== "string") return false;
  if (
    value.placement !== "indoor" &&
    value.placement !== "outdoor" &&
    value.placement !== "both" &&
    value.placement !== "species-dependent"
  ) {
    return false;
  }

  if (value.estimatedPrice === null) return true;
  if (!isRecord(value.estimatedPrice)) return false;
  return (
    typeof value.estimatedPrice.min === "number" &&
    typeof value.estimatedPrice.max === "number"
  );
}

function isSavedPlant(value: unknown): value is SavedPlant {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.commonName === "string" &&
    typeof value.scientificName === "string" &&
    typeof value.family === "string" &&
    typeof value.addedAt === "string" &&
    (typeof value.wikipediaUrl === "string" || value.wikipediaUrl === null) &&
    (typeof value.summary === "string" || value.summary === null) &&
    (typeof value.image === "string" || value.image === null) &&
    isPlantCareInfo(value.care)
  );
}

function readFavorites(): SavedPlant[] {
  const serialized = window.localStorage.getItem(STORAGE_KEY);
  if (!serialized) return [];

  const parsed: unknown = JSON.parse(serialized);
  if (!Array.isArray(parsed) || !parsed.every(isSavedPlant)) {
    throw new Error("Les favoris enregistrés sont illisibles.");
  }
  return parsed;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<SavedPlant[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const favoritesRef = useRef<SavedPlant[]>([]);

  useEffect(() => {
    try {
      const storedFavorites = readFavorites();
      favoritesRef.current = storedFavorites;
      setFavorites(storedFavorites);
    } catch (caughtError: unknown) {
      console.error("Could not load Flora favorites:", caughtError);
      setError(
        "Les favoris locaux n’ont pas pu être chargés. Vérifiez le stockage de votre navigateur.",
      );
    } finally {
      setIsReady(true);
    }
  }, []);

  const toggleFavorite = useCallback((plant: SavedPlant) => {
    if (!isReady) return;

    const nextFavorites = favoritesRef.current.some(
      (favorite) => favorite.id === plant.id,
    )
      ? favoritesRef.current.filter((favorite) => favorite.id !== plant.id)
      : [{ ...plant, addedAt: new Date().toISOString() }, ...favoritesRef.current];

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFavorites));
      favoritesRef.current = nextFavorites;
      setFavorites(nextFavorites);
      setError(null);
    } catch (caughtError: unknown) {
      console.error("Could not save Flora favorites:", caughtError);
      setError(
        "Impossible d’enregistrer ce favori dans le navigateur. Vérifiez l’espace de stockage disponible.",
      );
    }
  }, [isReady]);

  const removeFavorite = useCallback((id: string) => {
    if (!isReady) return;
    const nextFavorites = favoritesRef.current.filter(
      (favorite) => favorite.id !== id,
    );

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFavorites));
      favoritesRef.current = nextFavorites;
      setFavorites(nextFavorites);
      setError(null);
    } catch (caughtError: unknown) {
      console.error("Could not remove Flora favorite:", caughtError);
      setError("Impossible de modifier vos favoris locaux.");
    }
  }, [isReady]);

  return {
    favorites,
    isReady,
    error,
    toggleFavorite,
    removeFavorite,
  };
}
