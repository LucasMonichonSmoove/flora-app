"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, Leaf, LockKeyhole, Mail, Sprout } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";

export default function LoginPage() {
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      "La connexion Supabase n’est pas encore configurée. Aucun identifiant n’a été envoyé ni enregistré.",
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-6xl justify-center px-5 pb-16 pt-8 sm:px-8 sm:pt-14">
        <section className="w-full max-w-md rounded-[2rem] border border-white bg-white p-6 shadow-[0_24px_80px_-32px_rgba(39,72,48,0.25)] sm:p-9">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-emerald-800"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Retour à Flora
          </Link>

          <div className="mt-8 flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <Leaf size={24} aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-stone-900">
            Ravie de vous revoir
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Connectez-vous pour retrouver votre collection de plantes et votre
            wishlist.
          </p>

          <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <LockKeyhole
              size={18}
              className="mt-0.5 shrink-0 text-amber-800"
              aria-hidden="true"
            />
            <p className="text-sm leading-5 text-amber-900">
              L’authentification Supabase sera activée lors de la configuration
              du projet. Ce formulaire ne transmet ni ne conserve vos
              identifiants.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">
                Adresse e-mail
              </span>
              <span className="flex h-12 items-center gap-3 rounded-xl border border-stone-200 px-3.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
                <Mail size={17} className="text-stone-400" aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="vous@exemple.fr"
                  className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">
                Mot de passe
              </span>
              <span className="flex h-12 items-center gap-3 rounded-xl border border-stone-200 px-3.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
                <LockKeyhole
                  size={17}
                  className="text-stone-400"
                  aria-hidden="true"
                />
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Votre mot de passe"
                  className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
                />
              </span>
            </label>

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              <Sprout size={17} aria-hidden="true" />
              Se connecter
            </button>
          </form>

          {notice && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-5 text-stone-700"
            >
              {notice}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-stone-500">
            Pas encore de compte ?{" "}
            <span className="font-medium text-emerald-800">
              L’inscription sera disponible avec Supabase.
            </span>
          </p>
        </section>
      </main>
    </div>
  );
}
