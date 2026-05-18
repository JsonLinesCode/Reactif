import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { soundController } from "@/controllers/SoundController";
import { sessionStore } from "@/store/sessionStore";
import {
  DEFAULT_SOUND_CHOICES,
  getSoundAssetLabel,
  getSoundChoices,
  makeTimerSoundSlot,
  METRONOME_SOUND_SLOT,
  REMINDER_SOUND_OPTIONS,
  resetSoundChoices,
  SOUND_ASSET_OPTIONS,
  SoundAssetName,
  SoundSlot,
  TIMER_SOUND_OPTIONS,
} from "@/utils/soundChoices";

export default function SoundSettingsScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState(sessionStore.theme);
  const [soundChoices, setSoundChoices] = useState({
    ...DEFAULT_SOUND_CHOICES,
  });
  const [editingSoundSlot, setEditingSoundSlot] = useState<SoundSlot | null>(
    null,
  );

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let mounted = true;

    getSoundChoices().then((choices) => {
      if (mounted) {
        setSoundChoices(choices);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectSound = async (
    slot: SoundSlot,
    assetName: SoundAssetName,
  ) => {
    await soundController.setSoundChoice(slot, assetName);
    setSoundChoices((prev) => ({ ...prev, [slot]: assetName }));
    setEditingSoundSlot(null);
  };

  const handleResetSound = async (slot: SoundSlot) => {
    await soundController.resetSoundChoice(slot);
    setSoundChoices((prev) => ({
      ...prev,
      [slot]: DEFAULT_SOUND_CHOICES[slot],
    }));
  };

  const handleResetAll = async () => {
    await resetSoundChoices();
    await soundController.resetSoundChoices();
    setSoundChoices({ ...DEFAULT_SOUND_CHOICES });
    setEditingSoundSlot(null);
  };

  const handlePreviewSlot = async (slot: SoundSlot) => {
    await soundController.play(slot);
  };

  const handlePreviewAsset = async (assetName: SoundAssetName) => {
    await soundController.playAsset(assetName);
  };

  const editingLabel =
    editingSoundSlot === METRONOME_SOUND_SLOT
      ? "Métronome"
      : TIMER_SOUND_OPTIONS.flatMap(({ kind: timerKind, label: timerLabel }) =>
          REMINDER_SOUND_OPTIONS.map(({ kind: reminderKind, label }) => ({
            slot: makeTimerSoundSlot(timerKind, reminderKind),
            label: `${timerLabel} - ${label}`,
          })),
        ).find((item) => item.slot === editingSoundSlot)?.label;

  const isDark = theme === "dark";
  const bgStyle = { backgroundColor: isDark ? "#353636" : "#fff" };
  const textStyle = { color: isDark ? "#fff" : "#000" };
  const sectionTitleColor = { color: isDark ? "#ddd" : "#333" };
  const labelColor = { color: isDark ? "#aaa" : "#555" };
  const rowColors = {
    borderColor: isDark ? "#444" : "#d1d5db",
    backgroundColor: isDark ? "#222121" : "#f9fafb",
  };

  const renderSoundRow = (slot: SoundSlot, label: string) => {
    const selected = soundChoices[slot] ?? DEFAULT_SOUND_CHOICES[slot];
    const isDefault = selected === DEFAULT_SOUND_CHOICES[slot];

    return (
      <View key={slot} style={[styles.soundRow, rowColors]}>
        <View style={styles.soundTextBlock}>
          <Text style={[styles.soundTitle, textStyle]}>{label}</Text>
          <Text style={[styles.soundSubtitle, labelColor]} numberOfLines={1}>
            {getSoundAssetLabel(selected)}
          </Text>
        </View>
        <View style={styles.soundActions}>
          <View
            style={[
              styles.soundBadge,
              { backgroundColor: isDefault ? "#9ca3af" : "#22c55e" },
            ]}
          >
            <Text style={styles.soundBadgeText}>
              {isDefault ? "DÉFAUT" : "PERSO"}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.iconButton, { borderColor: rowColors.borderColor }]}
            onPress={() => void handlePreviewSlot(slot)}
            accessibilityLabel={`Prévisualiser ${label}`}
          >
            <Ionicons
              name="play"
              size={18}
              color={isDark ? "#e2e8f0" : "#334155"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { borderColor: rowColors.borderColor }]}
            onPress={() => setEditingSoundSlot(slot)}
            accessibilityLabel={`Modifier ${label}`}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={isDark ? "#e2e8f0" : "#334155"}
            />
          </TouchableOpacity>
          {!isDefault ? (
            <TouchableOpacity
              style={[
                styles.iconButton,
                { borderColor: rowColors.borderColor },
              ]}
              onPress={() => void handleResetSound(slot)}
              accessibilityLabel={`Réinitialiser ${label}`}
            >
              <Ionicons
                name="refresh"
                size={18}
                color={isDark ? "#e2e8f0" : "#334155"}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

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
        <Text style={[styles.title, textStyle]}>Sons</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, sectionTitleColor]}>Métronome</Text>
        {renderSoundRow(METRONOME_SOUND_SLOT, "Tick")}

        {TIMER_SOUND_OPTIONS.map(({ kind: timerKind, label }) => (
          <View key={timerKind} style={styles.section}>
            <Text style={[styles.sectionTitle, sectionTitleColor]}>
              {label}
            </Text>
            {REMINDER_SOUND_OPTIONS.map(({ kind: reminderKind, label }) =>
              renderSoundRow(
                makeTimerSoundSlot(timerKind, reminderKind),
                label,
              ),
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => void handleResetAll()}
        >
          <Text style={styles.resetButtonText}>Réinitialiser tous les sons</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={editingSoundSlot !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingSoundSlot(null)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.soundModal,
              {
                backgroundColor: isDark ? "#222121" : "#fff",
                borderColor: isDark ? "#475569" : "#e2e8f0",
              },
            ]}
          >
            <View style={styles.soundModalHeader}>
              <Text style={[styles.soundModalTitle, textStyle]}>
                {editingLabel ?? "Son"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEditingSoundSlot(null)}
                accessibilityLabel="Fermer"
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.soundOptionList}>
              {SOUND_ASSET_OPTIONS.map((option) => {
                const isSelected =
                  editingSoundSlot !== null &&
                  soundChoices[editingSoundSlot] === option.name;

                return (
                  <View
                    key={option.name}
                    style={[
                      styles.soundOption,
                      {
                        borderColor: isSelected
                          ? "#22c55e"
                          : rowColors.borderColor,
                        backgroundColor: isSelected
                          ? isDark
                            ? "#064e3b"
                            : "#dcfce7"
                          : isDark
                            ? "#2f3031"
                            : "#f8fafc",
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.optionPreviewButton,
                        { borderColor: rowColors.borderColor },
                      ]}
                      onPress={() => void handlePreviewAsset(option.name)}
                      accessibilityLabel={`Prévisualiser ${option.label}`}
                    >
                      <Ionicons
                        name="play"
                        size={18}
                        color={isDark ? "#e2e8f0" : "#334155"}
                      />
                    </TouchableOpacity>
                    <Text style={[styles.soundOptionText, textStyle]}>
                      {option.label}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.optionSelectButton,
                        {
                          backgroundColor: isSelected ? "#22c55e" : "#448AFF",
                        },
                      ]}
                      onPress={() => {
                        if (editingSoundSlot) {
                          void handleSelectSound(editingSoundSlot, option.name);
                        }
                      }}
                    >
                      <Text style={styles.optionSelectText}>
                        {isSelected ? "Choisi" : "Choisir"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
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
    paddingBottom: 40,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  soundRow: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  soundTextBlock: {
    flex: 1,
    minWidth: 120,
  },
  soundTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  soundSubtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  soundActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  soundBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  soundBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#FF5252",
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    lineHeight: 20,
    textAlign: "center",
    includeFontPadding: false,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  soundModal: {
    maxHeight: "78%",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  soundModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  soundModalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  soundOptionList: {
    maxHeight: 390,
  },
  soundOption: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  optionPreviewButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  soundOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  optionSelectButton: {
    minWidth: 74,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  optionSelectText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
