import CustomSwitch from "@/components/CustomSwitch";
import * as Clipboard from "expo-clipboard";
import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function AideRespiratoire() {
  const insets = useSafeAreaInsets();
  const [sex, setSex] = useState<number>(1); // 1 = Male, 2 = Female
  const [heightCm, setHeightCm] = useState<string>("170");
  const [error, setError] = useState<string | null>(null);

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

  const displayPit = Number.isFinite(pit) ? pit.toFixed(1) : "—";

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ title: "Réglages respirateur RCP Adulte" }} />

      <View style={styles.inner}>
        <Text style={styles.label}>Sexe</Text>
        <CustomSwitch
          selectionMode={sex}
          roundCorner={true}
          option1={"Homme"}
          option2={"Femme"}
          onSelectSwitch={(val) => setSex(val)}
          selectionColor={"#0D47A1"}
        />

        <Text style={[styles.label, { marginTop: 18 }]}>Taille (cm)</Text>
        <TextInput
          value={heightCm}
          onChangeText={setHeightCm}
          keyboardType="numeric"
          placeholder="ex. 170"
          style={styles.input}
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
            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Résultats</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>PIT (kg)</Text>
            <Text style={styles.resultValue}>{displayPit}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Vt (mL)</Text>
            <Text style={styles.resultValue}>
              {Number.isFinite(vtRange.min)
                ? `${vtRange.min} – ${vtRange.max}`
                : "—"}
            </Text>
          </View>
          <Text style={styles.note}>Plage: 6–8 mL/kg de PIT</Text>
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.copyButton} onPress={onCopy}>
              <Text style={styles.copyButtonText}>Copier la plage Vt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  inner: { padding: 16 },
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
  calcButtonText: { color: "#fff", fontWeight: "bold" },
  resetButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#6b7280",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 14,
  },
  resetButtonText: { color: "#374151", fontWeight: "600" },
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
  copyButtonText: { color: "#0D47A1", fontWeight: "600" },
});
