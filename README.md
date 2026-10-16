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
```

La clé est uniquement lue par la route serveur `/api/identify`. Ne la préfixez
pas avec `NEXT_PUBLIC_`.

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

Les pages `/login` et `/favorites` préparent l’interface pour une future
connexion Supabase. Aucune authentification n’est encore branchée : le
formulaire de connexion n’envoie et ne conserve pas les identifiants.

Les plantes ajoutées à la wishlist sont stockées dans le `localStorage` du
navigateur utilisé. Elles ne sont pas synchronisées entre appareils et ne sont
pas liées à un compte ; Supabase pourra remplacer ce stockage local.

Les conseils d’arrosage et d’exposition sont des indications générales basées
sur la famille botanique. Les prix affichés sont des estimations en euros, pas
des prix issus d’un catalogue en temps réel. Vérifiez les besoins de l’espèce
et les prix locaux avant achat.
