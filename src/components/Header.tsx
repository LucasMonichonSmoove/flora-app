import { Heart, Leaf, LogIn } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2.5"
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
        className="flex items-center gap-2 sm:gap-3"
      >
        <Link
          href="/favorites"
          className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-stone-700 transition hover:bg-white hover:text-emerald-800"
        >
          <Heart size={17} aria-hidden="true" />
          <span>Favoris</span>
        </Link>
        <Link
          href="/login"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:px-4"
        >
          <LogIn size={16} aria-hidden="true" />
          <span>Connexion</span>
        </Link>
      </nav>
    </header>
  );
}
