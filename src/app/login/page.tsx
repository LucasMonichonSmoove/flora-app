"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, Leaf, LockKeyhole, Mail, Sprout } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase";

type AuthMode = "sign-in" | "sign-up";

function getSafeRedirectTarget() {
  const target = new URL(window.location.href).searchParams.get("next");
  return target?.startsWith("/") &&
    !target.startsWith("//") &&
    !target.includes("\\")
    ? target
    : "/";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        router.replace(getSafeRedirectTarget());
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) throw signUpError;
      if (data.session) {
        router.replace(getSafeRedirectTarget());
        router.refresh();
        return;
      }
      setMessage(
        "Un e-mail de confirmation vous a été envoyé. Confirmez votre adresse avant de vous connecter.",
      );
    } catch (caughtError: unknown) {
      console.error("Supabase authentication failed:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "La connexion a échoué. Réessayez.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleMode() {
    setMode((currentMode) =>
      currentMode === "sign-in" ? "sign-up" : "sign-in",
    );
    setError(null);
    setMessage(null);
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
            {mode === "sign-in" ? "Ravie de vous revoir" : "Créer un compte"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Connectez-vous pour retrouver votre collection de plantes et votre
            wishlist sur tous vos appareils.
          </p>

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
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                  autoComplete={
                    mode === "sign-in" ? "current-password" : "new-password"
                  }
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="8 caractères minimum"
                  className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-60"
            >
              <Sprout size={17} aria-hidden="true" />
              {isSubmitting
                ? "Veuillez patienter…"
                : mode === "sign-in"
                  ? "Se connecter"
                  : "Créer mon compte"}
            </button>
          </form>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-800"
            >
              {error}
            </p>
          )}
          {message && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-900"
            >
              {message}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-stone-500">
            {mode === "sign-in" ? "Pas encore de compte ?" : "Déjà un compte?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
            >
              {mode === "sign-in" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}
