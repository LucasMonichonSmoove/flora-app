import { Suspense } from "react";
import Header from "@/components/Header";
import ManualPlantForm from "@/components/ManualPlantForm";

export default function AddPlantPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          🌱 Ajouter une plante
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Ajoutez une plante à votre collection, avec ou sans photo.
        </p>
        <Suspense
          fallback={
            <p className="mt-7 text-sm text-stone-500">
              Chargement du formulaire…
            </p>
          }
        >
          <ManualPlantForm />
        </Suspense>
      </main>
    </div>
  );
}
