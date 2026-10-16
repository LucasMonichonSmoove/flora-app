"use client";

import { useEffect, useState } from "react";
import { Heart, History, Leaf, LogIn, LogOut, Sprout, UserRound } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/favorites";
import { createClient } from "@/lib/supabase";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    let unsubscribe = () => {};

    try {
      const supabase = createClient();
      void getCurrentUser().then((user) => {
        if (!isActive) return;
        setEmail(user?.email ?? null);
      }).catch((error: unknown) => {
        console.error("Could not read Supabase session:", error);
      });

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (isActive) setEmail(session?.user.email ?? null);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch (error: unknown) {
      console.error("Supabase client is unavailable:", error);
    }

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError(null);
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      setEmail(null);
    } catch (error: unknown) {
      console.error("Could not sign out:", error);
      setSignOutError(
        error instanceof Error
          ? error.message
          : "La déconnexion a échoué.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  const navigation = [
    { href: "/", label: "Identification", icon: Leaf },
    { href: "/favorites", label: "Favoris", icon: Heart },
    { href: "/collection", label: "Ma collection", icon: Sprout },
    { href: "/history", label: "Historique", icon: History },
    { href: "/account", label: "Mon compte", icon: UserRound },
  ] as const;

  return (
    <header className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-8 sm:py-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2.5"
          aria-label="Flora, accueil"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm shadow-emerald-900/15">
            <Leaf size={21} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-stone-900">
            Flora
          </span>
        </Link>
        <nav
          aria-label="Navigation principale"
          className="flex min-w-0 items-center justify-end gap-0.5 overflow-x-auto sm:gap-1"
        >
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-2 text-xs font-medium text-stone-700 transition hover:bg-white hover:text-emerald-800 sm:px-2.5 sm:text-sm"
            >
              <Icon size={16} aria-hidden="true" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          ))}
          {email ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60 sm:text-sm"
            >
              <LogOut size={15} aria-hidden="true" />
              <span className="hidden xl:inline">
                {isSigningOut ? "Déconnexion…" : "Déconnexion"}
              </span>
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-emerald-700 px-2.5 text-xs font-semibold text-white transition hover:bg-emerald-800 sm:px-3 sm:text-sm"
            >
              <LogIn size={15} aria-hidden="true" />
              <span>Connexion</span>
            </Link>
          )}
        </nav>
      </div>
      {email && (
        <p className="mt-1 truncate text-right text-[11px] text-stone-500">
          {email}
        </p>
      )}
      {signOutError && (
        <p role="alert" className="mt-1 text-right text-xs text-rose-700">
          {signOutError}
        </p>
      )}
    </header>
  );
}
