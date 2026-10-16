# Flora

Flora est un MVP responsive d’identification botanique. Une photo est envoyée
à une route serveur Next.js, qui interroge l’API Pl@ntNet sans exposer la clé au
navigateur.

## Prérequis

- Node.js 20 ou plus récent
- npm
- Une clé API Pl@ntNet

## Installation

```bash
npm install
```

## Configuration

Copiez le modèle d’environnement puis ajoutez votre clé Pl@ntNet :

```bash
cp .env.example .env.local
```

Dans `.env.local`, renseignez :

```env
PLANTNET_API_KEY=votre_cle_api
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ou_publishable
```

La clé est uniquement lue par la route serveur `/api/identify`. Ne la préfixez
pas avec `NEXT_PUBLIC_`. Les deux variables Supabase publiques sont utilisées
par le client et le proxy SSR. Ne placez jamais une clé `service_role` dans le
frontend ou dans une variable `NEXT_PUBLIC_*`.

## Configuration Supabase

1. Créez un projet Supabase et renseignez son URL et sa clé anon/publishable
   dans `.env.local`.
2. Dans l’éditeur SQL du tableau de bord, exécutez le script complet
   [`supabase/schema.sql`](./supabase/schema.sql). Il crée les tables
   `favorites`, `plants_collection` et `identification_history`, leurs index,
   contraintes et politiques RLS.
3. Dans **Authentication → Providers**, activez Email. Configurez la
   confirmation par e-mail et l’URL de redirection de votre application.
4. Redémarrez le serveur après toute modification de `.env.local`.

## Lancement

```bash
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000).

## Utilisation

Choisissez ou déposez une photo JPEG/PNG (10 Mo maximum), puis lancez
l’identification. Sur mobile, le sélecteur peut ouvrir l’appareil photo. Le
résultat présente le nom commun (si fourni par Pl@ntNet), le nom scientifique,
la famille, le score de confiance et une fiche Wikipédia si elle est disponible.

## Connexion et wishlist

La page `/login` permet de créer un compte et de se connecter par e-mail/mot de
passe avec Supabase Auth. Les sessions sont conservées via cookies SSR et
rafraîchies par le proxy Next.js. La page `/account` affiche le compte et permet
de se déconnecter.

Les favoris sont privés par utilisateur et disponibles sur `/favorites`.
L’ajout depuis une fiche d’identification demande une connexion.

## Collection et historique

- `/collection` répertorie les plantes possédées. Depuis une identification,
  « Je possède cette plante » ouvre le formulaire d’ajout. Les entrées peuvent
  être modifiées/supprimées et leur arrosage marqué.
- `/history` affiche les identifications effectuées lorsque l’utilisateur est
  connecté. L’image enregistrée est l’illustration Wikipédia disponible, pas
  la photo originale envoyée pour l’identification.
- Les deux fonctionnalités utilisent les tables Supabase créées par le script
  SQL et protégées par RLS.

## Conseils d’entretien

Les conseils d’exposition, d’arrosage, de température, d’humidité, de toxicité
et de difficulté proviennent d’une base locale indicative couvrant notamment
Monstera, orchidée, lavande, rose, Aloe vera, Ficus, Sansevieria, Pothos et
Philodendron. Les prix éventuels sont des estimations, pas des tarifs en temps
réel. Vérifiez les besoins de la variété et les prix locaux avant achat.
