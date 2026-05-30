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
  const actionLabelColor = theme === "dark" ? "#fff" : "#000";

  return (
    <View style={styles.container}>
      <View style={styles.actionItem}>
        {useShortTapEndButton ? (
          <TouchableOpacity
            style={[
              styles.circleButton,
              {
                width: BUTTON_SIZE,
                height: BUTTON_SIZE,
                borderRadius: BUTTON_SIZE / 2,
                backgroundColor: "transparent",
                borderColor: "#FF5252",
              },
            ]}
            onPress={handleEndPress}
          >
            <Ionicons name="close-outline" size={65} color="#FF5252" />
          </TouchableOpacity>
        ) : (
          <LongPressButton
            onComplete={handleEndPress}
            size={BUTTON_SIZE}
            iconSize={65}
            iconName="close-outline"
            label="Fin RCP"
          />
        )}
        {useShortTapEndButton && (
          <Text
            style={[styles.actionLabel, { color: actionLabelColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
          >
            Fin RCP
          </Text>
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
          style={[styles.actionLabel, { color: actionLabelColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
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
          style={[styles.actionLabel, { color: actionLabelColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
        >
          Aide
        </Text>
      </View>
      <View style={styles.actionItem}>
        <LongPressButton onComplete={onCancel} size={BUTTON_SIZE} />
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
    gap: 0,
  },
  actionItem: {
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 3,
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
    width: "100%",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
    textTransform: "uppercase",
    lineHeight: 22,
    includeFontPadding: false,
  },
});
