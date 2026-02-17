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

import { useCprSettings } from "@/hooks/useCprSettings";
import { sessionStore } from "@/store/sessionStore";
import CustomSwitch from "@/components/CustomSwitch";


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
    cordaroneDuration,
    adrenalineDuration,
    updateSettings,
    resetSettings,
    loading,
  } = useCprSettings();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme === "light" ? "#fff" : "#353636" }]}>
        <Text style={{ color: theme === "light" ? "#000" : "#fff" }}>Chargement...</Text>
      </View>
    );
  }

  const handleChange = (
    key: "shock" | "cordarone" | "adrenaline",
    text: string,
  ) => {
    const value = parseInt(text, 10);
    if (!isNaN(value)) {
      updateSettings(key, value);
    }
  };

  const onSelectSwitch = async (val: number) => {
    const newTheme = val === 1 ? 'light' : 'dark';
    await sessionStore.setTheme(newTheme);
  };

  const isDark = theme === "dark";
  const bgStyle = { backgroundColor: isDark ? "#121212" : "#fff" };
  const textStyle = { color: isDark ? "#fff" : "#000" };
  const inputBgStyle = { backgroundColor: isDark ? "#333" : "#f9f9f9", borderColor: isDark ? "#555" : "#ccc" };
  const sectionTitleColor = { color: isDark ? "#ddd" : "#333" };
  const labelColor = { color: isDark ? "#aaa" : "#555" };


  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      <View style={[styles.header, { borderBottomColor: isDark ? "#333" : "#eee" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.title, textStyle]}>Paramètres</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, sectionTitleColor]}>Durées par défaut (secondes)</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, labelColor]}>Choc (Intervalle)</Text>
          <View style={[styles.inputWrapper, inputBgStyle]}>
            <TextInput
              style={[styles.input, textStyle]}
              keyboardType="numeric"
              value={shockDuration.toString()}
              onChangeText={(text) => handleChange("shock", text)}
            />
            <Text style={styles.unit}>sec</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, labelColor]}>Cordarone (Intervalle)</Text>
          <View style={[styles.inputWrapper, inputBgStyle]}>
            <TextInput
              style={[styles.input, textStyle]}
              keyboardType="numeric"
              value={cordaroneDuration.toString()}
              onChangeText={(text) => handleChange("cordarone", text)}
            />
            <Text style={styles.unit}>sec</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, labelColor]}>Adrénaline (Intervalle)</Text>
          <View style={[styles.inputWrapper, inputBgStyle]}>
            <TextInput
              style={[styles.input, textStyle]}
              keyboardType="numeric"
              value={adrenalineDuration.toString()}
              onChangeText={(text) => handleChange("adrenaline", text)}
            />
            <Text style={styles.unit}>sec</Text>
          </View>
        </View>

         <Text style={[styles.sectionTitle, sectionTitleColor, { marginTop: 20 }]}>Thème de l&#39;application</Text>
         <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <CustomSwitch
                selectionMode={theme === "light" ? 1 : 2}
                roundCorner={true}
                option1={"Clair"}
                option2={"Sombre"}
                onSelectSwitch={onSelectSwitch}
                selectionColor={"#007BFF"}
            />
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
          <Text style={styles.resetButtonText}>Réinitialiser par défaut</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  switchThemeButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
  },
   switchThemeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resetButton: {
    marginTop: 40,
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
});
