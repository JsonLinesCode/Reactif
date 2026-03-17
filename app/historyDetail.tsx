import { CprEvent, CprSession } from "@/models/session";
import { sessionStore } from "@/store/sessionStore";
import {
  formatDuration,
  formatEventDetails,
  formatEventType,
  generateSessionHtml,
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryDetail() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const [session, setSession] = useState<CprSession | null>(null);

  useEffect(() => {
    const loadSession = () => {
      const id = typeof sessionId === "string" ? sessionId : "";
      const found = sessionStore.getHistory().find((item) => item.id === id) || null;
      setSession(found);
    };

    loadSession();
    const unsubscribe = sessionStore.subscribe(loadSession);
    return unsubscribe;
  }, [sessionId]);

  const sortedEvents = useMemo(() => {
    if (!session) return [];
    return [...session.events].sort((a, b) => a.timestamp - b.timestamp);
  }, [session]);

  const shockCount = useMemo(() => {
    if (!session) return 0;
    return session.events.filter((evt: CprEvent) => evt.type === "shock").length;
  }, [session]);

  const handleExport = async () => {
    if (!session) return;

    try {
      const { uri } = await Print.printToFileAsync({ html: generateSessionHtml(session) });
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
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Detail session" }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Session introuvable.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const startDate = new Date(session.startTime);
  const endDate = session.endTime ? new Date(session.endTime) : null;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Detail session" }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Session CPR complete</Text>
          <Text style={styles.headerLine}>Date: {startDate.toLocaleDateString()}</Text>
          <Text style={styles.headerLine}>Debut: {startDate.toLocaleTimeString()}</Text>
          <Text style={styles.headerLine}>
            Fin: {endDate ? endDate.toLocaleTimeString() : "Session en cours"}
          </Text>
          <Text style={styles.headerLine}>
            Patient: {session.pediatricData ? "Enfant" : "Standard"}
          </Text>
          <Text style={styles.headerLine}>
            Duree: {formatDuration(session.startTime, session.endTime)}
          </Text>
          <Text style={styles.headerLine}>Chocs: {shockCount}</Text>
          <Text style={styles.headerLine}>Evenements: {session.events.length}</Text>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Chronologie complete</Text>
          {sortedEvents.length === 0 ? (
            <Text style={styles.emptyTimeline}>Aucun evenement enregistre.</Text>
          ) : (
            sortedEvents.map((event, index) => (
              <View key={`${event.timestamp}-${index}`} style={styles.eventRow}>
                <View style={styles.eventTimeContainer}>
                  <Text style={styles.eventTime}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.eventContent}>
                  <Text style={styles.eventType}>{formatEventType(event.type)}</Text>
                  <Text style={styles.eventDetails}>{formatEventDetails(event.details)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#334155" />
          <Text style={styles.secondaryButtonText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleExport}>
          <Ionicons name="share-outline" size={18} color="#fff" />
          <Text style={styles.primaryButtonText}>Exporter PDF</Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  eventTimeContainer: {
    width: 90,
  },
  eventTime: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  eventContent: {
    flex: 1,
    gap: 2,
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