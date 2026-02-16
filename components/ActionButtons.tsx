import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ActionButtonsProps {
  onEnd: () => void;
  onEvent: () => void;
  onCancel: () => void;
}

export default function ActionButtons({
  onEnd,
  onEvent,
  onCancel,
}: ActionButtonsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.actionItem}>
        <TouchableOpacity
          style={[styles.circleButton, { backgroundColor: "#FF5252" }]}
          onPress={onEnd}
        >
          <Ionicons name="close" size={40} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.actionLabel}>Fin RCP</Text>
      </View>

      <View style={styles.actionItem}>
        <TouchableOpacity
          style={[styles.squareButton, { backgroundColor: "#448AFF" }]}
          onPress={onEvent}
        >
          <Ionicons name="add" size={48} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.actionLabelSingleLine}>Saisie{"\n"}Evenements</Text>
      </View>

      <View style={styles.actionItem}>
        <TouchableOpacity
          style={[styles.circleButton, { backgroundColor: "#444" }]}
          onPress={onCancel}
        >
          <Ionicons name="arrow-undo" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.actionLabel}>Annuler</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around", // Distribute evenly
    alignItems: "flex-start",
    marginVertical: 20,
    width: "100%",
  },
  actionItem: {
    alignItems: "center",
    width: 80,
  },
  circleButton: {
    width: 64, // Reduced size slightly to fit 3 in row comfortably
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  squareButton: {
    width: 64,
    height: 64,
    borderRadius: 12, // Slightly rounded square
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#448AFF",
    backgroundColor: "rgba(68, 138, 255, 0.1)", // Or solid if preferred, screenshot looks vaguely outlined/light? Actually solid blue with white plus.
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
  },
  actionLabelSingleLine: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
  },
});
