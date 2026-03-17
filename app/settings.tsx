import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomSwitch from "@/components/CustomSwitch";
import { useCprSettings } from "@/hooks/useCprSettings";
import { sessionStore } from "@/store/sessionStore";

export default function SettingsScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState(sessionStore.theme);

  useEffect(() => {
    // Subscribe to sessionStore changes
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return () => unsubscribe();
  }, []);

  const {
    shockDuration,
    adrenalineDuration,
    warningSeconds,
    endButtonShortTap,
    updateSettings,
    setEndButtonShortTap,
    resetSettings,
    loading,
  } = useCprSettings();

  const [shockInput, setShockInput] = useState("");
  const [adrenalineInput, setAdrenalineInput] = useState("");
  const [warningInput, setWarningInput] = useState("");

  useEffect(() => {
    if (!loading) {
      setShockInput(Math.round(shockDuration / 60).toString());
      setAdrenalineInput(Math.round(adrenalineDuration / 60).toString());
      setWarningInput(warningSeconds.toString());
    }
  }, [loading, shockDuration, adrenalineDuration, warningSeconds]);

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme === "light" ? "#fff" : "#353636" },
        ]}
      >
        <Text style={{ color: theme === "light" ? "#353636" : "#fff" }}>
          Chargement...
        </Text>
      </View>
    );
  }

  const handleDurationChange = (key: "shock" | "adrenaline", text: string) => {
    if (key === "shock") {
      setShockInput(text);
    } else {
      setAdrenalineInput(text);
    }

    const value = parseFloat(text);
    if (!isNaN(value)) {
      // Convert minutes to seconds for storage
      updateSettings(key, Math.round(value * 60));
    }
  };

  const handleWarningChange = (text: string) => {
    setWarningInput(text);

    const value = parseInt(text, 10);
    if (!isNaN(value)) {
      updateSettings("warning", value);
    }
  };

  const onSelectSwitch = async (val: number) => {
    const newTheme = val === 1 ? "light" : "dark";
    await sessionStore.setTheme(newTheme);
  };

  const isDark = theme === "dark";
  const bgStyle = { backgroundColor: isDark ? "#353636" : "#fff" };
  const textStyle = { color: isDark ? "#fff" : "#000" };
  const inputBgStyle = {
    backgroundColor: isDark ? "#222121" : "#f9f9f9",
    borderColor: isDark ? "#555" : "#ccc",
  };
  const sectionTitleColor = { color: isDark ? "#ddd" : "#333" };
  const labelColor = { color: isDark ? "#aaa" : "#555" };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      <View
        style={[styles.header, { borderBottomColor: isDark ? "#333" : "#eee" }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Text style={[styles.title, textStyle]}>Paramètres</Text>
      </View>

      <View style={styles.body}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.sectionTitle, sectionTitleColor]}>
            Durées par défaut (minutes)
          </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, labelColor]}>Analyse (Intervalle)</Text>
          <View style={[styles.inputWrapper, inputBgStyle]}>
            <TextInput
              style={[styles.input, textStyle]}
              keyboardType="numeric"
              value={shockInput}
              onChangeText={(text) => handleDurationChange("shock", text)}
            />
            <Text style={styles.unit}>min</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, labelColor]}>
            Adrénaline (Intervalle)
          </Text>
          <View style={[styles.inputWrapper, inputBgStyle]}>
            <TextInput
              style={[styles.input, textStyle]}
              keyboardType="numeric"
              value={adrenalineInput}
              onChangeText={(text) => handleDurationChange("adrenaline", text)}
            />
            <Text style={styles.unit}>min</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, labelColor]}>Alerte avant fin</Text>
          <View style={[styles.inputWrapper, inputBgStyle]}>
            <TextInput
              style={[styles.input, textStyle]}
              keyboardType="numeric"
              value={warningInput}
              onChangeText={handleWarningChange}
            />
            <Text style={styles.unit}>sec</Text>
          </View>
        </View>

        <Text
          style={[styles.sectionTitle, sectionTitleColor, { marginTop: 20 }]}
        >
          Thème de l&#39;application
        </Text>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <CustomSwitch
            selectionMode={theme === "light" ? 1 : 2}
            roundCorner={true}
            option1={"Clair"}
            option2={"Sombre"}
            onSelectSwitch={onSelectSwitch}
            selectionColor={"#007BFF"}
          />
        </View>

        <Text style={[styles.sectionTitle, sectionTitleColor]}>
          Sécurité - Fin de la RCP
        </Text>
        <TouchableOpacity
          style={[
            styles.toggleRow,
            { borderColor: isDark ? "#444" : "#d1d5db" },
          ]}
          onPress={() => setEndButtonShortTap(!endButtonShortTap)}
        >
          <View style={styles.toggleTextBlock}>
            <Text style={[styles.toggleTitle, textStyle]}>
              Mode urgence: bouton Fin RCP en appui court
            </Text>
            <Text style={[styles.toggleSubtitle, labelColor]}>
              Activé : appui court, désactivé : appui long (par défaut)
            </Text>
          </View>
          <View
            style={[
              styles.pill,
              {
                backgroundColor: endButtonShortTap ? "#22c55e" : "#9ca3af",
              },
            ]}
          >
            <Text style={styles.pillText}>
              {endButtonShortTap ? "ACTIF" : "INACTIF"}
            </Text>
          </View>
        </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
            <Text style={styles.resetButtonText}>Réinitialiser par défaut</Text>
          </TouchableOpacity>
        </ScrollView>

        <View
          style={[
            styles.stickyFooter,
            {
              backgroundColor: isDark ? "#2b2c2d" : "#fff",
              borderTopColor: isDark ? "#444" : "#e5e7eb",
            },
          ]}
        >
          <TouchableOpacity style={styles.saveButton} onPress={router.back}>
            <Text style={styles.saveButtonText}>Sauvegarder les paramètres</Text>
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
  body: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#000",
  },
  unit: {
    fontSize: 16,
    color: "#888",
    marginLeft: 8,
  },
  resetButton: {
    marginTop: 28,
    padding: 16,
    backgroundColor: "#FF5252",
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    padding: 16,
    backgroundColor: "#5cc668",
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  stickyFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  toggleRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleTextBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 12,
  },
  pill: {
    minWidth: 70,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    flexShrink: 0,
  },
  pillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
});
