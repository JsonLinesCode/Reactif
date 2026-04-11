import LongPressButton from "@/components/LongPressButton";
import { sessionStore } from "@/store/sessionStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ActionButtonsProps {
  onEnd: () => void;
  onEvent: () => void;
  onAideCognitive: () => void;
  onCancel: () => void;
  useShortTapEndButton?: boolean;
}

export default function ActionButtons({
  onEnd,
  onEvent,
  onAideCognitive,
  onCancel,
  useShortTapEndButton = false,
}: ActionButtonsProps) {
  const BUTTON_SIZE = 70;

  const handleEndPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEnd();
  };

  const theme = sessionStore.theme;

  return (
    <View style={styles.container}>
      <View style={styles.actionItem}>
        {useShortTapEndButton ? (
          <TouchableOpacity
            style={[styles.circleButton, { backgroundColor: "#FF5252" }]}
            onPress={handleEndPress}
          >
            <Ionicons name="close" size={40} color="bla" />
          </TouchableOpacity>
        ) : (
          <LongPressButton
            onComplete={handleEndPress}
            color="#FF5252"
            size={BUTTON_SIZE}
            iconName="close"
            label="Fin RCP"
          />
        )}
        {useShortTapEndButton && (
          <Text style={styles.actionLabel}>Fin RCP</Text>
        )}
      </View>

      <View style={styles.actionItem}>
        <TouchableOpacity
          style={[
            styles.circleButton,
            {
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              borderRadius: BUTTON_SIZE / 2,
            },
          ]}
          onPress={onEvent}
        >
          <Ionicons name="add" size={40} color="#448AFF" />
        </TouchableOpacity>
        <Text
          style={[
            styles.actionLabel,
            theme === "dark" ? { color: "#ccc" } : { color: "#000" },
          ]}
        >
          Saisie
        </Text>
      </View>

      <View style={styles.actionItem}>
        <TouchableOpacity
          style={[
            styles.circleButton,
            {
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              borderRadius: BUTTON_SIZE / 2,
            },
          ]}
          onPress={onAideCognitive}
        >
          <Ionicons name="book-outline" size={34} color="#448AFF" />
        </TouchableOpacity>
        <Text
          style={[
            styles.actionLabel,
            theme === "dark" ? { color: "#ccc" } : { color: "#000" },
          ]}
        >
          Aide cognitive
        </Text>
      </View>
      <View style={styles.actionItem}>
        <LongPressButton
          onComplete={onCancel}
          color="#444"
          size={BUTTON_SIZE}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    gap: 8,
  },
  actionItem: {
    alignItems: "center",
    width: 84,
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderColor: "#448AFF",
    borderWidth: 2,
    marginBottom: 8,
  },

  actionLabel: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
  },
});
