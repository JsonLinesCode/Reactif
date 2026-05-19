import { CprEvent, CprSession } from "@/models/session";
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
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
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
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function HistoryDetail() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const [session, setSession] = useState<CprSession | null>(null);
  const [theme, setTheme] = useState(sessionStore.theme);
  const isDark = theme === "dark";
  const pageStyle = { backgroundColor: isDark ? "#353636" : "#f3f4f6" };
  const cardStyle = {
    backgroundColor: isDark ? "#222121" : "#fff",
    borderColor: isDark ? "#555" : "#e5e7eb",
  };
  const primaryTextStyle = { color: isDark ? "#fff" : "#111827" };
  const secondaryTextStyle = { color: isDark ? "#ddd" : "#374151" };
  const mutedTextStyle = { color: isDark ? "#aaa" : "#64748b" };
  const dividerStyle = { borderBottomColor: isDark ? "#444" : "#f1f5f9" };
  const outlineColor = isDark ? "#fff" : "#2563eb";
  const outlineButtonStyle = {
    backgroundColor: "transparent",
    borderColor: outlineColor,
    borderWidth: isDark ? 2 : 0,
  };
  const outlineButtonTextStyle = { color: outlineColor };

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
          pageStyle,
        ]}
      >
        <Stack.Screen
          options={{
            title: "Détail session",
            headerStyle: pageStyle,
            headerTintColor: isDark ? "#fff" : "#111827",
          }}
        />
        <View style={styles.emptyContainer}>
          <Text
            style={[
              styles.emptyText,
              mutedTextStyle,
            ]}
          >
            Session introuvable.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, outlineButtonStyle]}
            onPress={() => router.back()}
          >
            <Text style={[styles.primaryButtonText, outlineButtonTextStyle]}>
              Retour
            </Text>
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
        pageStyle,
      ]}
    >
      <Stack.Screen
        options={{
          title: "Détail session",
          headerStyle: pageStyle,
          headerTintColor: isDark ? "#fff" : "#111827",
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.headerCard,
            cardStyle,
          ]}
        >
          <Text style={[styles.headerTitle, primaryTextStyle]}>
            Résumé RCP
          </Text>
          <Text style={[styles.headerLine, secondaryTextStyle]}>
            Date: {startDate.toLocaleDateString()}
          </Text>
          <Text style={[styles.headerLine, secondaryTextStyle]}>
            Patient: {session.pediatricData ? "Enfant" : "Standard"}
          </Text>
          {session.pediatricData && (
            <View>
              {session.pediatricData.inputMode === "weight" && (
                <Text
                  style={[
                    styles.headerLine,
                    secondaryTextStyle,
                  ]}
                >
                  Poids:{" "}
                  {session.pediatricData.weight
                    ? `${session.pediatricData.weight} kg`
                    : "N/A"}
                </Text>
              )}
              {session.pediatricData.inputMode !== "weight" && (
                <Text
                  style={[
                    styles.headerLine,
                    secondaryTextStyle,
                  ]}
                >
                  Age:{" "}
                  {session.pediatricData.ageValue
                    ? `${session.pediatricData.ageValue} ${session.pediatricData.ageMode}`
                    : "N/A"}
                </Text>
              )}
              <Text
                style={[
                  styles.headerLine,
                  secondaryTextStyle,
                ]}
              >
                Adrenaline:{" "}
                {session.pediatricData.adrenalineDose
                  ? `${session.pediatricData.adrenalineDose} mg`
                  : "N/A"}
                , Cordarone:{" "}
                {session.pediatricData.cordaroneDose
                  ? `${session.pediatricData.cordaroneDose} mg`
                  : "N/A"}
                , Energie:{" "}
                {session.pediatricData.energyDose
                  ? `${session.pediatricData.energyDose} J`
                  : "N/A"}
              </Text>
            </View>
          )}
          <Text style={[styles.headerLine, secondaryTextStyle]}>
            Duree: {formatDuration(session.startTime, session.endTime)}
          </Text>
          <Text style={[styles.headerLine, secondaryTextStyle]}>
            Chocs: {shockCount}
          </Text>
          <Text style={[styles.headerLine, secondaryTextStyle]}>
            Événements: {session.events.length}
          </Text>
        </View>

        <View
          style={[
            styles.timelineCard,
            cardStyle,
          ]}
        >
          <Text style={[styles.sectionTitle, primaryTextStyle]}>
            Chronologie complète
          </Text>
          {eventsWithCycles.length === 0 ? (
            <Text style={[styles.emptyTimeline, mutedTextStyle]}>
              Aucun evenement enregistre.
            </Text>
          ) : (
            eventsWithCycles.map(({ event, cycle }, index) => (
              <View
                key={`${event.timestamp}-${index}`}
                style={[
                  styles.eventRow,
                  dividerStyle,
                ]}
              >
                <View style={styles.eventContent}>
                  <Text style={[styles.eventCycle, mutedTextStyle]}>
                    RCP {cycle}
                  </Text>
                  <Text
                    style={[
                      styles.eventTime,
                      outlineButtonTextStyle,
                    ]}
                  >
                    Heure: {formatHumanReadableDateTime(event.timestamp)}
                  </Text>
                  <Text
                    style={[
                      styles.eventTime,
                      outlineButtonTextStyle,
                    ]}
                  >
                    Temps écoulé :{" "}
                    {formatElapsedFromStart(session.startTime, event.timestamp)}
                  </Text>
                  <Text style={[styles.eventType, primaryTextStyle]}>
                    {formatEventType(event.type)}
                  </Text>
                  <Text style={[styles.eventDetails, secondaryTextStyle]}>
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
            isDark
              ? outlineButtonStyle
              : { backgroundColor: "#e2e8f0", borderWidth: 0 },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={isDark ? "#fff" : "#334155"}
          />
          <Text
            style={[
              styles.secondaryButtonText,
              isDark ? { color: "#fff" } : { color: "#334155" },
            ]}
          >
            Retour
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, isDark ? outlineButtonStyle : {}]}
          onPress={handleExport}
        >
          <FontAwesome5
            name="file-pdf"
            size={18}
            color={isDark ? outlineColor : "#fff"}
          />
          <Text
            style={[
              styles.primaryButtonText,
              isDark ? outlineButtonTextStyle : {},
            ]}
          >
            Exporter en PDF
          </Text>
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
