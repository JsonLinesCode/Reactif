import LongPressButton from "@/components/LongPressButton";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ActionButtonsProps {
  onEnd: () => void;
  //onEvent: () => void;
  onCancel: () => void;
  useShortTapEndButton?: boolean;
}

export default function ActionButtons({
  onEnd,
  //onEvent,
  onCancel,
  useShortTapEndButton = false,
}: ActionButtonsProps) {
  const handleEndPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEnd();
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionItem}>
        {useShortTapEndButton ? (
          <TouchableOpacity
            style={[styles.circleButton, { backgroundColor: "#FF5252" }]}
            onPress={handleEndPress}
          >
            <Ionicons name="close" size={40} color="#fff" />
          </TouchableOpacity>
        ) : (
          <LongPressButton
            onComplete={handleEndPress}
            color="#FF5252"
            size={64}
            iconName="close"
            label="Fin RCP"
          />
        )}
        {useShortTapEndButton && <Text style={styles.actionLabel}>Fin RCP</Text>}
      </View>

      {/*<View style={styles.actionItem}>
        <TouchableOpacity
            style={[styles.circleButton, {backgroundColor: "#448AFF"}]}
            onPress={onEvent}
        >
          <Ionicons name="add" size={48} color="#fff"/>
        </TouchableOpacity>
        <Text style={styles.actionLabel}>Saisie événements</Text>
      </View>*/}

      <View style={styles.actionItem}>
        {/* 
          LongPressButton handles the circular button and gesture.
          We pass size=64 to match other buttons.
      */}
        <LongPressButton onComplete={onCancel} color="#444" size={64} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    width: "100%",
  },
  actionItem: {
    alignItems: "center",
    width: 80,
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  actionLabel: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
  },
});
