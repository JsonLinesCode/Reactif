import { sessionStore } from "@/store/sessionStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useState } from "react";


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

  const startAdultCpr = () => {
    sessionStore.startNewSession();
    router.push("/cpr");
  };

  const startPediatricCpr = () => {
    sessionStore.startNewSession();
    router.push("/childData");
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
      <View style={{gap: 100, justifyContent: 'center', width: '100%', alignItems: 'center'}}>

      <View style={{width: '100%', alignItems: 'center'}}>
        <View style={{ height: 20 }} />
          <TouchableOpacity style={styles.menuButton} onPress={startAdultCpr}>
            <Text style={styles.menuButtonText}>RCP Adulte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={startPediatricCpr}>
            <Text style={styles.menuButtonText}>RCP pédiatrique</Text>
          </TouchableOpacity>
        </View>
        <View style={{width: '100%', alignItems: 'center'}}>
        <TouchableOpacity
            style={[styles.buttonHistory, theme === "dark" ? { backgroundColor: "#353636", borderColor: "#fff" } : {}]}
            onPress={() => router.push("/history")}
          >
          <Text style={[styles.buttonHistoryText, theme === "dark" && { color: "#fff" }]}>Historique sessions</Text>
          </TouchableOpacity>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.menuSubButton}
              onPress={() => router.push("/settings")}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.menuSubButtonText}>Paramètres</Text>
                <Feather name="settings" size={24} color="white" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.aboutButton}
              onPress={() => router.push({ pathname: "/about", params: { us: "value" } })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.menuButtonText}>A propos</Text>
                <Feather name="info" size={24} color="white" />
              </View>
            </TouchableOpacity>
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
    backgroundColor: "#007BFF",
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
  buttonHistoryText: {
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  menuSubButton: {
    backgroundColor: "#007BFF",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    },
  aboutButton: {
    backgroundColor: "#28a745",
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
  menuButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
