import { searchWikipediaPlant } from "@/lib/wikipedia";
import type { PlantSuggestion } from "@/types/plant";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 100) {
    return Response.json({ suggestion: null } satisfies {
      suggestion: PlantSuggestion | null;
    });
  }

  try {
    const suggestion = await searchWikipediaPlant(query);
    return Response.json({ suggestion } satisfies {
      suggestion: PlantSuggestion | null;
    });
  } catch (error: unknown) {
    console.error("Wikipedia plant search failed:", error);
    return Response.json(
      { error: "La recherche Wikipédia est momentanément indisponible." },
      { status: 502 },
    );
  }
}
