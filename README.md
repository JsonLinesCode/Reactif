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
