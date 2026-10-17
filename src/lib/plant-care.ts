import type { CareGuide, PlantCareInfo } from "@/types/plant";

const CARE_GUIDES: Record<string, CareGuide> = {
  monstera: {
    sunlight: "Lumière vive indirecte; évitez le soleil direct brûlant.",
    watering: "Arrosez quand les 2 à 3 cm supérieurs du terreau sont secs.",
    temperature: "18 à 30 °C; protégez-la des courants d’air froids.",
    humidity: "Humidité moyenne à élevée, idéalement au-dessus de 50 %.",
    toxicity: "Toxique pour les chats et les chiens si elle est ingérée.",
    difficulty: "Facile",
  },
  orchid: {
    sunlight: "Lumière vive indirecte, près d’une fenêtre orientée est.",
    watering:
      "Arrosez quand les racines deviennent grisâtres et laissez égoutter.",
    temperature: "18 à 27 °C le jour, un peu plus frais la nuit.",
    humidity: "Humidité élevée, autour de 50 à 70 %, avec bonne ventilation.",
    toxicity: "Généralement considérée comme non toxique pour les animaux.",
    difficulty: "Intermédiaire",
  },
  lavender: {
    sunlight: "Plein soleil, au moins 6 heures par jour.",
    watering:
      "Arrosez peu une fois installée; laissez sécher le sol entre les arrosages.",
    temperature: "Rustique selon la variété; apprécie les étés chauds et secs.",
    humidity: "Air sec et emplacement bien ventilé.",
    toxicity: "Peut être toxique pour les chats et les chiens si ingérée.",
    difficulty: "Facile",
  },
  rose: {
    sunlight: "Plein soleil, idéalement 6 heures ou plus par jour.",
    watering:
      "Arrosez au pied lorsque la surface du sol sèche, plus souvent en été.",
    temperature: "La plupart des rosiers supportent les saisons tempérées.",
    humidity: "Humidité extérieure habituelle; privilégiez une bonne circulation d’air.",
    toxicity: "Non toxique; attention aux épines.",
    difficulty: "Intermédiaire",
  },
  aloe: {
    sunlight: "Lumière vive; acclimatez-la avant une exposition directe.",
    watering:
      "Laissez sécher complètement le substrat avant d’arroser à nouveau.",
    temperature: "18 à 27 °C; évitez les températures proches du gel.",
    humidity: "Air sec à normal; un substrat très drainant est essentiel.",
    toxicity:
      "Le gel interne est différent du latex; la plante peut être toxique pour les animaux.",
    difficulty: "Facile",
  },
  ficus: {
    sunlight: "Lumière vive indirecte; évitez les déplacements répétés.",
    watering:
      "Arrosez lorsque les premiers centimètres du terreau sont secs.",
    temperature: "18 à 27 °C, sans courant d’air froid.",
    humidity: "Humidité ambiante; apprécie une atmosphère modérément humide.",
    toxicity: "La sève peut être irritante et la plante toxique pour les animaux.",
    difficulty: "Intermédiaire",
  },
  sansevieria: {
    sunlight: "De la lumière indirecte à la mi-ombre.",
    watering:
      "Arrosez rarement et laissez sécher entièrement le substrat.",
    temperature: "15 à 29 °C; gardez-la à l’abri du gel.",
    humidity: "Air sec à normal.",
    toxicity: "Toxique pour les chats et les chiens si elle est ingérée.",
    difficulty: "Très facile",
  },
  pothos: {
    sunlight: "Lumière indirecte moyenne à vive; tolère la mi-ombre.",
    watering:
      "Laissez sécher les premiers centimètres de terreau entre les arrosages.",
    temperature: "18 à 29 °C; évitez le froid.",
    humidity: "Humidité ambiante à élevée.",
    toxicity: "Toxique pour les chats et les chiens si elle est ingérée.",
    difficulty: "Très facile",
  },
  philodendron: {
    sunlight: "Lumière vive indirecte; protégez les feuilles du soleil direct.",
    watering:
      "Arrosez lorsque les premiers centimètres du terreau sont secs.",
    temperature: "18 à 29 °C, à l’abri des courants d’air froids.",
    humidity: "Humidité moyenne à élevée.",
    toxicity: "Toxique pour les chats et les chiens si elle est ingérée.",
    difficulty: "Facile",
  },
};

const GENERIC_GUIDE: CareGuide = {
  sunlight: "À adapter à l’espèce; évitez de l’exposer brutalement au soleil direct.",
  watering:
    "Vérifiez l’humidité du terreau avant d’arroser et évitez l’eau stagnante.",
  temperature: "Consultez les besoins spécifiques de l’espèce et protégez-la du gel.",
  humidity: "À adapter à l’espèce; une bonne circulation d’air reste importante.",
  toxicity: "Information non vérifiée; gardez la plante hors de portée des animaux.",
  difficulty: "À déterminer selon l’espèce",
};

const FAMILY_CARE: Record<string, PlantCareInfo> = {
  araceae: {
    watering: "Arrosez lorsque la surface du terreau commence à sécher.",
    placement: "indoor",
    estimatedPrice: { min: 8, max: 50 },
  },
  orchidaceae: {
    watering: "Arrosez quand les racines deviennent grisâtres, puis égouttez.",
    placement: "indoor",
    estimatedPrice: { min: 10, max: 60 },
  },
  lamiaceae: {
    watering: "Arrosez modérément; la plupart préfèrent un sol bien drainé.",
    placement: "outdoor",
    estimatedPrice: { min: 4, max: 30 },
  },
  rosaceae: {
    watering: "Arrosez au pied quand la surface du sol est sèche.",
    placement: "outdoor",
    estimatedPrice: { min: 8, max: 60 },
  },
  asphodelaceae: {
    watering: "Laissez sécher complètement le substrat entre les arrosages.",
    placement: "indoor",
    estimatedPrice: { min: 5, max: 35 },
  },
};

const GENERIC_FAMILY_CARE: PlantCareInfo = {
  watering: "Vérifiez l’humidité du terreau avant d’arroser.",
  placement: "species-dependent",
  estimatedPrice: null,
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase();
}

export function getCareGuide(
  scientificName: string,
  commonName: string,
): CareGuide {
  const names = normalize(`${scientificName} ${commonName}`);
  const speciesMatchers: Array<[RegExp, CareGuide]> = [
    [/monstera/, CARE_GUIDES.monstera],
    [/orchid|orchidee|phalaenopsis/, CARE_GUIDES.orchid],
    [/lavand|lavender/, CARE_GUIDES.lavender],
    [/rosa\b|rose\b/, CARE_GUIDES.rose],
    [/aloe|aloes/, CARE_GUIDES.aloe],
    [/ficus|figuier/, CARE_GUIDES.ficus],
    [/sansevieria|snake.?plant/, CARE_GUIDES.sansevieria],
    [/pothos|epipremnum/, CARE_GUIDES.pothos],
    [/philodendron/, CARE_GUIDES.philodendron],
  ];
  const match = speciesMatchers.find(([pattern]) => pattern.test(names));
  if (match) return match[1];

  return GENERIC_GUIDE;
}

export function getPlantCareInfo(family: string): PlantCareInfo {
  return FAMILY_CARE[normalize(family)] ?? GENERIC_FAMILY_CARE;
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

export { getDaysSinceWatering } from "@/lib/watering";
