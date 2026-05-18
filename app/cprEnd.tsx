import { FontAwesome5 } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G } from "react-native-svg";

import EventSelectionModal from "@/components/EventSelectionModal";
import { sessionController } from "@/controllers/SessionController";
import { CprSession } from "@/models/session";
import { sessionStore } from "@/store/sessionStore";
import {
  formatElapsedFromStart,
  formatEventDetails,
  formatEventType,
  formatHumanReadableDateTime,
  formatHumanReadableTime,
  formatTimeWithLetters,
  getEventsWithCycles,
} from "@/utils/sessionUtils";
import { router, Stack, useLocalSearchParams } from "expo-router";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function CprEnd() {
  const { width } = useWindowDimensions();
  const [theme, setTheme] = useState(sessionStore.theme);
  const isDark = theme === "dark";
  const bgStyle = isDark ? { backgroundColor: "#353636" } : {};
  const textStyle = { color: isDark ? "#fff" : "#333" };
  const mutedTextStyle = { color: isDark ? "#cbd5e1" : "#64748b" };
  const cardStyle = {
    backgroundColor: isDark ? "#222121" : "#fff",
    borderColor: isDark ? "#555" : "#E0E0E0",
  };
  const cardTitleStyle = { color: isDark ? "#93c5fd" : "#0D47A1" };
  const dividerStyle = { backgroundColor: isDark ? "#555" : "#EEEEEE" };
  const neutralButtonColor = isDark ? "#fff" : "#007BFF";
  const outlineButtonStyle = {
    backgroundColor: "transparent",
    borderColor: neutralButtonColor,
  };
  const outlineButtonTextStyle = { color: neutralButtonColor };
  const params = useLocalSearchParams();
  const initialMode = params.mode === "death" ? "summary" : "racs";

  const [step, setStep] = useState<"racs" | "summary">(initialMode as any);
  const [session, setSession] = useState<CprSession | null>(null);
  const ecgDurationSeconds = 8 * 60;
  const [ecgTimeLeft, setEcgTimeLeft] = useState(ecgDurationSeconds);
  const ecgAlertedRef = useRef(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [racsElapsedSeconds, setRacsElapsedSeconds] = useState(0);
  const [cprElapsedSeconds, setCprElapsedSeconds] = useState(0);
  const racsStartRef = useRef<number | null>(null);
  const ecgBounceAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== "android") return;
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true,
      );
      return () => {
        subscription.remove();
      };
    }, []),
  );

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const current = sessionStore.getSession();
    setSession(current);

    if (params.mode === "death") {
      setStep("summary");
    } else {
      setStep("racs");
    }
  }, [params.mode]);

  useEffect(() => {
    if (step !== "racs") return;

    const startTime = Date.now();
    setEcgTimeLeft(ecgDurationSeconds);
    ecgAlertedRef.current = false;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, ecgDurationSeconds - elapsed);
      setEcgTimeLeft(remaining);

      if (remaining === 0 && !ecgAlertedRef.current) {
        ecgAlertedRef.current = true;
        sessionController.playReminderPattern("end");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ecgDurationSeconds, step]);

  useEffect(() => {
    if (step !== "racs") return;

    racsStartRef.current = Date.now();
    const update = () => {
      if (racsStartRef.current) {
        setRacsElapsedSeconds(
          Math.floor((Date.now() - racsStartRef.current) / 1000),
        );
      }
      if (session?.startTime) {
        setCprElapsedSeconds(
          Math.floor((Date.now() - session.startTime) / 1000),
        );
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [session?.startTime, step]);

  const handleResume = () => {
    // "Reprendre la RCP"
    sessionStore.logEvent("event", "RESUME");
    router.dismissAll();
    router.replace("/cpr");
  };

  const handleDeath = async () => {
    // "Décès"
    await sessionStore.saveCurrentSession("Décès");
    setSession(sessionStore.getSession());
    setStep("summary");
  };

  const handleConfirmEnd = async () => {
    // "Arrêter définitivement" (RACS -> Stop)
    await sessionStore.saveCurrentSession("Arrêt définitif");
    setSession(sessionStore.getSession());
    setStep("summary");
  };

  const handleOpenAideCognitive = () => {
    router.push("/aide-cognitive");
  };

  const handleEcgPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sessionStore.logEvent("event", "ECG");
  };

  const handleEvent = () => setModalVisible(true);

  const handleSaveEvents = (selectedEvents: string[]) => {
    sessionController.logEvents(selectedEvents);
  };

  const handleExportPdf = async () => {
    if (!session) return;

    const html = generateHtml(session);
    try {
      const { uri } = await Print.printToFileAsync({ html });
      console.log("File has been saved to:", uri);
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de générer ou partager le PDF.");
      console.error(error);
    }
  };

  const handleGoHome = () => {
    sessionStore.startNewSession(); // Reset for next time
    router.replace("/");
  };

  const getDurationString = () => {
    if (!session || !session.endTime) return "0 minutes et 0 secondes";
    const diff = session.endTime - session.startTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes} minutes et ${seconds} secondes`;
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatEventSummary = (type: string) => {
    if (!session) return "0";
    const events = session.events.filter((e: any) => e.type === type);
    if (events.length === 0) return "0";

    const details = events
      .map((e: any, index: number) => {
        const date = new Date(e.timestamp);
        const hh = date.getHours().toString().padStart(2, "0");
        const mm = date.getMinutes().toString().padStart(2, "0");
        return `${index + 1}: ${hh}:${mm}`;
      })
      .join("; ");

    return `${events.length} (${details})`;
  };

  const getActions = () => {
    if (!session) return [];
    return getEventsWithCycles(session).filter(({ event }) =>
      ["analysis", "shock", "cordarone", "adrenaline"].includes(event.type),
    );
  };

  const getCustomEvents = () => {
    if (!session) return [];
    return getEventsWithCycles(session).filter(
      ({ event }) => event.type === "event",
    );
  };

  const ecgSize = Math.min(width - 120, 150);
  const ecgStrokeWidth = 12;
  const ecgRadius = (ecgSize - ecgStrokeWidth) / 2;
  const ecgCircumference = 2 * Math.PI * ecgRadius;
  const ecgCenter = ecgSize / 2;
  const ecgInnerSize = ecgSize - 45;
  const ecgInnerRadius = ecgInnerSize / 2;
  const ecgProgress =
    ecgDurationSeconds > 0 ? ecgTimeLeft / ecgDurationSeconds : 0;
  const ecgStrokeDashoffset = ecgCircumference * (1 - ecgProgress);

  if (step === "racs") {
    return (
      <SafeAreaView style={[styles.container, bgStyle]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={styles.confirmContainer}>
          <Text style={[styles.title, isDark ? { color: "#ccc" } : {}]}>
            RACS
          </Text>

          <View
            style={[
              styles.card,
              cardStyle,
              styles.racsSummaryCard,
            ]}
          >
            <View
              style={[
                styles.racsTimerCard,
                isDark
                  ? { backgroundColor: "#353636", borderColor: "#fff" }
                  : {},
              ]}
            >
              <Text style={[styles.racsTimerLabel, textStyle]}>
                RACS depuis
              </Text>
              <Text style={[styles.racsTimerValue, textStyle]}>
                {formatTime(racsElapsedSeconds)}
              </Text>
            </View>

            <View>
              <Text style={[styles.cardText, textStyle]}>
                Session RCP complète
              </Text>
              <Text style={[styles.cardText, textStyle]}>
                Date:{" "}
                {session
                  ? new Date(session.startTime).toLocaleDateString()
                  : "N/A"}
              </Text>
              <Text style={[styles.cardText, textStyle]}>
                Durée RCP (totale): {formatTime(cprElapsedSeconds)}
              </Text>
              <Text style={[styles.cardText, textStyle]}>
                Chocs : {formatEventSummary("shock")}
              </Text>
              <Text style={[styles.cardText, textStyle]}>
                Adrénaline : {formatEventSummary("adrenaline")}
              </Text>
              <Text style={[styles.cardText, textStyle]}>
                Cordarone : {formatEventSummary("cordarone")}
              </Text>
            </View>
          </View>

          <View style={styles.ecgSection}>
            <AnimatedTouchableOpacity
              onPress={handleEcgPress}
              onPressIn={() => {
                Animated.timing(ecgBounceAnim, {
                  toValue: 0.95,
                  duration: 100,
                  useNativeDriver: true,
                }).start();
              }}
              onPressOut={() => {
                Animated.timing(ecgBounceAnim, {
                  toValue: 1,
                  duration: 100,
                  useNativeDriver: true,
                }).start();
              }}
              activeOpacity={0.8}
              style={[
                styles.ecgButton,
                {
                  width: ecgSize,
                  height: ecgSize,
                  transform: [{ scale: ecgBounceAnim }],
                },
              ]}
            >
              <Svg width={ecgSize} height={ecgSize}>
                <G rotation="-90" origin={`${ecgCenter}, ${ecgCenter}`}>
                  <Circle
                    cx={ecgCenter}
                    cy={ecgCenter}
                    r={ecgRadius}
                    stroke="#f5dd4b"
                    strokeWidth={ecgStrokeWidth}
                    fill="none"
                  />
                  <Circle
                    cx={ecgCenter}
                    cy={ecgCenter}
                    r={ecgRadius}
                    stroke="#FF5252"
                    strokeWidth={ecgStrokeWidth}
                    strokeDasharray={ecgCircumference}
                    strokeDashoffset={ecgStrokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                  />
                </G>
              </Svg>
              <View
                style={[
                  styles.ecgInner,
                  {
                    width: ecgInnerSize,
                    height: ecgInnerSize,
                    borderRadius: ecgInnerRadius,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="heart-pulse"
                  size={40}
                  style={[
                    isDark
                      ? { color: "#fff", marginBottom: 4 }
                      : { color: "#000", marginBottom: 4 },
                  ]}
                />
                <Text
                  style={[
                    styles.ecgLabel,
                    isDark ? { color: "#fff" } : { color: "#000" },
                  ]}
                >
                  ECG
                </Text>
                <Text
                  style={[
                    styles.ecgTimer,
                    isDark ? { color: "#fff" } : { color: "#000" },
                  ]}
                >
                  {formatTime(ecgTimeLeft)}
                </Text>
              </View>
            </AnimatedTouchableOpacity>
          </View>

          <View style={styles.buttonGroupConfirm}>
            <TouchableOpacity
              style={[
                styles.buttonConfirm,
                styles.outlineButton,
                outlineButtonStyle,
              ]}
              onPress={handleResume}
            >
              <Text style={[styles.buttonText, outlineButtonTextStyle]}>
                Reprendre la RCP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buttonConfirm,
                styles.outlineButton,
                outlineButtonStyle,
              ]}
              onPress={handleDeath}
            >
              <Text style={[styles.buttonText, outlineButtonTextStyle]}>
                Décès
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buttonConfirm,
                styles.outlineButton,
                outlineButtonStyle,
              ]}
              onPress={handleConfirmEnd}
            >
              <Text style={[styles.buttonText, outlineButtonTextStyle]}>
                Fin d&#39;intervention
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buttonConfirm,
                styles.outlineButton,
                outlineButtonStyle,
              ]}
              onPress={handleEvent}
            >
              <Text style={[styles.buttonText, outlineButtonTextStyle]}>
                Ajouter un évènement
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.racsSeparator,
                { backgroundColor: isDark ? "#6b7280" : "#d1d5db" },
              ]}
            />

            <TouchableOpacity
              style={[
                styles.buttonConfirm,
                styles.outlineButton,
                outlineButtonStyle,
              ]}
              onPress={handleOpenAideCognitive}
            >
              <Text style={[styles.buttonText, outlineButtonTextStyle]}>
                Aides cognitives
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <EventSelectionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveEvents}
        />
      </SafeAreaView>
    );
  }

  const actions = getActions();
  const customEvents = getCustomEvents();
  const summaryTitle =
    session?.events.find((e: any) => e.type === "cpr_end")?.details ||
    "Fin de session";

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.summaryScroll}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              styles.summaryTitle,
              isDark ? { color: "#ccc" } : {},
            ]}
          >
            {summaryTitle === "Décès" ? "DÉCÈS" : "RÉSUME DE LA RCP"}
          </Text>
        </View>

        {/* Stats Card */}
        <View
          style={[styles.card, cardStyle]}
        >
          <View style={[styles.cardRow]}>
            <Text style={[styles.summaryCardText, textStyle]}>
              <Text style={styles.summaryCardLabel}>DURÉE TOTALE</Text>:{" "}
              {getDurationString()}
            </Text>
          </View>
          <View style={[styles.cardRow, { marginTop: 8 }]}>
            <Text style={[styles.summaryCardText, textStyle]}>
              <Text style={styles.summaryCardLabel}>CHOCS DÉLIVRÉS</Text> :{" "}
              {formatEventSummary("shock")}
            </Text>
          </View>
          <View style={[styles.cardRow, { marginTop: 8 }]}>
            <Text style={[styles.summaryCardText, textStyle]}>
              <Text style={styles.summaryCardLabel}>ADRÉNALINE</Text> :{" "}
              {formatEventSummary("adrenaline")}
            </Text>
          </View>
          <View style={[styles.cardRow, { marginTop: 8 }]}>
            <Text style={[styles.summaryCardText, textStyle]}>
              <Text style={styles.summaryCardLabel}>CORDARONE</Text> :{" "}
              {formatEventSummary("cordarone")}
            </Text>
          </View>
          {summaryTitle === "Décès" && (
            <View style={[styles.cardRow, { marginTop: 8 }]}>
              <Text style={[styles.summaryCardText, textStyle]}>
                <Text style={styles.summaryCardLabel}>HEURE DU DÉCÈS</Text>:{" "}
                {session?.endTime
                  ? formatTimeWithLetters(session.endTime)
                  : "N/A"}
              </Text>
            </View>
          )}
        </View>

        {/* Pediatrics Card */}
        {session?.pediatricData && (
          <View
            style={[styles.card, cardStyle]}
          >
            <View style={styles.cardHeaderRow}>
              <FontAwesome5
                name="child"
                size={18}
                color={isDark ? "#fff" : "black"}
                style={styles.iconWidth}
              />
              <Text style={[styles.cardTitle, cardTitleStyle]}>
                Données pédiatriques:
              </Text>
            </View>
            <View style={[styles.divider, dividerStyle]} />
            {session.pediatricData.inputMode === "weight" ? (
              <Text style={[styles.itemText, textStyle]}>
                Poids: {session.pediatricData.weight} kg
              </Text>
            ) : (
              <Text style={[styles.itemText, textStyle]}>
                Age: {session.pediatricData.ageValue}{" "}
                {session.pediatricData.ageMode}
              </Text>
            )}
            <Text style={[styles.itemText, textStyle]}>
              Adrénaline:{" "}
              {session.pediatricData.adrenalineDose
                ? `${session.pediatricData.adrenalineDose} mg`
                : "N/A"}
            </Text>
            <Text style={[styles.itemText, textStyle]}>
              Cordarone:{" "}
              {session.pediatricData.cordaroneDose
                ? `${session.pediatricData.cordaroneDose} mg`
                : "N/A"}
            </Text>
          </View>
        )}

        {/* Actions Card */}
        <View
          style={[styles.card, cardStyle]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, cardTitleStyle]}>
              Actions réalisées:
            </Text>
          </View>
          <View style={[styles.divider, dividerStyle]} />
          {actions.length === 0 ? (
            <Text
              style={[styles.emptyText, isDark ? { color: "#aaa" } : {}]}
            >
              Aucune action.
            </Text>
          ) : (
            actions.map(({ event, cycle }, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={[styles.itemText, textStyle]}>
                  • [RCP {cycle}] {formatEventType(event.type)}
                </Text>
                <Text style={[styles.itemTimestamp, mutedTextStyle]}>
                  Temps écoulé:{" "}
                  {formatElapsedFromStart(session!.startTime, event.timestamp)}{" "}
                  | Heure: {formatTimeWithLetters(event.timestamp)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Events Card */}
        <View
          style={[styles.card, cardStyle]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, cardTitleStyle]}>
              Événements saisis:
            </Text>
          </View>
          <View style={[styles.divider, dividerStyle]} />
          {customEvents.length === 0 ? (
            <Text
              style={[styles.emptyText, isDark ? { color: "#aaa" } : {}]}
            >
              Aucun événement.
            </Text>
          ) : (
            customEvents.map(({ event, cycle }, i: number) => (
              <View key={i} style={styles.itemRow}>
                <Text style={[styles.itemText, textStyle]}>
                  • [RCP {cycle}] {formatEventDetails(event.details)}
                </Text>
                <Text style={[styles.itemTimestamp, mutedTextStyle]}>
                  Temps écoulé:{" "}
                  {formatElapsedFromStart(session!.startTime, event.timestamp)}{" "}
                  | Heure: {formatHumanReadableTime(event.timestamp)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.outlineSummaryButton,
            outlineButtonStyle,
          ]}
          onPress={handleExportPdf}
        >
          <FontAwesome5 name="file-pdf" size={18} color={neutralButtonColor} />
          <Text style={[styles.actionButtonText, outlineButtonTextStyle]}>
            {" "}
            Exporter en PDF
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.outlineSummaryButton,
            outlineButtonStyle,
          ]}
          onPress={handleGoHome}
        >
          <FontAwesome5 name="home" size={18} color={neutralButtonColor} />
          <Text style={[styles.actionButtonText, outlineButtonTextStyle]}>
            {" "}
            Retour à l&apos;accueil
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Simple HTML generator for the PDF
function generateHtml(session: CprSession) {
  const eventsHtml = getEventsWithCycles(session)
    .map(
      ({ event, cycle }) => `
        <tr>
            <td>RCP ${cycle}</td>
            <td>${formatEventType(event.type)}</td>
            <td>${formatEventDetails(event.details)}</td>
            <td>${formatElapsedFromStart(session.startTime, event.timestamp)}</td>
            <td>${formatHumanReadableDateTime(event.timestamp)}</td>
        </tr>
      `,
    )
    .join("");

  const pediatricInfo = session.pediatricData
    ? `<p><strong>Patient:</strong> Enfant (${session.pediatricData.inputMode === "weight" ? `${session.pediatricData.weight} kg` : `${session.pediatricData.ageValue} ${session.pediatricData.ageMode}`})</p>`
    : `<p><strong>Patient:</strong> Adulte (Standard)</p>`;

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
            body { font-family: Helvetica, Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .info { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .cycle-header td { background-color: #e0e0e0; }
        </style>
      </head>
      <body>
        <h1>Rapport de Réanimation</h1>
        <div class="info">
            <p><strong>Date:</strong> ${new Date(session.startTime).toLocaleDateString()}</p>
            ${pediatricInfo}
            <p><strong>ID Session:</strong> ${session.id}</p>
        </div>
        
        <h2>Journal des événements</h2>
        <table>
            <thead>
                <tr>
                    <th>Cycle</th>
                    <th>Type</th>
                    <th>Détails</th>
                    <th>Temps écoulé</th>
                    <th>Heure</th>
                </tr>
            </thead>
            <tbody>
                ${eventsHtml}
            </tbody>
        </table>
      </body>
    </html>
  `;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  summaryScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryTitle: {
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconWidth: {
    width: 24,
    textAlign: "center",
    marginRight: 8,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
  summaryCardText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
    flexWrap: "wrap",
  },
  summaryCardLabel: {
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D47A1",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
    fontStyle: "italic",
    marginTop: 4,
  },
  itemText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  itemRow: {
    marginBottom: 8,
  },
  itemTimestamp: {
    fontSize: 13,
    color: "#64748b",
    marginLeft: 12,
  },
  cycleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D47A1",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
  },
  cycleContainer: {
    marginBottom: 10,
  },

  actionButtonsContainer: {
    backgroundColor: "transparent",
    marginTop: 5,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    borderColor: "#007BFF",
    borderWidth: 2,
  },
  actionButtonText: {
    color: "#007BFF",

    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    textTransform: "uppercase",
    lineHeight: 20,
    textAlign: "center",
    flexShrink: 1,
    includeFontPadding: false,
  },
  outlineSummaryButton: {
    backgroundColor: "transparent",
    borderColor: "#007BFF",
  },

  // Confirm styles
  confirmContainer: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#666",
  },
  racsSummaryCard: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  racsTimerCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#333",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  racsTimerLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  racsTimerValue: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
  },
  buttonGroupConfirm: {
    width: "100%",
    gap: 15,
  },
  racsSeparator: {
    height: 1,
    width: "100%",
    marginVertical: 4,
  },
  buttonConfirm: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    borderColor: "#007BFF",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderColor: "#007BFF",

    borderWidth: 2,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    textTransform: "uppercase",
    lineHeight: 22,
    textAlign: "center",
    flexShrink: 1,
    includeFontPadding: false,
    color: "#007BFF",
  },
  resumeText: {
    color: "black",
  },
  stopText: {
    color: "#d9534f",
  },
  deathText: {
    color: "#333",
  },
  ecgSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  ecgButton: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  ecgInner: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  ecgTimer: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
  },
  ecgLabel: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
    marginTop: 4,
  },
});
