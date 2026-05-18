# Reactif
Reactif est une application française développée pour chronométrer et assister les RCP (Réanimation Cardio Pulmonaire)

## Fonctionnalités
- Chronométrage par événements
- Ajout d'événements personnalisés et possibilité d'annulation
- Retours haptiques et sonores
- Export du PDF pour consultation ultérieure
- Sauvegarde et visualisation chronométrée de chaque session
- Mode jour et nuit

## Stack Technologique
Les techonologies utilisées pour développer l'application sont les suivantes :
- **Framework** : Expo
- **Runtime**: React Native 0.81.5
- **UI** : Reac Native components + react-native-paper
- **State/storage**: react-native-async-storage/async-storage
- **Audio/timers**:  expo-av, expo-keep-awake, react-native-background-timer, react-native-nitro-bg-timer, node-metronome
- **PDF/documents**: react-native-pdf, expo-print, expo-sharing
- **Assets/icons**: Expo assets, @expo/vector-icons, react-native-svg
- **CI/CD** utilisant Github Actions et Fastlane pour l'upload sur Google Play et AppStore


## Secrets et deploiement
Le déploiement continu de l'application repose sur [`
Github Actions] et [Fastlane](https://fastlane.tools/). 
L'application est déployée sur la bonne track en fonction des commits sur les branches correspondantes.

Des variables sont initialisées sur le repositoire pour s'authentifier aux différents services. Toutes doivent être configurées. 

| Nom du secret  | Description  |
|---|---|
| MATCH_GIT_BASIC_AUTHORIZATION|  PAT GitHub (*Personal Access Token*) en base 64 pour que Fastlane Match puisse cloner le répositoire de certificats. Se référer à https://docs.fastlane.tools/actions/match/ et https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens |
| MATCH_PASSWORD|  La clé qui permet de déchiffrer les ceritificats du répositoire match. Se référer à https://docs.fastlane.tools/actions/match/|
| P8_KEY_BASE_64 | Clé API Key AppStore connect en base 64 pour s'authentifier à l'App Store Connect / TestFlight et téléverser les binaires d'application. Se référer à https://docs.fastlane.tools/app-store-connect-api/ |
| P8_ISSUER_ID|  L'identifiant du propriétaire de la clé. Trouvable sur son Dashboard AppStore Connect. Se référer à https://docs.fastlane.tools/app-store-connect-api/ |
| P8_KEY_ID |  L'identifiant de la clé. Se trouve généralement dans son nom lors de sa génération. Se référer à https://docs.fastlane.tools/app-store-connect-api/ |
| BETA_APP_FEEDBACK_EMAIL |  Le mail utilisé pour les retours de bug Testflight. Inutile pour les lanes de déploiement en production. |
| ANDROID_KEYSTORE_BASE64 |  KeyStore Android pour la signature de l'application.|
| ANDROID_KEYSTORE_PASSWORD | Mot de passe pour déchiffrer le KeyStore Android.|
| ANDROID_KEYSTORE_BASE64 |  KeyStore Android pour la signature de l'application. Se référer à https://developer.android.com/studio/publish/app-signing|
| ANDROID_KEYSTORE_PASSWORD | Mot de passe pour déchiffrer le **fichier de KeyStore** Android. Se référer à https://developer.android.com/studio/publish/app-signing.|
| ANDROID_KEY_ALIAS | Alias de la KeyStore. Se référer à https://developer.android.com/studio/publish/app-signing.|
| ANDROID_KEY_PASSWORD | Mot de passe pour déchiffrer **la KeyStore** Android. Se référer https://developer.android.com/studio/publish/app-signing.|
| GOOGLE_PLAY_SERVICE_ACCOUNT_JSON | Clé du service account (à générer sur Google Cloud avec l'API Google Play Android Developer API) utilisé pour la publication sur le Google Play Store. Se référer à https://docs.fastlane.tools/actions/upload_to_play_store/|