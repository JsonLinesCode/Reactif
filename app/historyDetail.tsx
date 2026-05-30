import { CprEvent, CprSession } from "@/models/session";
import { sessionStore } from "@/store/sessionStore";
import { t } from "@/i18n";
import {
  CprEpisodeSummary,
  formatElapsedFromStart,
  formatEventDetails,
  formatEventType,
  formatHumanReadableDateTime,
  generateSessionHtml,
  getCprDurationMs,
  getCprEpisodeSummaries,
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
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function HistoryDetail() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const insets = useSafeAreaInsets();
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

  const cprEpisodeSummaries = useMemo(() => {
    if (!session) return [];
    return getCprEpisodeSummaries(session);
  }, [session]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatShortClockTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const formatDurationMs = (durationMs: number) =>
    formatTime(Math.floor(Math.max(0, durationMs) / 1000));

  const renderEventSummaryLine = (label: string, events: CprEvent[]) => (
    <Text style={[styles.headerLine, secondaryTextStyle]}>
      <Text style={styles.summaryLineLabel}>{label}</Text> :{" "}
      <Text style={styles.boldValue}>{events.length}</Text>
      {events.map((event, index) => (
        <Text key={`${label}-${event.timestamp}-${index}`}>
          {" "}
          <Text style={styles.boldValue}>({index + 1})</Text>{" "}
          {formatShortClockTime(event.timestamp)}
        </Text>
      ))}
    </Text>
  );

  const renderCprEpisodeSummary = (
    episode: CprEpisodeSummary,
    hasMultipleEpisodes: boolean,
  ) => {
    const durationSeconds = Math.max(
      0,
      Math.floor((episode.endTime - episode.startTime) / 1000),
    );

    return (
      <View
        key={`history-cpr-summary-${episode.cycle}`}
        style={hasMultipleEpisodes ? styles.cprEpisodeBlock : undefined}
      >
        {hasMultipleEpisodes ? (
          <Text style={[styles.headerTitle, primaryTextStyle]}>
            {t("historyDetail.cprSummaryCycle", { cycle: episode.cycle })}
          </Text>
        ) : null}
        <Text style={[styles.headerLine, secondaryTextStyle]}>
          {t("historyDetail.cprDurationCycle", { cycle: episode.cycle })} :{" "}
          <Text style={styles.boldValue}>{formatTime(durationSeconds)}</Text>
        </Text>
        {renderEventSummaryLine(t("historyDetail.shocks"), episode.shock)}
        {renderEventSummaryLine(t("session.adrenaline"), episode.adrenaline)}
        {renderEventSummaryLine(t("session.cordarone"), episode.cordarone)}
      </View>
    );
  };

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
      Alert.alert(t("history.exportErrorTitle"), t("history.exportErrorMessage"));
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
            title: t("historyDetail.title"),
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
            {t("historyDetail.notFound")}
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, outlineButtonStyle]}
            onPress={() => router.back()}
          >
            <Text style={[styles.primaryButtonText, outlineButtonTextStyle]}>
              {t("common.back")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    );
  }

  const startDate = new Date(session.startTime);
  const cprDurationText = formatDurationMs(getCprDurationMs(session));
  const hasMultipleEpisodes = cprEpisodeSummaries.length > 1;
  const actionBarBottom = Math.max(8, insets.bottom + 8);
  const scrollPaddingBottom = 84 + actionBarBottom;

  return (
    <SafeAreaView
      style={[
        styles.container,
        pageStyle,
      ]}
    >
      <Stack.Screen
        options={{
          title: t("historyDetail.title"),
          headerStyle: pageStyle,
          headerTintColor: isDark ? "#fff" : "#111827",
        }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollPaddingBottom },
        ]}
      >
        <View
          style={[
            styles.headerCard,
            cardStyle,
          ]}
        >
          <Text style={[styles.headerTitle, primaryTextStyle]}>
            {t("historyDetail.cprSummary")}
          </Text>
          <Text style={[styles.headerLine, secondaryTextStyle]}>
            {t("session.date")}: {startDate.toLocaleDateString()}
          </Text>
          <Text style={[styles.headerLine, secondaryTextStyle]}>
            {t("history.patient")}: {session.pediatricData ? t("history.child") : t("history.standard")}
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
                  {t("historyDetail.weight")}:{" "}
                  {session.pediatricData.weight
                    ? `${session.pediatricData.weight} kg`
                    : t("common.na")}
                </Text>
              )}
              {session.pediatricData.inputMode !== "weight" && (
                <Text
                  style={[
                    styles.headerLine,
                    secondaryTextStyle,
                  ]}
                >
                  {t("historyDetail.age")}:{" "}
                  {session.pediatricData.ageValue
                    ? `${session.pediatricData.ageValue} ${
                        session.pediatricData.ageMode === "months"
                          ? t("childData.months")
                          : t("childData.years")
                      }`
                    : t("common.na")}
                </Text>
              )}
              <Text style={[styles.headerLine, secondaryTextStyle]}>
                {t("historyDetail.energy")}:{" "}
                {session.pediatricData.energyDose
                  ? `${session.pediatricData.energyDose} J`
                  : t("common.na")}
              </Text>
            </View>
          )}
          <Text style={[styles.headerLine, secondaryTextStyle]}>
            {t("historyDetail.totalDuration")} : <Text style={styles.boldValue}>{cprDurationText}</Text>
          </Text>
          {cprEpisodeSummaries.length > 0 ? (
            <View style={styles.summaryEpisodesContainer}>
              {cprEpisodeSummaries.map((episode) =>
                renderCprEpisodeSummary(episode, hasMultipleEpisodes),
              )}
            </View>
          ) : (
            <View style={styles.summaryEpisodesContainer}>
              {renderEventSummaryLine(
                t("historyDetail.shocks"),
                session.events.filter((event) => event.type === "shock"),
              )}
              {renderEventSummaryLine(
                t("session.adrenaline"),
                session.events.filter((event) => event.type === "adrenaline"),
              )}
              {renderEventSummaryLine(
                t("session.cordarone"),
                session.events.filter((event) => event.type === "cordarone"),
              )}
            </View>
          )}
          <Text style={[styles.headerLine, secondaryTextStyle]}>
            {t("history.events")}: {session.events.length}
          </Text>
        </View>

        <View
          style={[
            styles.timelineCard,
            cardStyle,
          ]}
        >
          <Text style={[styles.sectionTitle, primaryTextStyle]}>
            {t("historyDetail.fullTimeline")}
          </Text>
          {eventsWithCycles.length === 0 ? (
            <Text style={[styles.emptyTimeline, mutedTextStyle]}>
              {t("historyDetail.noEvents")}
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
                    {t("history.cprPrefix")} {cycle}
                  </Text>
                  <Text
                    style={[
                      styles.eventTime,
                      outlineButtonTextStyle,
                    ]}
                  >
                    {t("common.time")}: {formatHumanReadableDateTime(event.timestamp)}
                  </Text>
                  <Text
                    style={[
                      styles.eventTime,
                      outlineButtonTextStyle,
                    ]}
                  >
                    {t("historyDetail.elapsedTime")} :{" "}
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

      <SafeAreaView style={[styles.actionBar, { bottom: actionBarBottom }]}>
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
            {t("common.back")}
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
            {t("historyDetail.exportPdf")}
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
  summaryLineLabel: {
    fontWeight: "700",
  },
  boldValue: {
    fontWeight: "700",
  },
  summaryEpisodesContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  cprEpisodeBlock: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    marginTop: 10,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    textAlign: "center",
    flexShrink: 1,
    includeFontPadding: false,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#e2e8f0",
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    textAlign: "center",
    flexShrink: 1,
    includeFontPadding: false,
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
