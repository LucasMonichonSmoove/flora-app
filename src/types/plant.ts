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

export interface CareGuide {
  sunlight: string;
  watering: string;
  temperature: string;
  humidity: string;
  toxicity: string;
  difficulty: string;
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

export type Favorite = {
  id: string;
  user_id: string;
  scientific_name: string;
  common_name: string;
  family_name: string;
  image_url: string | null;
  created_at: string;
};

export type PlantCollectionEntry = {
  id: string;
  user_id: string;
  scientific_name: string;
  common_name: string;
  image_url: string | null;
  nickname: string | null;
  purchase_date: string | null;
  location: string | null;
  notes: string | null;
  last_watered: string | null;
  created_at: string;
};

export type PlantCollectionInput = {
  scientific_name: string;
  common_name: string;
  image_url: string | null;
  nickname: string | null;
  purchase_date: string | null;
  location: string | null;
  notes: string | null;
};

export type IdentificationHistoryEntry = {
  id: string;
  user_id: string;
  scientific_name: string;
  common_name: string;
  family_name: string;
  score: number;
  image_url: string | null;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, "id" | "created_at"> &
          Partial<Pick<Favorite, "id" | "created_at">>;
        Update: Partial<Omit<Favorite, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      plants_collection: {
        Row: PlantCollectionEntry;
        Insert: Omit<PlantCollectionEntry, "id" | "created_at" | "last_watered"> &
          Partial<
            Pick<PlantCollectionEntry, "id" | "created_at" | "last_watered">
          >;
        Update: Partial<
          Omit<PlantCollectionEntry, "id" | "user_id" | "created_at">
        >;
        Relationships: [];
      };
      identification_history: {
        Row: IdentificationHistoryEntry;
        Insert: Omit<IdentificationHistoryEntry, "id" | "created_at"> &
          Partial<Pick<IdentificationHistoryEntry, "id" | "created_at">>;
        Update: Partial<
          Omit<IdentificationHistoryEntry, "id" | "user_id" | "created_at">
        >;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
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
