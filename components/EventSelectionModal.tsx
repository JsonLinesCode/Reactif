import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface EventSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (selectedEvents: string[]) => void;
}

const EVENT_OPTIONS = [
  "Perfusion",
  "Intubation",
  "Double défibrillation séquentielle",
  "Antidote",
  "Thrombolyse",
  "Correction trouble ionique",
  "Remplissage vasculaire / transfusion",
  "Abord thoracique",
  "Drainage péricardique",
  "Gestion des hémorragies",
  "Planche à masser",
  "ECMO",
];

export default function EventSelectionModal({
  visible,
  onClose,
  onSave,
}: EventSelectionModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleEvent = (event: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(event)) {
      newSelected.delete(event);
    } else {
      newSelected.add(event);
    }
    setSelected(newSelected);
  };

  const handleSave = () => {
    onSave(Array.from(selected));
    setSelected(new Set()); // Reset selection after save
    onClose();
  };

  const handleClose = () => {
    setSelected(new Set());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saisie Événements</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>📝 Saisie Événements</Text>
          </View>

          <View style={styles.optionsList}>
            {EVENT_OPTIONS.map((item) => {
              const isSelected = selected.has(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={styles.optionItem}
                  onPress={() => toggleEvent(item)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.validateButton} onPress={handleSave}>
            <Ionicons
              name="checkbox-outline"
              size={24}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.validateButtonText}>Valider et Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D47A1",
  },
  optionsList: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#0D47A1",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#0D47A1",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  footer: {
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  validateButton: {
    backgroundColor: "#28a745",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 8,
  },
  validateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
