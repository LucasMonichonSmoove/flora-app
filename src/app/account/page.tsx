"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/favorites";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let isActive = true;
    async function loadAccount() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.replace("/login?next=%2Faccount");
          return;
        }
        if (isActive) setUser(currentUser);
      } catch (caughtError: unknown) {
        console.error("Could not load account:", caughtError);
        if (isActive) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger votre compte.",
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }
    void loadAccount();
    return () => {
      isActive = false;
    };
  }, [router]);

  async function handleSignOut() {
    setIsSigningOut(true);
    setError(null);
    try {
      const { error: signOutError } = await createClient().auth.signOut();
      if (signOutError) throw signOutError;
      router.replace("/");
      router.refresh();
    } catch (caughtError: unknown) {
      console.error("Could not sign out:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "La déconnexion a échoué.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-emerald-800"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à l’identification
        </Link>
        <section className="mt-6 rounded-3xl border border-white bg-white p-6 shadow-sm sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <UserRound size={23} aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-stone-900">
            Mon compte
          </h1>
          {isLoading ? (
            <p className="mt-3 text-sm text-stone-500">
              Chargement du compte…
            </p>
          ) : user ? (
            <>
              <p className="mt-3 text-sm text-stone-600">
                Connecté avec <strong>{user.email}</strong>
              </p>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
              >
                <LogOut size={16} aria-hidden="true" />
                {isSigningOut ? "Déconnexion…" : "Se déconnecter"}
              </button>
            </>
          ) : (
            <p className="mt-3 text-sm text-stone-600">
              Connectez-vous pour accéder à votre compte.
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              {error}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
