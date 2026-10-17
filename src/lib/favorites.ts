"use client";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import type {
  Favorite,
  IdentificationHistoryEntry,
  PlantCollectionEntry,
  PlantCollectionInput,
  PlantIdentificationResponse,
  PlantSuggestion,
} from "@/types/plant";
import { plants } from "@/data/plants";

export interface FavoriteInput {
  scientific_name: string;
  common_name: string;
  family_name: string;
  image_url: string | null;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await createClient().auth.getUser();
  if (error?.name === "AuthSessionMissingError") return null;
  if (error) throw error;
  return data.user;
}

export async function getFavorites(): Promise<Favorite[]> {
  const { data, error } = await createClient()
    .from("favorites")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function isFavorite(scientificName: string): Promise<boolean> {
  const { data, error } = await createClient()
    .from("favorites")
    .select("id")
    .eq("scientific_name", scientificName)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

export async function getFavoriteId(
  scientificName: string,
): Promise<string | null> {
  const { data, error } = await createClient()
    .from("favorites")
    .select("id")
    .eq("scientific_name", scientificName)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function addFavorite(input: FavoriteInput): Promise<Favorite> {
  const user = await getRequiredUser();
  const { data, error } = await createClient()
    .from("favorites")
    .upsert(
      { ...input, user_id: user.id },
      { onConflict: "user_id,scientific_name" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function removeFavorite(id: string): Promise<void> {
  const { error } = await createClient()
    .from("favorites")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function removeFavoriteByScientificName(
  scientificName: string,
): Promise<void> {
  const { error } = await createClient()
    .from("favorites")
    .delete()
    .eq("scientific_name", scientificName);
  if (error) throw error;
}

export async function getPlantCollection(): Promise<PlantCollectionEntry[]> {
  const { data, error } = await createClient()
    .from("plants_collection")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addToPlantCollection(
  input: PlantCollectionInput,
): Promise<PlantCollectionEntry> {
  const user = await getRequiredUser();
  const { data, error } = await createClient()
    .from("plants_collection")
    .insert({
      ...input,
      user_id: user.id,
      is_manual: input.is_manual ?? false,
      source: input.source ?? "plantnet",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updatePlantCollection(
  id: string,
  input: PlantCollectionInput,
): Promise<PlantCollectionEntry> {
  const { data, error } = await createClient()
    .from("plants_collection")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function removeFromPlantCollection(id: string): Promise<void> {
  const { error } = await createClient()
    .from("plants_collection")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function waterPlant(
  id: string,
): Promise<PlantCollectionEntry> {
  const { data, error } = await createClient()
    .from("plants_collection")
    .update({ last_watered: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function addIdentificationToHistory(
  result: PlantIdentificationResponse,
): Promise<IdentificationHistoryEntry | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const bestResult = result.plantnet.results[0];
  if (!bestResult) return null;

  const { data, error } = await createClient()
    .from("identification_history")
    .insert({
      user_id: user.id,
      scientific_name: bestResult.species.scientificName,
      common_name:
        bestResult.species.commonNames[0] ??
        bestResult.species.scientificName,
      family_name: bestResult.species.family.scientificName,
      score: bestResult.score,
      image_url: result.details?.image ?? null,
      source: "plantnet",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function addPlantToHistory(
  input: {
    scientific_name: string;
    common_name: string;
    family_name: string;
    image_url: string | null;
    source: "manual" | "search";
  },
): Promise<IdentificationHistoryEntry | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await createClient()
    .from("identification_history")
    .insert({ ...input, user_id: user.id, score: null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getIdentificationHistory(): Promise<
  IdentificationHistoryEntry[]
> {
  const { data, error } = await createClient()
    .from("identification_history")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr")
    .trim();
}

export async function searchUserPlants(
  query: string,
): Promise<PlantSuggestion[]> {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return [];

  const user = await getCurrentUser();
  if (!user) return [];

  const [collection, favorites, history] = await Promise.all([
    getPlantCollection(),
    getFavorites(),
    getIdentificationHistory(),
  ]);
  const suggestions: PlantSuggestion[] = [];
  const seen = new Set<string>();

  function addSuggestion(
    suggestion: PlantSuggestion,
    source: NonNullable<PlantSuggestion["source"]>,
  ) {
    const matches = normalizeSearch(
      `${suggestion.commonName} ${suggestion.scientificName} ${suggestion.family ?? ""}`,
    ).includes(normalizedQuery);
    const key = normalizeSearch(suggestion.scientificName);
    if (!matches || seen.has(key)) return;
    seen.add(key);
    suggestions.push({ ...suggestion, source });
  }

  for (const plant of collection) {
    addSuggestion(
      {
        commonName: plant.common_name,
        scientificName: plant.scientific_name,
        family: plant.family_name,
      },
      "collection",
    );
  }
  for (const favorite of favorites) {
    addSuggestion(
      {
        commonName: favorite.common_name,
        scientificName: favorite.scientific_name,
        family: favorite.family_name,
      },
      "favorite",
    );
  }
  for (const entry of history) {
    addSuggestion(
      {
        commonName: entry.common_name,
        scientificName: entry.scientific_name,
        family: entry.family_name,
      },
      "history",
    );
  }

  return suggestions.slice(0, 8);
}

export function searchLocalPlants(query: string): PlantSuggestion[] {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return [];
  return plants
    .filter((plant) =>
      normalizeSearch(
        `${plant.commonName} ${plant.scientificName} ${plant.family ?? ""}`,
      ).includes(normalizedQuery),
    )
    .map((plant) => ({ ...plant, source: "local" as const }))
    .slice(0, 8);
}

async function getRequiredUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Vous devez être connecté pour continuer.");
  return user;
}
