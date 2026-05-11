import { CprEvent, CprSession, PediatricData } from "@/models/session";
import { sessionStore } from "@/store/sessionStore";
import {
  formatDuration,
  formatElapsedFromStart,
  formatEventDetails,
  formatEventType,
  formatHumanReadableDateTime,
  generateSessionHtml,
  getEventsWithCycles,
} from "@/utils/sessionUtils";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { router, Stack, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function HistoryDetail() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const [session, setSession] = useState<CprSession | null>(null);
  const [theme, setTheme] = useState(sessionStore.theme);
  const isDark = theme === "dark";

  useEffect(() => {
    const loadSession = () => {
      const id = typeof sessionId === "string" ? sessionId : "";
      const found =
        sessionStore.getHistory().find((item) => item.id === id) || null;
      setSession(found);
    };

    loadSession();
    const unsubscribe = sessionStore.subscribe(loadSession);
    return unsubscribe;
  }, [sessionId]);

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return unsubscribe;
  }, []);

  const eventsWithCycles = useMemo(() => {
    if (!session) return [];
    return getEventsWithCycles(session);
  }, [session]);

  const shockCount = useMemo(() => {
    if (!session) return 0;
    return session.events.filter((evt: CprEvent) => evt.type === "shock")
      .length;
  }, [session]);

  const handleExport = async () => {
    if (!session) return;

    try {
      const { uri } = await Print.printToFileAsync({
        html: generateSessionHtml(session),
      });
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'exporter le PDF.");
      console.error(error);
    }
  };

  if (!session) {
    return (
      <SafeAreaProvider
        style={[
          styles.container,
          { backgroundColor: isDark ? "#111827" : "#f3f4f6" },
        ]}
      >
        <Stack.Screen options={{ title: "Détail session" }} />
        <View style={styles.emptyContainer}>
          <Text
            style={[
              styles.emptyText,
              { color: isDark ? "#9ca3af" : "#64748b" },
            ]}
          >
            Session introuvable.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    );
  }

  const startDate = new Date(session.startTime);

  return (
    <SafeAreaView
        style={[
        styles.container,
        { backgroundColor: isDark ? "#111827" : "#f3f4f6" },
      ]}
    >
      <Stack.Screen options={{ title: "Détail session" }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: isDark ? "#1f2937" : "#fff",
              borderColor: isDark ? "#374151" : "#e5e7eb",
            },
          ]}
        >
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? "#f9fafb" : "#111827" },
            ]}
          >
            Session RCP complète
          </Text>
          <Text
            style={[
              styles.headerLine,
              { color: isDark ? "#d1d5db" : "#374151" },
            ]}
          >
            Date: {startDate.toLocaleDateString()}
          </Text>
          <Text
            style={[
              styles.headerLine,
              { color: isDark ? "#d1d5db" : "#374151" },
            ]}
          >
            Patient: {session.pediatricData ? "Enfant" : "Standard"}
          </Text>
          {session.pediatricData && (
              <View>
                  {session.pediatricData.inputMode === "weight" && (
                      <Text style={[styles.headerLine, {color: isDark ? "#d1d5db" : "#374151"}]}>
                          Poids: {session.pediatricData.weight ? `${session.pediatricData.weight} kg` : "N/A"}
                      </Text>
                  )}
                  {session.pediatricData.inputMode !== "weight" && (
                      <Text style={[styles.headerLine, {color: isDark ? "#d1d5db" : "#374151"}]}>
                          Age: {session.pediatricData.ageValue ? `${session.pediatricData.ageValue} ${session.pediatricData.ageMode}` : "N/A"}
                      </Text>
                  )}
                  <Text
                      style={[
                          styles.headerLine,
                          {color: isDark ? "#d1d5db" : "#374151"},
                      ]}
                  >
                      Adrenaline: {session.pediatricData.adrenalineDose ? `${session.pediatricData.adrenalineDose} mg` : "N/A"},
                      Cordarone: {session.pediatricData.cordaroneDose ? `${session.pediatricData.cordaroneDose} mg` : "N/A"},
                      Energie: {session.pediatricData.energyDose ? `${session.pediatricData.energyDose} J` : "N/A"}
                  </Text>
              </View>
          )}
          <Text
            style={[
              styles.headerLine,
              { color: isDark ? "#d1d5db" : "#374151" },
            ]}
          >
            Duree: {formatDuration(session.startTime, session.endTime)}
          </Text>
          <Text
            style={[
              styles.headerLine,
              { color: isDark ? "#d1d5db" : "#374151" },
            ]}
          >
            Chocs: {shockCount}
          </Text>
          <Text
            style={[
              styles.headerLine,
              { color: isDark ? "#d1d5db" : "#374151" },
            ]}
          >
            Événements: {session.events.length}
          </Text>
        </View>

        <View
          style={[
            styles.timelineCard,
            {
              backgroundColor: isDark ? "#1f2937" : "#fff",
              borderColor: isDark ? "#374151" : "#e5e7eb",
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#f9fafb" : "#111827" },
            ]}
          >
            Chronologie complete
          </Text>
          {eventsWithCycles.length === 0 ? (
            <Text
              style={[
                styles.emptyTimeline,
                { color: isDark ? "#9ca3af" : "#6b7280" },
              ]}
            >
              Aucun evenement enregistre.
            </Text>
          ) : (
            eventsWithCycles.map(({ event, cycle }, index) => (
              <View
                key={`${event.timestamp}-${index}`}
                style={[
                  styles.eventRow,
                  { borderBottomColor: isDark ? "#374151" : "#f1f5f9" },
                ]}
              >
                <View style={styles.eventContent}>
                  <Text
                    style={[
                      styles.eventCycle,
                      { color: isDark ? "#9ca3af" : "#64748b" },
                    ]}
                  >
                    RCP {cycle}
                  </Text>
                  <Text
                    style={[
                      styles.eventTime,
                      { color: isDark ? "#93c5fd" : "#2563eb" },
                    ]}
                  >
                    Heure: {formatHumanReadableDateTime(event.timestamp)}
                  </Text>
                  <Text
                    style={[
                      styles.eventTime,
                      { color: isDark ? "#93c5fd" : "#2563eb" },
                    ]}
                  >
                    Temps écoulé :{" "}
                    {formatElapsedFromStart(session.startTime, event.timestamp)}
                  </Text>
                  <Text
                    style={[
                      styles.eventType,
                      { color: isDark ? "#f3f4f6" : "#0f172a" },
                    ]}
                  >
                    {formatEventType(event.type)}
                  </Text>
                  <Text
                    style={[
                      styles.eventDetails,
                      { color: isDark ? "#cbd5e1" : "#475569" },
                    ]}
                  >
                    {formatEventDetails(event.details)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <SafeAreaView style={styles.actionBar}>
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: isDark ? "#374151" : "#e2e8f0" },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={isDark ? "#e5e7eb" : "#334155"}
          />
          <Text
            style={[
              styles.secondaryButtonText,
              { color: isDark ? "#e5e7eb" : "#334155" },
            ]}
          >
            Retour
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleExport}>
          <Ionicons name="share-outline" size={18} color="#fff" />
          <Text style={styles.primaryButtonText}>Exporter PDF</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  headerLine: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  timelineCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  eventRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  eventCycle: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 3,
  },
  eventContent: {
    gap: 2,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: "600",
  },
  eventType: {
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "700",
  },
  eventDetails: {
    fontSize: 13,
    color: "#475569",
  },
  actionBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#e2e8f0",
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
  },
  emptyTimeline: {
    fontSize: 14,
    color: "#6b7280",
  },
});
