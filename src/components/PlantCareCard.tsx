import {
  Droplets,
  Leaf,
  Sun,
  Thermometer,
  Wind,
  PawPrint,
  Star,
} from "lucide-react";
import type { CareGuide } from "@/types/plant";
import { getPlacementLabel, getPlantCareInfo } from "@/lib/plant-care";

interface PlantCareCardProps {
  guide: CareGuide;
  family: string;
}

const CARE_ITEMS = [
  { key: "sunlight", label: "Exposition", icon: Sun },
  { key: "watering", label: "Arrosage", icon: Droplets },
  { key: "temperature", label: "Température", icon: Thermometer },
  { key: "humidity", label: "Humidité", icon: Wind },
  { key: "toxicity", label: "Toxicité", icon: PawPrint },
  { key: "difficulty", label: "Difficulté", icon: Star },
] as const;

export default function PlantCareCard({ guide, family }: PlantCareCardProps) {
  const plantCare = getPlantCareInfo(family);

  return (
    <section className="mt-5 rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm sm:p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
        <Leaf size={17} className="text-emerald-700" aria-hidden="true" />
        Conseils d’entretien
      </h3>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {CARE_ITEMS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-start gap-3">
            <Icon
              size={18}
              className="mt-0.5 shrink-0 text-emerald-700"
              aria-hidden="true"
            />
            <div>
              <dt className="text-xs font-medium text-stone-500">{label}</dt>
              <dd className="mt-1 text-sm leading-5 text-stone-700">
                {guide[key]}
              </dd>
            </div>
          </div>
        ))}
      </dl>
      <div className="mt-4 grid gap-3 border-t border-stone-100 pt-4 sm:grid-cols-2">
        <p className="text-sm leading-5 text-stone-700">
          <span className="font-medium text-stone-500">Intérieur / extérieur · </span>
          {getPlacementLabel(plantCare.placement)}
        </p>
        <p className="text-sm leading-5 text-stone-700">
          <span className="font-medium text-stone-500">Prix indicatif · </span>
          {plantCare.estimatedPrice
            ? `${plantCare.estimatedPrice.min} à ${plantCare.estimatedPrice.max} €`
            : "À vérifier chez un vendeur local"}
        </p>
      </div>
      <p className="mt-4 border-t border-stone-100 pt-3 text-xs leading-5 text-stone-500">
        Repères généraux uniquement : vérifiez les besoins précis de votre
        variété et les conditions chez vous.
      </p>
    </section>
  );
}
