import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { router, Stack } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CprSession } from "@/models/session";
import { sessionStore } from "@/store/sessionStore";
import { formatDuration, generateSessionHtml } from "@/utils/sessionUtils";

export default function History() {
  const [sessions, setSessions] = useState<CprSession[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(
    new Set(),
  );

  const [theme, setTheme] = useState(sessionStore.theme);
  const isDark = theme === "dark";
  useEffect(() => {
    // Load history
    const history = sessionStore.getHistory();
    setSessions(history);

    // Subscribe to store updates to reflect deletions immediately
    const unsubscribe = sessionStore.subscribe(() => {
      setSessions(sessionStore.getHistory());
      setTheme(sessionStore.theme);
    });
    return unsubscribe;
  }, []);

  const handleExport = async (session: CprSession) => {
    const html = generateSessionHtml(session);
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'exporter le PDF.");
      console.error(error);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedSessionIds(new Set());
  };

  const toggleSessionSelection = (sessionId: string) => {
    const newSelection = new Set(selectedSessionIds);
    if (newSelection.has(sessionId)) {
      newSelection.delete(sessionId);
    } else {
      newSelection.add(sessionId);
    }
    setSelectedSessionIds(newSelection);
  };

  const deleteSelectedSessions = async () => {
    Alert.alert(
      "Supprimer les sessions",
      `Voulez-vous vraiment supprimer ${selectedSessionIds.size} session(s) ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            const idsToDelete = Array.from(selectedSessionIds);
            for (const id of idsToDelete) {
              await sessionStore.deleteSession(id);
            }
            setIsSelectionMode(false);
            setSelectedSessionIds(new Set());
          },
        },
      ],
    );
  };

  const renderItem = ({ item, index }: { item: CprSession; index: number }) => {
    const isSelected = selectedSessionIds.has(item.id);
    const sessionNumber = sessions.length - index;

    return (
      <TouchableOpacity
        onPress={() => {
          if (isSelectionMode) {
            toggleSessionSelection(item.id);
          } else {
            router.push({
              pathname: "/historyDetail",
              params: { sessionId: item.id },
            });
          }
        }}
        activeOpacity={isSelectionMode ? 0.7 : 1}
        delayPressIn={0}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? "#1f2937" : "#fff" },
            isSelected && {
              backgroundColor: isDark ? "#1e3a8a" : "#cce5ff",
              borderColor: isDark ? "#93c5fd" : "#007BFF",
              borderWidth: 1,
            },
          ]}
        >
          <View
            style={[
              styles.cardHeader,
              { borderBottomColor: isDark ? "#374151" : "#eee" },
            ]}
          >
            <View>
              <Text
                style={[
                  styles.cardTitle,
                  { color: isDark ? "#f9fafb" : "#333" },
                ]}
              >
                Session #{sessionNumber}
              </Text>
              <Text
                style={[
                  styles.infoText,
                  { color: isDark ? "#d1d5db" : "#444" },
                ]}
              >
                Temps écoulé: {formatDuration(item.startTime, item.endTime)}
              </Text>
            </View>
            {!isSelectionMode && (
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => handleExport(item)}
              >
                <Ionicons
                  name="share-outline"
                  size={24}
                  color={isDark ? "#93c5fd" : "#007BFF"}
                />
              </TouchableOpacity>
            )}
            {isSelectionMode && (
              <Ionicons
                name={isSelected ? "checkbox" : "square-outline"}
                size={24}
                color={
                  isSelected ? (isDark ? "#bfdbfe" : "#007BFF") : "#9ca3af"
                }
              />
            )}
          </View>

          <View style={styles.cardContent}>
            {item.pediatricData ? (
              <Text
                style={[
                  styles.infoText,
                  { color: isDark ? "#d1d5db" : "#444" },
                ]}
              >
                Patient: Enfant ({item.pediatricData.ageValue}{" "}
                {item.pediatricData.ageMode})
              </Text>
            ) : (
              <Text
                style={[
                  styles.infoText,
                  { color: isDark ? "#d1d5db" : "#444" },
                ]}
              >
                Patient: Standard
              </Text>
            )}
            <Text
              style={[styles.infoText, { color: isDark ? "#d1d5db" : "#444" }]}
            >
              Événements: {item.events.length}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const bgStyle = { backgroundColor: isDark ? "#111827" : "#f5f5f5" };
  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ justifyContent: "flex-start" }}>
        <TouchableOpacity
          style={[
            styles.backButton,
            isDark
              ? {
                  backgroundColor: "#374151",
                  borderColor: "#9ca3af",
                  borderWidth: 1,
                  borderRadius: 999,
                }
              : {},
          ]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <View style={[styles.topBar, bgStyle]}>
          <TouchableOpacity
            style={[
              styles.selectButton,
              { borderColor: isDark ? "#93c5fd" : "#007BFF" },
            ]}
            onPress={toggleSelectionMode}
          >
            <Text
              style={[
                styles.selectButtonText,
                { color: isDark ? "#bfdbfe" : "#007BFF" },
              ]}
            >
              {isSelectionMode ? "Annuler" : "Sélectionner"}
            </Text>
          </TouchableOpacity>

          {isSelectionMode && selectedSessionIds.size > 0 && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={deleteSelectedSessions}
            >
              <Text style={styles.deleteButtonText}>
                Supprimer ({selectedSessionIds.size})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Stack.Screen options={{ title: "Historique des sessions" }} />
      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text
            style={[styles.emptyText, { color: isDark ? "#9ca3af" : "#888" }]}
          >
            Aucune session enregistrée.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item, index) =>
            `${item.id}-${item.startTime}-${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
    padding: 8,
  },
  selectButton: {
    borderColor: "#007BFF",
    justifyContent: "flex-end",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  selectButtonText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  exportButton: {
    padding: 8,
  },
  cardContent: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#444",
  },
});
