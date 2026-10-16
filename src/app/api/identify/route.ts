import { identifyPlant, PlantNetError } from "@/lib/plantnet";
import { getPlantDetails } from "@/lib/wikipedia";
import type {
  ApiErrorResponse,
  PlantIdentificationResponse,
} from "@/types/plant";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());

  if (file.type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  return (
    file.type === "image/png" &&
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function errorResponse(
  error: string,
  status: number,
  code: ApiErrorResponse["code"],
) {
  return Response.json({ error, code } satisfies ApiErrorResponse, { status });
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Le formulaire envoyé est illisible.", 400, "invalid_request");
  }

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return errorResponse("Veuillez sélectionner une image.", 400, "missing_image");
  }

  if (!ALLOWED_TYPES.has(image.type)) {
    return errorResponse(
      "Format non pris en charge. Utilisez une image JPEG ou PNG.",
      415,
      "invalid_format",
    );
  }

  if (image.size > MAX_FILE_SIZE) {
    return errorResponse(
      "L’image dépasse la taille maximale de 10 Mo.",
      413,
      "file_too_large",
    );
  }

  if (!(await hasValidImageSignature(image))) {
    return errorResponse(
      "Le contenu du fichier ne correspond pas à une image JPEG ou PNG.",
      415,
      "invalid_format",
    );
  }

  try {
    const plantnet = await identifyPlant(image);
    const bestResult = plantnet.results[0];
    const details = bestResult
      ? await getPlantDetails(bestResult.species.scientificNameWithoutAuthor)
      : null;

    return Response.json({
      plantnet,
      details,
    } satisfies PlantIdentificationResponse);
  } catch (error: unknown) {
    if (error instanceof PlantNetError) {
      if (error.code === "timeout") {
        return errorResponse(error.message, 504, "timeout");
      }
      if (error.code === "no_result") {
        return errorResponse(error.message, 422, "no_result");
      }
      if (error.code === "configuration") {
        console.error("PlantNet configuration error:", error.message);
        return errorResponse(
          "Le service d’identification n’est pas configuré.",
          503,
          "service_unavailable",
        );
      }

      console.error("PlantNet API error:", error.message);
      return errorResponse(
        "Le service d’identification est momentanément indisponible.",
        502,
        "api_error",
      );
    }

    console.error("Unexpected plant identification error:", error);
    return errorResponse(
      "Une erreur inattendue est survenue pendant l’identification.",
      500,
      "internal_error",
    );
  }
}
