import CustomSwitch from "@/components/CustomSwitch";
import { sessionStore } from "@/store/sessionStore";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  LayoutAnimation,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AideRespiratoire() {
  const router = useRouter();
  const [theme, setTheme] = useState(sessionStore.theme);
  const [sex, setSex] = useState<number>(1); // 1 = Male, 2 = Female
  const [heightCm, setHeightCm] = useState<string>("170");
  const [error, setError] = useState<string | null>(null);
  const [expandedRcp, setExpandedRcp] = useState(false);
  const [expandedCalc, setExpandedCalc] = useState(true);
  const [expandedPostRacs, setExpandedPostRacs] = useState(false);
  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return () => unsubscribe();
  }, []);
  const toggleExpand = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter((prev) => !prev);
  };
  const isDark = theme === "dark";

  const markdownThemeStyles = useMemo(
    () => ({
      heading3: {
        fontSize: 18,
        fontWeight: "bold" as const,
        color: isDark ? "#f9fafb" : "#1e293b",
        marginTop: 10,
        marginBottom: 6,
      },
      list_item: {
        marginBottom: 4,
      },
      bullet_list_content: {
        fontSize: 14,
        color: isDark ? "#e5e7eb" : "#334155",
      },
      paragraph: {
        fontSize: 14,
        lineHeight: 21,
        color: isDark ? "#e5e7eb" : "#334155",
      },
      strong: {
        fontWeight: "700" as const,
        color: isDark ? "#bfdbfe" : "#0D47A1",
      },
      hr: {
        backgroundColor: isDark ? "#4b5563" : "#cbd5e1",
        height: 1,
        marginVertical: 15,
      },
    }),
    [isDark],
  );

  const parsedHeight = useMemo(() => {
    const n = Number(heightCm.replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  }, [heightCm]);

  const pit = useMemo(() => {
    if (!Number.isFinite(parsedHeight)) return NaN;
    const h = parsedHeight;
    const base = h - 152.4;
    if (sex === 1) return 50 + 0.91 * base;
    return 45.5 + 0.91 * base;
  }, [parsedHeight, sex]);

  const vtRange = useMemo(() => {
    if (!Number.isFinite(pit)) return { min: NaN, max: NaN };
    const min = Math.round(pit * 6);
    const max = Math.round(pit * 8);
    return { min, max };
  }, [pit]);

  const validateAndCompute = () => {
    setError(null);
    if (!Number.isFinite(parsedHeight)) {
      setError("Hauteur invalide");
      return;
    }
    if (parsedHeight < 30 || parsedHeight > 250) {
      setError("Hauteur hors plage (30–250 cm)");
      return;
    }
    // success — values are computed in memo hooks
  };

  const onCopy = async () => {
    if (!Number.isFinite(vtRange.min)) return;
    const text = `${vtRange.min}–${vtRange.max} mL (6–8 mL/kg)`;
    await Clipboard.setStringAsync(text);
    Alert.alert("Copié", "Plage Vt copiée dans le presse-papiers");
  };

  const onReset = () => {
    setHeightCm("");
    setError(null);
  };
  const markdownRcpContent = `
### Réglages respirateur pour ventilation mécanique durant RCP Adulte
* **Fréquence respiratoire (FR)** = 10 cycles/ min
* **Pression expiratoire positive (PEP)** = 0 - 5 cmH2O
* **Trigger** = OFF
* **Pression max (P max)** = 60 - 70 cmH2O
* **Rapport inspiration/ expiration (I:E)** = 1 : 5
* **FiO2** = 100 %
* **Volume courant (Vt)** = 6 - 8 mL de PIT (poids idéal théorique)
`;

  const markdownPostRacsContent = `
### Réglages respirateur pour ventilation mécanique en post RACS
En post RACS, restaurer les paramètres habituels et ajuster les réglages pour permettre une **normoxie** (SpO2 94 - 98 %) et une **normocapnie** (PaCO2 35 - 45 mmHg).
`;
  const displayPit = Number.isFinite(pit) ? pit.toFixed(1) : "—";

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#111827" : "#F5F5F5",
        },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Stack.Screen
        options={{
          title: "Réglages respirateur RCP Adulte",
          headerStyle: {
            backgroundColor: isDark ? "#111827" : "#F5F5F5",
          },
          headerTintColor: isDark ? "#e5e7eb" : "#0f172a",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerBackButton}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={isDark ? "#e5e7eb" : "#0f172a"}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={[
            styles.helpHeader,
            expandedRcp && styles.helpHeaderExpanded,
            {
              backgroundColor: isDark ? "#1f2937" : "#e2e8f0",
              borderColor: isDark ? "#374151" : "#cbd5e1",
            },
          ]}
          onPress={() => toggleExpand(setExpandedRcp)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.helpHeaderText,
              { color: isDark ? "#f9fafb" : "#0f172a" },
            ]}
          >
            {expandedRcp ? "▼" : "▶"} Réglages respirateur pendant RCP
          </Text>
        </TouchableOpacity>

        {expandedRcp && (
          <View
            style={[
              styles.helpContent,
              styles.helpContentJoined,
              {
                backgroundColor: isDark ? "#1f2937" : "#fff",
                borderColor: isDark ? "#374151" : "#cbd5e1",
              },
            ]}
          >
            <Markdown style={markdownThemeStyles}>
              {markdownRcpContent}
            </Markdown>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.helpHeader,
            styles.sectionGap,
            expandedCalc && styles.helpHeaderExpanded,
            {
              backgroundColor: isDark ? "#1f2937" : "#e2e8f0",
              borderColor: isDark ? "#374151" : "#cbd5e1",
            },
          ]}
          onPress={() => toggleExpand(setExpandedCalc)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.helpHeaderText,
              { color: isDark ? "#f9fafb" : "#0f172a" },
            ]}
          >
            {expandedCalc ? "▼" : "▶"} Calculer le PIT
          </Text>
        </TouchableOpacity>

        {expandedCalc && (
          <View
            style={[
              styles.helpContent,
              styles.helpContentJoined,
              {
                backgroundColor: isDark ? "#1f2937" : "#fff",
                borderColor: isDark ? "#374151" : "#cbd5e1",
              },
            ]}
          >
            <View style={styles.inner}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? "#e5e7eb" : "#111827" },
                ]}
              >
                Sexe
              </Text>
              <CustomSwitch
                selectionMode={sex}
                roundCorner={true}
                option1={"Homme"}
                option2={"Femme"}
                onSelectSwitch={(val) => setSex(val)}
                selectionColor={"#0D47A1"}
              />

              <Text
                style={[
                  styles.label,
                  { marginTop: 18, color: isDark ? "#e5e7eb" : "#111827" },
                ]}
              >
                Taille (cm)
              </Text>
              <TextInput
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="numeric"
                placeholder="ex. 170"
                placeholderTextColor={isDark ? "#94a3b8" : "#6b7280"}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#1f2937" : "#fff",
                    borderColor: isDark ? "#374151" : "#E5E7EB",
                    color: isDark ? "#f9fafb" : "#111827",
                  },
                ]}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.calcButton}
                  onPress={validateAndCompute}
                >
                  <Text style={styles.calcButtonText}>Calculer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={onReset}>
                  <Text
                    style={[
                      styles.resetButtonText,
                      { color: isDark ? "#e5e7eb" : "#374151" },
                    ]}
                  >
                    Réinitialiser
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: isDark ? "#1f2937" : "#fff",
                    borderColor: isDark ? "#374151" : "#E5E7EB",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.resultTitle,
                    { color: isDark ? "#f9fafb" : "#111827" },
                  ]}
                >
                  Résultats
                </Text>
                <View style={styles.resultRow}>
                  <Text
                    style={[
                      styles.resultLabel,
                      { color: isDark ? "#d1d5db" : "#374151" },
                    ]}
                  >
                    PIT (kg)
                  </Text>
                  <Text
                    style={[
                      styles.resultValue,
                      { color: isDark ? "#f9fafb" : "#111827" },
                    ]}
                  >
                    {displayPit}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text
                    style={[
                      styles.resultLabel,
                      { color: isDark ? "#d1d5db" : "#374151" },
                    ]}
                  >
                    Vt (mL)
                  </Text>
                  <Text
                    style={[
                      styles.resultValue,
                      { color: isDark ? "#f9fafb" : "#111827" },
                    ]}
                  >
                    {Number.isFinite(vtRange.min)
                      ? `${vtRange.min} – ${vtRange.max}`
                      : "—"}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.note,
                    { color: isDark ? "#9ca3af" : "#6b7280" },
                  ]}
                >
                  Plage: 6–8 mL/kg de PIT
                </Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={[
                      styles.copyButton,
                      {
                        backgroundColor: isDark ? "#111827" : "#fff",
                        borderColor: isDark ? "#93c5fd" : "#0D47A1",
                      },
                    ]}
                    onPress={onCopy}
                  >
                    <Text
                      style={[
                        styles.copyButtonText,
                        { color: isDark ? "#bfdbfe" : "#0D47A1" },
                      ]}
                    >
                      Copier la plage Vt
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.helpHeader,
            styles.sectionGap,
            expandedPostRacs && styles.helpHeaderExpanded,
            {
              backgroundColor: isDark ? "#1f2937" : "#e2e8f0",
              borderColor: isDark ? "#374151" : "#cbd5e1",
            },
          ]}
          onPress={() => toggleExpand(setExpandedPostRacs)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.helpHeaderText,
              { color: isDark ? "#f9fafb" : "#0f172a" },
            ]}
          >
            {expandedPostRacs ? "▼" : "▶"} Réglages respirateur en post RACS
          </Text>
        </TouchableOpacity>

        {expandedPostRacs && (
          <View
            style={[
              styles.helpContent,
              styles.helpContentJoined,
              {
                backgroundColor: isDark ? "#1f2937" : "#fff",
                borderColor: isDark ? "#374151" : "#cbd5e1",
              },
            ]}
          >
            <Markdown style={markdownThemeStyles}>
              {markdownPostRacsContent}
            </Markdown>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
    marginTop: 15,
    paddingTop: 8,
  },
  helpHeader: {
    marginHorizontal: 16,
    marginTop: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  helpHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  helpHeaderExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  helpContent: {
    marginHorizontal: 16,
    marginTop: 0,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  helpContentJoined: {
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  sectionGap: {
    marginTop: 12,
  },
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  headerBackButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inner: { padding: 0 },
  label: { fontSize: 16, color: "#111827", marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 16,
  },
  error: { color: "#b91c1c", marginTop: 8 },
  buttonsRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  calcButton: {
    flex: 1,
    backgroundColor: "#0D47A1",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  calcButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  resetButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#6b7280",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 14,
  },
  resetButtonText: {
    color: "#374151",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  resultCard: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  resultTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resultLabel: { color: "#374151" },
  resultValue: { fontWeight: "700", color: "#111827" },
  note: { color: "#6b7280", marginTop: 6 },
  resultActions: { marginTop: 12, alignItems: "flex-end" },
  copyButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#0D47A1",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  copyButtonText: {
    color: "#0D47A1",
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
