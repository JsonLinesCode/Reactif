# Architecture Reactif

## Vue d'ensemble

Reactif est une application Expo Router orientée "session RCP":

1. démarrage d'une session
2. saisie d'événements horodatés
3. clôture de session
4. visualisation/export du récapitulatif

L'état métier repose sur `sessionStore` et est consommé par les écrans et contrôleurs.

## Couches principales

### 1) Routing et écrans (`app/`)

- `index.tsx`: écran d'accueil et choix du mode (adulte/pédiatrique/néonatal)
- `cpr.tsx`: écran principal de chronométrage et d'actions
- `cprEndFirstPage.tsx` + `cprEnd.tsx`: fin de session, RACS/décès, export PDF
- `history.tsx` + `historyDetail.tsx`: historique des sessions
- `settings.tsx` + `soundSettings.tsx`: configuration timers/sons
- `aideCognitive.tsx`, `aideRespiratoire.tsx`, `ressources.tsx`: contenu d'aide

### 2) Store (`store/`)

- `sessionStore.ts`:
  - détient la session courante
  - gère l'historique local
  - expose des méthodes de mutation (`startNewSession`, `logEvent`, `saveCurrentSession`, `cancelLast`)
  - notifie les vues via un mécanisme de subscription

### 3) Contrôleurs (`controllers/`)

- `SessionController.ts`:
  - façade métier utilisée par les écrans
  - journalise les événements métier
  - orchestre certains appels audio
- `SoundController.ts`:
  - lecture des sons
  - sélection/réinitialisation des sons personnalisés
- `MetronomeController.ts`:
  - gestion du métronome (BPM, mute, playback)

### 4) Configuration (`hooks/`, `utils/`)

- `useCprSettings.ts`: chargement/sauvegarde des paramètres de timer
- `utils/soundChoices.ts`: slots sonores + options + stockage
- `utils/sessionUtils.ts`: helpers de formatage et calculs de synthèse

### 5) Modèle (`models/`)

- `session.ts`:
  - `CprSession`
  - `CprEvent`
  - `PediatricData`

## Flux métier principal

1. `sessionStore.startNewSession(mode)` depuis l'accueil.
2. Pendant la RCP, les actions utilisateur appellent `sessionController` qui écrit des `CprEvent` dans le store.
3. À la fin, `sessionStore.saveCurrentSession(reason)` ajoute `endTime` et un événement `cpr_end`.
4. La session est ajoutée à l'historique AsyncStorage.
5. Les écrans d'historique lisent et affichent ces sessions; export PDF possible depuis l'écran de fin.

## Persistance

Stockage local unique via AsyncStorage:

- historique de session
- paramètres de timing
- préférences audio

Il n'y a pas de backend ni de synchronisation distante dans cette version.

## UX/Système

- `useKeepAwake()` actif dans le layout racine
- blocage du bouton retour Android sur certains écrans critiques
- thème clair/sombre géré via `sessionStore.theme`

## Evolutions recommandées

- extraire la liste des clés AsyncStorage dans un module centralisé
- persister le thème entre redémarrages
- ajouter une couche de tests unitaires pour `sessionStore` et `sessionUtils`
- ajouter un schéma de version pour la migration de l'historique
