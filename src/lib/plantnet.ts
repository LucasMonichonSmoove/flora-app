import axios from "axios";
import type { PlantNetResult, PlantNetResponse } from "@/types/plant";

const PLANTNET_ENDPOINT = "https://my-api.plantnet.org/v2/identify/all";
const REQUEST_TIMEOUT_MS = 25_000;

export type PlantNetErrorCode =
  | "configuration"
  | "timeout"
  | "no_result"
  | "api";

export class PlantNetError extends Error {
  constructor(
    message: string,
    public readonly code: PlantNetErrorCode,
  ) {
    super(message);
    this.name = "PlantNetError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function parseTopResult(payload: unknown): PlantNetResult {
  if (!isRecord(payload) || !Array.isArray(payload.results)) {
    throw new PlantNetError("Invalid response from PlantNet.", "api");
  }

  const bestResult = payload.results[0];
  if (!isRecord(bestResult) || !isRecord(bestResult.species)) {
    throw new PlantNetError(
      "Aucune plante identifiable n’a été trouvée dans cette image.",
      "no_result",
    );
  }

  const species = bestResult.species;
  const scientificName = readString(species.scientificName);
  const scientificNameWithoutAuthor =
    readString(species.scientificNameWithoutAuthor) ?? scientificName;
  const confidence =
    typeof bestResult.score === "number" &&
    Number.isFinite(bestResult.score) &&
    bestResult.score >= 0 &&
    bestResult.score <= 1
      ? bestResult.score
      : null;
  const familyData = species.family;
  const family = isRecord(familyData)
    ? readString(familyData.scientificName)
    : null;
  const commonNames = Array.isArray(species.commonNames)
    ? species.commonNames.filter(
        (name): name is string =>
          typeof name === "string" && name.trim().length > 0,
      )
    : [];

  if (
    !scientificName ||
    !scientificNameWithoutAuthor ||
    confidence === null ||
    !family
  ) {
    throw new PlantNetError("Invalid response from PlantNet.", "api");
  }

  return {
    score: confidence,
    species: {
      scientificName,
      scientificNameWithoutAuthor,
      commonNames,
      family: { scientificName: family },
    },
  };
}

export async function identifyPlant(file: File): Promise<PlantNetResponse> {
  const apiKey = process.env.PLANTNET_API_KEY;
  if (!apiKey) {
    throw new PlantNetError(
      "Missing PLANTNET_API_KEY environment variable.",
      "configuration",
    );
  }

  const formData = new FormData();
  formData.append("images", file, file.name);
  formData.append("organs", "auto");

  try {
    const response = await axios.post<unknown>(PLANTNET_ENDPOINT, formData, {
      params: {
        "api-key": apiKey,
        lang: "fr",
      },
      timeout: REQUEST_TIMEOUT_MS,
    });
    return { results: [parseTopResult(response.data)] };
  } catch (error: unknown) {
    if (error instanceof PlantNetError) throw error;

    if (axios.isAxiosError(error)) {
      if (
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT"
      ) {
        throw new PlantNetError(
          "Le service d’identification a dépassé le délai autorisé.",
          "timeout",
        );
      }
      throw new PlantNetError("PlantNet API request failed.", "api");
    }

    throw error;
  }
}
