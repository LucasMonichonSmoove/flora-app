"use client";

import { useState } from "react";
import axios from "axios";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import ResultCard from "@/components/ResultCard";
import UploadZone from "@/components/UploadZone";
import { Button } from "@/components/ui/button";
import type {
  ApiErrorResponse,
  PlantIdentificationResponse,
} from "@/types/plant";
import { addIdentificationToHistory } from "@/lib/favorites";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<PlantIdentificationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyNotice, setHistoryNotice] = useState<string | null>(null);

  function handleFileSelect(nextFile: File) {
    setFile(nextFile);
    setResult(null);
    setError(null);
  }

  async function handleIdentify() {
    if (!file) {
      setError("Ajoutez une photo avant de lancer l’analyse.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHistoryNotice(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post<PlantIdentificationResponse>(
        "/api/identify",
        formData,
        { timeout: 55_000 },
      );
      setResult(response.data);
      try {
        await addIdentificationToHistory(response.data);
      } catch (historyError: unknown) {
        console.error("Could not save identification history:", historyError);
        setHistoryNotice(
          "Identification réussie, mais son ajout à l’historique a échoué.",
        );
      }
    } catch (caughtError: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(caughtError)) {
        setError(
          caughtError.response?.data?.error ??
            (caughtError.code === "ECONNABORTED"
              ? "L’analyse a pris trop de temps. Réessayez avec une autre photo."
              : "Une erreur est survenue pendant l’analyse. Réessayez."),
        );
      } else {
        setError("Une erreur inattendue est survenue. Réessayez.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16">
        <section className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm">
            <Sparkles size={15} aria-hidden="true" />
            Votre compagnon botanique
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
            La nature a un nom.
            <span className="mt-1 block text-emerald-700">Découvrez-le.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
            Une photo suffit pour identifier une plante et en apprendre plus sur
            elle. Simplement, en quelques secondes.
          </p>
        </section>

        <section
          aria-label="Identification de plante"
          className="mx-auto mt-10 max-w-2xl rounded-[2rem] border border-white bg-white p-4 shadow-[0_24px_80px_-32px_rgba(39,72,48,0.25)] sm:mt-12 sm:p-7"
        >
          <UploadZone
            file={file}
            onFileSelect={handleFileSelect}
            onClear={() => {
              setFile(null);
              setResult(null);
              setError(null);
            }}
            onError={setError}
          />

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"
            >
              {error}
            </div>
          )}

          <Button
            className="mt-5 w-full"
            size="lg"
            onClick={handleIdentify}
            disabled={!file || isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Analyse en cours…
              </>
            ) : (
              <>
                <Leaf size={18} aria-hidden="true" />
                Analyser cette plante
                <ArrowRight className="ml-auto" size={18} aria-hidden="true" />
              </>
            )}
          </Button>

          {result && (
            <div className="mt-6">
              <ResultCard result={result} />
            </div>
          )}
          {historyNotice && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              {historyNotice}
            </p>
          )}
        </section>

        <p className="mx-auto mt-6 max-w-lg text-center text-xs leading-5 text-stone-500">
          Pour de meilleurs résultats, photographiez une feuille, une fleur ou
          un fruit nettement et en lumière naturelle.
        </p>
      </main>

      <footer className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-5 pb-8 text-xs text-stone-500">
        <Leaf size={14} aria-hidden="true" />
        Fait pour les curieux de nature
      </footer>
    </div>
  );
}
