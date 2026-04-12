import { router, Stack } from "expo-router";
import React from "react";
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { sessionStore } from "@/store/sessionStore";

export default function CprEndFirstPage() {
  const theme = sessionStore.theme;

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== "android") return;
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true,
      );
      return () => {
        subscription.remove();
      };
    }, []),
  );

  const handleDeath = async () => {
    await sessionStore.saveCurrentSession("Décès");
    router.push({ pathname: "/cprEnd", params: { mode: "death" } });
  };

  const handleRacs = () => {
    sessionStore.logEvent("event", "RACS");
    router.push({ pathname: "/cprEnd", params: { mode: "racs" } });
  };

  const handleInterventionEnd = async () => {
    await sessionStore.saveCurrentSession("Arrêt définitif");
    router.push({ pathname: "/cprEnd", params: { mode: "death" } });
  };

  const bgStyle =
    theme === "dark"
      ? { backgroundColor: "#353636" }
      : { backgroundColor: "#fff" };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.contentContainer}>
        <Text style={[styles.title, theme === "dark" ? { color: "#ccc" } : {}]}>
          Fin de RCP
        </Text>
        <Text
          style={[styles.subtitle, theme === "dark" ? { color: "#ddd" } : {}]}
        >
          Résultat de la réanimation
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.outlineButton, styles.deathButton]}
            onPress={handleDeath}
          >
            <Text style={[styles.buttonText, styles.deathText]}>Décès</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={handleRacs}
          >
            <Text style={[styles.buttonText]}>RACS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={handleInterventionEnd}
          >
            <Text style={[styles.buttonText]}>
              Fin d'intervention
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 40,
    color: "#666",
  },
  buttonGroup: {
    width: "100%",
    gap: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000"
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  deathButton: {
    borderColor: "#333",
  },
  racsButton: {
    borderColor: "#28a745",
  },
  stopButton: {
    borderColor: "#d9534f",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  deathText: {
    color: "#333",
  },
  racsText: {
    color: "#28a745",
  },
  stopText: {
    color: "#d9534f",
  },
});
