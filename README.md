# Reactif
![Licence: CeCILL](https://img.shields.io/badge/Licence-CeCILL--2.1-blue.svg)

Reactif est une application mobile (iOS/Android) d'assistance au suivi d'une RCP (Réanimation Cardio-Pulmonaire), développée avec Expo/React Native.


## Sommaire

- [Reactif](#reactif)
  - [Sommaire](#sommaire)
  - [Fonctionnalités](#fonctionnalités)
  - [Stack technique](#stack-technique)
  - [Prérequis](#prérequis)
  - [Installation et lancement](#installation-et-lancement)
  - [Structure du projet](#structure-du-projet)
  - [Données et persistance](#données-et-persistance)
  - [Build et déploiement](#build-et-déploiement)
  - [Secrets CI/CD](#secrets-cicd)
    - [Table détaillée des secrets](#table-détaillée-des-secrets)
  - [Points d'attention](#points-dattention)
  - [Documentation complémentaire](#documentation-complémentaire)

## Fonctionnalités

- Démarrage de session RCP adulte, pédiatrique ou néonatale
- Chronométrage des événements principaux:
  - analyse/choc
  - adrénaline
  - cordarone
  - événements libres (via modal)
- Annulation du dernier événement
- Rappels sonores, retours haptiques et métronome
- Paramétrage des intervalles et alertes
- Paramétrage des sons (aperçu et reset)
- Historique local des sessions
- Export PDF du récapitulatif de session
- Écrans d'aides cognitives et ressources
- Thème clair/sombre

## Stack technique

- Framework: Expo (`~54.0.34`)
- Runtime: React Native (`0.81.5`), React (`19.1.0`)
- Navigation: Expo Router
- UI: React Native + react-native-paper
- Stockage local: `@react-native-async-storage/async-storage`
- Audio/timers: `expo-av`, `expo-keep-awake`, `node-metronome`
- PDF/partage: `expo-print`, `expo-sharing`, `react-native-pdf`
- CI/CD: GitHub Actions + Fastlane

## Prérequis

- Node.js 20.x (aligné avec GitHub Actions)
- npm 10+
- Expo CLI via `npx expo`
- Pour build native local (`expo run:*`) uniquement:
  - iOS: macOS + Xcode + CocoaPods
  - Android: JDK 17 + Android SDK

## Installation et lancement

```bash
npm ci
npx expo start
```

Depuis le serveur Expo:

- Taper `i` pour iOS Simulator
- Taper `a` pour Android Emulator
- Scanner le QR code avec Expo Go (si compatible)

Lancer avec génération native locale (dev build):

```bash
npm run ios
npm run android
```

Autres commandes utiles:

```bash
npm run web
npm run lint
```

## Structure du projet

```text
app/           Routes Expo Router (écrans)
components/    Composants UI réutilisables
controllers/   Logique métier (session/audio/métronome)
hooks/         Hooks applicatifs (paramètres RCP)
models/        Types métier (session, événements)
store/         Store de session en mémoire + persistance historique
utils/         Fonctions utilitaires (session, sons)
assets/        Images, icônes, sons, documents
fastlane/      Lanes Fastlane iOS/Android
.github/       Workflows CI/CD
```

## Données et persistance

Persistance locale via AsyncStorage:

- `@cpr_session_history`: historique des sessions
- `@cpr_settings_shock_duration`
- `@cpr_settings_adrenaline_duration`
- `@cpr_settings_warning_seconds`
- `@cpr_settings_end_button_short_tap`
- `@cpr_settings_preview_max_volume`
- `@cpr_settings_sound_choices`

Le modèle principal est défini dans `models/session.ts`:

- `CprSession`: `id`, `startTime`, `endTime`, `mode`, `pediatricData`, `events`
- `CprEvent`: `shock | analysis | cordarone | adrenaline | event | cpr_end`

## Build et déploiement

Les déploiements automatiques sont déclenchés sur push vers la branche:

- `beta-releases`

Pipelines:

- iOS TestFlight: `.github/workflows/cd_ios_internal.yml`
- Android Internal Track: `.github/workflows/cd_android_internal.yml`

Les lanes Fastlane utilisées:

- `fastlane ios testflight_release`
- `fastlane android internal_release`

## Secrets CI/CD

Le déploiement continu de l'application repose sur GitHub Actions et Fastlane.
L'application est déployée sur la bonne track en fonction des commits sur les branches correspondantes.


### Table détaillée des secrets

| Nom du secret | Description |
|---|---|
| `MATCH_GIT_BASIC_AUTHORIZATION` | PAT GitHub (*Personal Access Token*) en base 64 pour que Fastlane Match puisse cloner le répertoire de certificats. Références: https://docs.fastlane.tools/actions/match/ et https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens |
| `MATCH_PASSWORD` | Clé qui permet de déchiffrer les certificats du répertoire match. Référence: https://docs.fastlane.tools/actions/match/ |
| `P8_KEY_BASE_64` | Clé API App Store Connect encodée en base 64 pour l'authentification à App Store Connect / TestFlight et le téléversement des binaires. Référence: https://docs.fastlane.tools/app-store-connect-api/ |
| `P8_ISSUER_ID` | Identifiant du propriétaire de la clé App Store Connect. Référence: https://docs.fastlane.tools/app-store-connect-api/ |
| `P8_KEY_ID` | Identifiant de la clé App Store Connect. Référence: https://docs.fastlane.tools/app-store-connect-api/ |
| `BETA_APP_FEEDBACK_EMAIL` | Email utilisé pour les retours de bug TestFlight. |
| `ANDROID_KEYSTORE_BASE64` | Keystore Android pour la signature de l'application. Référence: https://developer.android.com/studio/publish/app-signing |
| `ANDROID_KEYSTORE_PASSWORD` | Mot de passe du fichier keystore Android. Référence: https://developer.android.com/studio/publish/app-signing |
| `ANDROID_KEY_ALIAS` | Alias du keystore Android. Référence: https://developer.android.com/studio/publish/app-signing |
| `ANDROID_KEY_PASSWORD` | Mot de passe de la clé Android. Référence: https://developer.android.com/studio/publish/app-signing |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Clé du service account (Google Cloud + Google Play Android Developer API) utilisée pour la publication sur le Google Play Store. Référence: https://docs.fastlane.tools/actions/upload_to_play_store/ |

## Points d'attention
- Le thème est actuellement maintenu en mémoire via `sessionStore` (non persisté entre redémarrages).


## Documentation complémentaire

- Architecture applicative: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Déploiement et exploitation: [docs/OPERATIONS.md](docs/OPERATIONS.md)
