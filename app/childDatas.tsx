import CustomSwitch from "@/components/CustomSwitch";
import { sessionStore } from "@/store/sessionStore";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//For Android platforms (for animations)
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AgeMode = "months" | "years";

let savedDatas: Record<AgeMode, string> = {
  months: "",
  years: "",
};

export default function ChildDatas() {
  const [theme, setTheme] = useState(sessionStore.theme);

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return () => unsubscribe();
  }, []);

  const isDark = theme === "dark";
  const bgStyle = { backgroundColor: isDark ? "#353636" : "#fff" };
  const textStyle = { color: isDark ? "#fff" : "#000" };
  const expandedBg = { backgroundColor: isDark ? "#353636" : "#f9f9f9" };
  const footerBg = { backgroundColor: isDark ? "#353636" : "#f9f9f9", borderTopColor: isDark ? "#333" : "#ccc" };

  {
    /* Animation for the expansion of the content */
  }
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => {
    //Animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (!expanded) {
      setWeightExpanded(false);
    }
    setExpanded(!expanded);
  };

  {
    /* Age input states */
  }
  const [mode, setMode] = useState<AgeMode | undefined>("months");
  const [valeurTemp, setValeurTemp] = useState("");

  const onSelectSwitch = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (index === 1) {
      setMode("months");
    } else {
      setMode("years");
    }
    setValeurTemp("");
  };

  {
    /* Weight expansion state */
  }
  const [weightExpanded, setWeightExpanded] = useState(false);
  const toggleWeightExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (!weightExpanded) {
      setExpanded(false);
    }
    setWeightExpanded(!weightExpanded);
  };

  const MONTHLY_WEIGHTS = [3, 4, 5, 5.5, 6, 6.5, 7, 8, 8.5, 9, 9, 9.5];

  const calculateWeightFromAge = (age: number, mode: AgeMode | undefined) => {
    if (isNaN(age) || age < 0 || !mode) return null;

    const strategies: Record<AgeMode, () => number | null> = {
      months: () => (age >= 12 ? 10 : (MONTHLY_WEIGHTS[age] ?? null)),
      years: () => (age >= 1 && age <= 12 ? (age + 4) * 2 : null),
    };

    return strategies[mode] ? strategies[mode]() : null;
  };
  const parsedAge = parseInt(valeurTemp, 10);

  {
    /* Weight input state */
  }
  const [weightInput, setWeightInput] = useState("");
  const finalWeight = weightInput
    ? parseFloat(weightInput)
    : calculateWeightFromAge(parsedAge, mode);

  const adrenalineDose = finalWeight ? (0.01 * finalWeight).toFixed(2) : null;
  const cordaroneDose = finalWeight ? (5 * finalWeight).toFixed(1) : null;
  const energyDose = finalWeight ? (4 * finalWeight).toFixed(0) : null;

  const handleValidation = () => {
    if (!mode && !weightInput) {
      Alert.alert("Erreur", "Veuillez entrer une donnée (âge ou poids).");
      return;
    }

    const ageVal = parsedAge || 0;
    const currentMode = mode || "years"; // Default if only weight is entered, though logically ageMode might not matter if weight is manual. Let's keep it simple.

    // Save to store
    sessionStore.setPediatricData({
      ageMode: currentMode,
      ageValue: ageVal,
      weight: finalWeight ?? 0,
      adrenalineDose: adrenalineDose ?? undefined,
      cordaroneDose: cordaroneDose ?? undefined,
      energyDose: energyDose ?? undefined,
    });

    router.push("/displayChildData");
  };

  return (
    <SafeAreaView
      style={[{ flex: 1 }, bgStyle]}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.container, bgStyle]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.titleText, textStyle]}>
            Sélectionnez l&#39;âge ou le poids de l&#39;enfant pour calculer les doses
            et énergies de RCP pédiatrique.
          </Text>
          <TouchableOpacity style={styles.choiceButton} onPress={toggleExpand}>
            <Text style={styles.choiceButtonText}>Âge</Text>
          </TouchableOpacity>
          {/* Content that disappear/appear */}
          {expanded && (
            <View style={[styles.expandedContent, expandedBg]}>
              <Text style={styles.expandedButtonText}> Choix mois/années</Text>
              <View style={{ marginVertical: 20 }}>
                <CustomSwitch
                  selectionMode={mode === "years" ? 2 : 1}
                  roundCorner={true}
                  option1={"Mois"}
                  option2={"Années"}
                  onSelectSwitch={onSelectSwitch}
                  selectionColor={"#007BFF"}
                />
              </View>

              <View style={styles.agePickerContainer}>
                <Text style={styles.expandedButtonText}>
                  {mode === "months"
                    ? "Entrez l'âge (mois):"
                    : "Entrez l'âge (années):"}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Ex: 10"
                  placeholderTextColor="#ccc"
                  value={mode === "months" ? valeurTemp : ""}
                  onChangeText={(text) => {
                    setMode("months");
                    setValeurTemp(text);
                  }}
                />
              </View>
            </View>
          )}
          <TouchableOpacity
            style={styles.choiceButton}
            onPress={toggleWeightExpand}
          >
            <Text style={styles.choiceButtonText}>
              {weightExpanded ? " Poids (kg)" : "Poids (kg)"}
            </Text>
          </TouchableOpacity>

          {weightExpanded && (
            <View style={styles.weightPickerContainer}>
              <Text style={styles.expandedButtonText}>
                Entrez le poids (kg):
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 12.5"
                placeholderTextColor="#ccc"
                keyboardType="decimal-pad" // Allow decimals for weight
                value={weightInput}
                onChangeText={(text) => {
                  setWeightInput(text);
                  // If user types here, we probably unset age mode or keep it but rely on weightInput
                }}
                maxLength={5} // e.g. 45.5 or 110.2
              />
            </View>
          )}

          {/* ADDED: Adult RCP note */}
          <Text style={styles.infoText}>
            RCP adulte si gabarit adulte (habituellement à la puberté, vers
            12-14 ans, ou si plus que 50kg approximativement). Toujours se
            référer aux recommandations et protocoles locaux.
          </Text>
        </ScrollView>
        {(expanded || weightExpanded) && (
          <View style={[styles.footer, footerBg]}>
            <TouchableOpacity
              style={styles.validationButton}
              onPress={handleValidation}
            >
              <Text style={styles.subButtonText}> Valider et calculer</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 100,
    paddingBottom: 150,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
    gap: 10,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  titleText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    alignSelf: "center",
  },
  choiceButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  choiceButton: {
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
  expandedContent: {
    backgroundColor: "#25292e",
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
  expandedButtonText: {
    color: "#7a7c8a",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  agePickerContainer: {
    alignItems: "center",
    width: "80%",

    justifyContent: "space-between",
    gap: 10,
  },

  weightPickerContainer: {
    alignItems: "center",
    width: "80%",
    justifyContent: "space-between",
    gap: 10,
  },
  subButton: {
    backgroundColor: "#66b2ff", // Lighter blue
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
  subButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#fff",
    color: "#000",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 16,
  },
  inputButton: {
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
  modeButtonSelected: {
    backgroundColor: "#fff",
    paddingVertical: 10,
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
  activeTab: { backgroundColor: "#007AFF" },
  activeTabText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  tabText: { color: "#007AFF", fontWeight: "bold", fontSize: 14 },
  validationButton: {
    backgroundColor: "#28a745",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 10,
    width: "100%",
    maxWidth: 150,
    alignItems: "center",
    alignSelf: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  infoText: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#25292e",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
});
