"use client";

import { createClient } from "@/lib/supabase";

const BUCKET = "plant-images";

export async function uploadPlantImage(file: File): Promise<string> {
  const extensionByMimeType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const extension = extensionByMimeType[file.type];
  if (!extension) {
    throw new Error("Format non pris en charge. Utilisez JPEG, PNG, WebP ou GIF.");
  }

  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Connectez-vous pour importer une image.");

  const path = `${userData.user.id}/${crypto.randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function deletePlantImage(imageUrl: string): Promise<void> {
  const supabase = createClient();
  const bucketMarker = `/storage/v1/object/public/${BUCKET}/`;
  const markerIndex = imageUrl.indexOf(bucketMarker);
  if (markerIndex < 0) return;

  const path = decodeURIComponent(imageUrl.slice(markerIndex + bucketMarker.length));
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
