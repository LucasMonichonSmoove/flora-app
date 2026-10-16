import type { PlantDetails, WikipediaLanguage } from "@/types/plant";

const REQUEST_TIMEOUT_MS = 5_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

async function searchWikipedia(
  language: WikipediaLanguage,
  scientificName: string,
): Promise<string | null> {
  const endpoint = new URL(`https://${language}.wikipedia.org/w/api.php`);
  endpoint.search = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: scientificName,
    format: "json",
    utf8: "1",
  }).toString();

  const response = await fetch(endpoint, {
    headers: { "User-Agent": "FloraPlantIdentifier/1.0" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Wikipedia search failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload)) return null;
  const query = payload.query;
  if (!isRecord(query) || !Array.isArray(query.search)) return null;

  const firstResult = query.search[0];
  if (!isRecord(firstResult)) return null;
  return readString(firstResult.title) ?? null;
}

async function getSummary(
  language: WikipediaLanguage,
  title: string,
): Promise<PlantDetails | null> {
  const endpoint = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const response = await fetch(endpoint, {
    headers: { "User-Agent": "FloraPlantIdentifier/1.0" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Wikipedia summary failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload)) return null;

  const summary = readString(payload.extract);
  const resolvedTitle = readString(payload.title) ?? title;
  const contentUrls = payload.content_urls;
  const desktop = isRecord(contentUrls) ? contentUrls.desktop : undefined;
  const wikipediaUrl =
    (isRecord(desktop) ? readString(desktop.page) : undefined) ??
    readString(payload.canonicalurl) ??
    `https://${language}.wikipedia.org/wiki/${encodeURIComponent(resolvedTitle.replaceAll(" ", "_"))}`;

  const originalImage = payload.originalimage;
  const thumbnail = payload.thumbnail;
  const image =
    (isRecord(originalImage)
      ? readString(originalImage.source)
      : undefined) ??
    (isRecord(thumbnail) ? readString(thumbnail.source) : undefined);

  if (!summary) return null;

  return {
    title: resolvedTitle,
    summary,
    ...(image ? { image } : {}),
    wikipediaUrl,
  };
}

async function getDetailsForLanguage(
  language: WikipediaLanguage,
  scientificName: string,
): Promise<PlantDetails | null> {
  const title = await searchWikipedia(language, scientificName);
  return title ? getSummary(language, title) : null;
}

export async function getPlantDetails(
  scientificName: string,
): Promise<PlantDetails | null> {
  const normalizedName = scientificName.trim();
  if (!normalizedName) return null;

  try {
    const frenchDetails = await getDetailsForLanguage("fr", normalizedName);
    if (frenchDetails) return frenchDetails;
  } catch (error: unknown) {
    console.error("Wikipedia FR lookup failed:", error);
  }

  try {
    return await getDetailsForLanguage("en", normalizedName);
  } catch (error: unknown) {
    console.error("Wikipedia EN lookup failed:", error);
    return null;
  }
}
