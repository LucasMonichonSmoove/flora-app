import type { PlantCareInfo } from "@/types/plant";

const FAMILY_CARE: Record<string, PlantCareInfo> = {
  araceae: {
    watering:
      "Arrosez lorsque les 2 à 3 premiers centimètres du terreau sont secs. Videz la soucoupe après l’arrosage.",
    placement: "both",
    estimatedPrice: { min: 8, max: 40 },
  },
  cactaceae: {
    watering:
      "Laissez le terreau sécher complètement entre deux arrosages. Réduisez fortement en hiver.",
    placement: "both",
    estimatedPrice: { min: 4, max: 30 },
  },
  crassulaceae: {
    watering:
      "Arrosez modérément uniquement lorsque le terreau est sec; évitez de laisser de l’eau dans la rosette.",
    placement: "both",
    estimatedPrice: { min: 5, max: 30 },
  },
  orchidaceae: {
    watering:
      "Arrosez lorsque le substrat est presque sec, puis laissez-le bien s’égoutter. Évitez l’eau stagnante au cœur des feuilles.",
    placement: "indoor",
    estimatedPrice: { min: 10, max: 60 },
  },
  arecaceae: {
    watering:
      "Gardez le terreau légèrement humide sans le détremper. Les besoins augmentent généralement pendant la période de croissance.",
    placement: "both",
    estimatedPrice: { min: 12, max: 80 },
  },
  asparagaceae: {
    watering:
      "Laissez sécher la surface du terreau entre les arrosages et réduisez la fréquence pendant les mois froids.",
    placement: "both",
    estimatedPrice: { min: 6, max: 45 },
  },
  moraceae: {
    watering:
      "Arrosez quand la surface du terreau commence à sécher. Évitez les changements brusques d’humidité.",
    placement: "both",
    estimatedPrice: { min: 10, max: 70 },
  },
  piperaceae: {
    watering:
      "Maintenez le substrat légèrement humide et laissez sécher la surface avant d’arroser à nouveau.",
    placement: "indoor",
    estimatedPrice: { min: 8, max: 40 },
  },
  marantaceae: {
    watering:
      "Gardez le terreau uniformément légèrement humide, sans le détremper. Évitez de le laisser sécher complètement.",
    placement: "indoor",
    estimatedPrice: { min: 12, max: 50 },
  },
  polypodiaceae: {
    watering:
      "Maintenez le substrat légèrement humide et augmentez l’humidité ambiante; ne laissez pas les racines baigner dans l’eau.",
    placement: "both",
    estimatedPrice: { min: 8, max: 40 },
  },
  lamiaceae: {
    watering:
      "Arrosez lorsque la surface du sol est sèche. La plupart des espèces préfèrent un substrat bien drainé.",
    placement: "both",
    estimatedPrice: { min: 4, max: 25 },
  },
  rosaceae: {
    watering:
      "Arrosez au pied lorsque les premiers centimètres du sol sont secs; adaptez la fréquence à la saison et au climat.",
    placement: "outdoor",
    estimatedPrice: { min: 8, max: 60 },
  },
  bromeliaceae: {
    watering:
      "Arrosez modérément le substrat et renouvelez régulièrement l’eau du réservoir central si l’espèce en possède un.",
    placement: "indoor",
    estimatedPrice: { min: 10, max: 50 },
  },
  amaryllidaceae: {
    watering:
      "Arrosez pendant la croissance lorsque la surface du terreau sèche, puis réduisez ou stoppez l’arrosage en dormance.",
    placement: "both",
    estimatedPrice: { min: 6, max: 40 },
  },
};

const GENERIC_CARE: PlantCareInfo = {
  watering:
    "Les besoins varient selon l’espèce et le substrat. Vérifiez l’humidité du terreau avant d’arroser et évitez l’eau stagnante.",
  placement: "species-dependent",
  estimatedPrice: null,
};

export function getPlantCareInfo(family: string): PlantCareInfo {
  return FAMILY_CARE[family.trim().toLocaleLowerCase()] ?? GENERIC_CARE;
}

export function getPlacementLabel(placement: PlantCareInfo["placement"]) {
  switch (placement) {
    case "indoor":
      return "Plutôt plante d’intérieur";
    case "outdoor":
      return "Plutôt plante d’extérieur";
    case "both":
      return "Intérieur ou extérieur selon le climat";
    case "species-dependent":
      return "À vérifier selon l’espèce";
  }
}
