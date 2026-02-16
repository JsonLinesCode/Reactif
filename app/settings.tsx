import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
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

export default function SettingsScreen() {
  const router = useRouter();
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
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Durées par défaut (secondes)</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Choc (Intervalle)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={shockDuration.toString()}
              onChangeText={(text) => handleChange("shock", text)}
            />
            <Text style={styles.unit}>sec</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cordarone (Intervalle)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={cordaroneDuration.toString()}
              onChangeText={(text) => handleChange("cordarone", text)}
            />
            <Text style={styles.unit}>sec</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adrénaline (Intervalle)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={adrenalineDuration.toString()}
              onChangeText={(text) => handleChange("adrenaline", text)}
            />
            <Text style={styles.unit}>sec</Text>
          </View>
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
