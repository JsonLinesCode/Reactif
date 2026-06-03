import { t } from "@/i18n";
import { sessionStore } from "@/store/sessionStore";
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
  { key: "perfusion", labelKey: "events.options.perfusion" },
  { key: "intubation", labelKey: "events.options.intubation" },
  { key: "doubleDefib", labelKey: "events.options.doubleDefib" },
  { key: "antidote", labelKey: "events.options.antidote" },
  { key: "thrombolysis", labelKey: "events.options.thrombolysis" },
  { key: "ionicCorrection", labelKey: "events.options.ionicCorrection" },
  { key: "fillingTransfusion", labelKey: "events.options.fillingTransfusion" },
  { key: "thoracicAccess", labelKey: "events.options.thoracicAccess" },
  { key: "pericardialDrainage", labelKey: "events.options.pericardialDrainage" },
  { key: "hemorrhageMgmt", labelKey: "events.options.hemorrhageMgmt" },
  { key: "cprBoard", labelKey: "events.options.cprBoard" },
  { key: "ecmo", labelKey: "events.options.ecmo" },
];

export default function EventSelectionModal({
  visible,
  onClose,
  onSave,
}: EventSelectionModalProps) {
  const [theme, setTheme] = useState(sessionStore.theme);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const isDark = theme === "dark";
  const pageStyle = { backgroundColor: isDark ? "#353636" : "#F5F5F5" };
  const panelStyle = { backgroundColor: isDark ? "#222121" : "#fff" };
  const textStyle = { color: isDark ? "#fff" : "#333" };
  const checkboxStyle = { borderColor: isDark ? "#fff" : "#0D47A1" };
  const validateButtonStyle = {
    backgroundColor: isDark ? "transparent" : "#28a745",
    borderColor: isDark ? "#fff" : "#28a745",
  };

  React.useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return () => unsubscribe();
  }, []);

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
    onSave(
      EVENT_OPTIONS.filter((item) => selected.has(item.key)).map((item) =>
        t(item.labelKey),
      ),
    );
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
      <SafeAreaView
        style={[
          styles.container,
          pageStyle,
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: isDark ? "#222121" : "#000" },
          ]}
        >
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("events.title")}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={[styles.pageTitle, textStyle]}>
              {t("events.title")}
            </Text>
          </View>

          <View
            style={[
              styles.optionsList,
              panelStyle,
            ]}
          >
            {EVENT_OPTIONS.map((item) => {
              const isSelected = selected.has(item.key);
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.optionItem,
                    { borderBottomColor: isDark ? "#444" : "#eee" },
                  ]}
                  onPress={() => toggleEvent(item.key)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      checkboxStyle,
                      isSelected && styles.checkboxSelected,
                      isSelected &&
                        (isDark
                          ? styles.checkboxSelectedDark
                          : styles.checkboxSelectedLight),
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={isDark ? "#353636" : "#fff"}
                      />
                    )}
                  </View>
                  <Text style={[styles.optionText, textStyle]}>
                    {t(item.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: isDark ? "#353636" : "#F5F5F5",
              borderTopColor: isDark ? "#444" : "#ddd",
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.validateButton, validateButtonStyle]}
            onPress={handleSave}
          >
            <Ionicons
              name="checkbox-outline"
              size={24}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.validateButtonText, { textAlign: "center" }]}>
              {t("events.validateAndBack")}
            </Text>
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
  checkboxSelectedLight: {
    backgroundColor: "#0D47A1",
    borderColor: "#0D47A1",
  },
  checkboxSelectedDark: {
    backgroundColor: "#fff",
    borderColor: "#fff",
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
    borderColor: "#28a745",
    borderWidth: 2,
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
    textTransform: "uppercase",
  },
});
