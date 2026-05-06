import { sessionStore } from "@/store/sessionStore";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const [theme, setTheme] = useState(sessionStore.theme);

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return () => unsubscribe();
  }, []);

  const isDark = theme === "dark";
  const bgStyle = { backgroundColor: isDark ? "#353636" : "#fff" };
  const outlineButtonStyle = isDark
    ? { backgroundColor: "#353636", borderColor: "#fff" }
    : { backgroundColor: "#fff", borderColor: "#007BFF" };
  const outlineTextStyle = isDark ? { color: "#fff" } : { color: "#007BFF" };

  const startAdultCpr = () => {
    sessionStore.startNewSession();
    router.push("/cpr");
  };

  const startPediatricCpr = () => {
    sessionStore.startNewSession();
    router.push("/childData");
  };
  const startAideCognitive = () => {
    sessionStore.startNewSession();
    router.push("/aide-cognitive");
  };
  return (
    <View id="coucou" style={[styles.container, bgStyle]}>
      <Image
        source={
          isDark
            ? require("@/assets/images/logoWhite.png")
            : require("@/assets/images/logo.png")
        }
        style={styles.logo}
      />
      <View
        style={{
          gap: 100,
          justifyContent: "center",
          width: "100%",
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", alignItems: "center" }}>
          <View style={{ height: 20 }} />
          <TouchableOpacity
            style={[styles.menuButton, outlineButtonStyle]}
            onPress={startAdultCpr}
          >
            <Text style={[styles.menuButtonText, outlineTextStyle]}>
              RCP ADULTE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuButton, outlineButtonStyle]}
            onPress={startPediatricCpr}
          >
            <Text style={[styles.menuButtonText, outlineTextStyle]}>
              RCP PEDIATRIQUE
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: "100%", alignItems: "center" }}>
          <TouchableOpacity
            style={[
              styles.buttonHistory,
              styles.bottomAideButton,
              outlineButtonStyle,
            ]}
            onPress={startAideCognitive}
          >
            <Text style={[styles.buttonHistoryText, outlineTextStyle]}>
              AIDE COGNITIVE
            </Text>
          </TouchableOpacity>
          <View style={styles.bottomActionRow}>
            <TouchableOpacity
              style={[
                styles.buttonHistory,
                styles.bottomHistoryButton,
                outlineButtonStyle,
              ]}
              onPress={() => router.push("/history")}
            >
              <Text style={[styles.buttonHistoryText, outlineTextStyle]}>
                Historique
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.buttonHistory,
                styles.bottomSettingsButton,
                outlineButtonStyle,
              ]}
              onPress={() => router.push("/settings")}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Feather
                  name="settings"
                  size={30}
                  color={isDark ? "#fff" : "#007BFF"}
                />
              </View>
            </TouchableOpacity>
            <View style={{flexDirection: "column", gap: 40}}></View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 300,
    height: 200,
    marginBottom: 10,
    resizeMode: "contain",
  },
  menuButton: {
    backgroundColor: "#fff",
    borderColor: "#007BFF",
    borderWidth: 2,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonHistory: {
    paddingVertical: 18,
    backgroundColor: "#fff",
    borderColor: "#007BFF",
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 0,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  bottomActionRow: {
    width: "100%",
    maxWidth: 400,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  bottomHistoryButton: {
    flex: 1,
    height: 62,
    justifyContent: "center",
  },
  bottomAideButton: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 12,
    height: 62,
    justifyContent: "center",
  },
  bottomSettingsButton: {
    width: 74,
    maxWidth: 74,
    height: 62,
    justifyContent: "center",
    marginBottom: 0,
    paddingVertical: 0,
  },
  menuSubButton: {
    backgroundColor: "#fff",
    borderColor: "#007BFF",
    borderWidth: 2,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
    maxWidth: 160,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  menuSubButtonText: {
    color: "#007BFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  menuButtonText: {
    color: "#007BFF",
    fontSize: 22,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  buttonHistoryText: {
    color: "#007BFF",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
    lineHeight: 22,
    includeFontPadding: false,
  },
  mainButtons: {
    width: "100%",
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    height: "100%",
    paddingTop: 10,
    padding: 20,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
