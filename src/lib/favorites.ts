"use client";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import type {
  Favorite,
  IdentificationHistoryEntry,
  PlantCollectionEntry,
  PlantCollectionInput,
  PlantIdentificationResponse,
} from "@/types/plant";

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
    .insert({ ...input, user_id: user.id })
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
    })
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

async function getRequiredUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Vous devez être connecté pour continuer.");
  return user;
}
