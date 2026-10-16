export interface PlantNetSpecies {
  scientificName: string;
  scientificNameWithoutAuthor: string;
  commonNames: string[];
  family: {
    scientificName: string;
  };
}

export interface PlantNetResult {
  score: number;
  species: PlantNetSpecies;
}

export interface PlantNetResponse {
  results: PlantNetResult[];
}

export interface PlantDetails {
  title: string;
  summary: string;
  image?: string;
  wikipediaUrl: string;
}

export type WikipediaLanguage = "fr" | "en";

export interface PlantIdentificationResponse {
  plantnet: PlantNetResponse;
  details: PlantDetails | null;
}

export type PlantPlacement =
  | "indoor"
  | "outdoor"
  | "both"
  | "species-dependent";

export interface PlantCareInfo {
  watering: string;
  placement: PlantPlacement;
  estimatedPrice: {
    min: number;
    max: number;
  } | null;
}

export interface SavedPlant {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  addedAt: string;
  wikipediaUrl: string | null;
  summary: string | null;
  image: string | null;
  care: PlantCareInfo;
}

export interface ApiErrorResponse {
  error: string;
  code:
    | "invalid_request"
    | "missing_image"
    | "invalid_format"
    | "file_too_large"
    | "timeout"
    | "no_result"
    | "service_unavailable"
    | "api_error"
    | "internal_error";
}
