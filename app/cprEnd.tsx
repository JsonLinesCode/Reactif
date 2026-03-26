import { FontAwesome5 } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CprSession } from "@/models/session";
import { sessionStore } from "@/store/sessionStore";
import {
  formatEventDetails,
  formatEventType,
  getEventsWithCycles,
} from "@/utils/sessionUtils";
import { router, Stack, useLocalSearchParams } from "expo-router";

export default function CprEnd() {
  const theme = sessionStore.theme;
  const bgStyle = theme === "dark" ? { backgroundColor: "#353636" } : {};
  const params = useLocalSearchParams();
  const initialMode = params.mode === "death" ? "summary" : "racs";

  const [step, setStep] = useState<"racs" | "summary">(initialMode as any);
  const [session, setSession] = useState<CprSession | null>(null);

  useEffect(() => {
    const current = sessionStore.getSession();
    setSession(current);

    if (params.mode === "death") {
      setStep("summary");
    } else {
      setStep("racs");
    }
  }, [params.mode]);

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

  // derived data
  const getDurationString = () => {
    if (!session || !session.endTime) return "0 minutes et 0 secondes";
    const diff = session.endTime - session.startTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes} minutes et ${seconds} secondes`;
  };

  const getShockCount = () => {
    return session?.events.filter((e: any) => e.type === "shock").length || 0;
  };

  const getActions = () => {
    if (!session) return [];
    return getEventsWithCycles(session).filter(({ event }) =>
      ["cordarone", "adrenaline"].includes(event.type),
    );
  };

  const getCustomEvents = () => {
    if (!session) return [];
    return getEventsWithCycles(session).filter(
      ({ event }) => event.type === "event",
    );
  };

  if (step === "racs") {
    return (
      <SafeAreaView style={[styles.container, bgStyle]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.confirmContainer}>
          <Text
            style={[styles.title, theme === "dark" ? { color: "#ccc" } : {}]}
          >
            RACS
          </Text>
          <Text
            style={[styles.subtitle, theme === "dark" ? { color: "#fff" } : {}]}
          >
            Retour d&#39;Activité Circulatoire Spontanée
          </Text>

          <View style={styles.buttonGroupConfirm}>
            <TouchableOpacity
              style={[
                styles.buttonConfirm,
                styles.outlineButton
              ]}
              onPress={handleResume}
            >
              <Text style={[styles.buttonText]}>
                Reprendre la RCP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buttonConfirm,
                styles.outlineButton,
                styles.deathButton,
              ]}
              onPress={handleDeath}
            >
              <Text style={[styles.buttonText]}>Décès</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buttonConfirm,
                styles.outlineButton,
              ]}
              onPress={handleConfirmEnd}
            >
              <Text style={[styles.buttonText]}>
                Fin d'intervention
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const actions = getActions();
  const customEvents = getCustomEvents();
  const summaryTitle =
    session?.events.find((e: any) => e.type === "cpr_end")?.details ||
    "Fin de session";

  return (
    <SafeAreaView style={[styles.container, styles.summaryBackground, bgStyle]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.summaryScroll}>
        <View style={styles.header}>
          <Text
            style={[
              styles.headerTitle,
              theme === "dark" ? { color: "#ccc" } : {},
            ]}
          >
            {" "}
            {summaryTitle === "Décès" ? "Patient décédé" : "Résumé de la RCP"}
          </Text>
        </View>

        {/* Stats Card */}
        <View
          style={[
            styles.card,
            theme === "dark" ? { backgroundColor: "#999" } : {},
          ]}
        >
          <View style={[styles.cardRow]}>
            <FontAwesome5
              name="hourglass-half"
              size={18}
              color="black"
              style={styles.iconWidth}
            />
            <Text style={styles.cardText}>
              Durée totale: {getDurationString()}
            </Text>
          </View>
          <View style={[styles.cardRow, { marginTop: 8 }]}>
            <FontAwesome5
              name="bolt"
              size={18}
              color="black"
              style={styles.iconWidth}
            />
            <Text style={styles.cardText}>
              Chocs délivrés: {getShockCount()}
            </Text>
          </View>
        </View>

        {/* Actions Card */}
        <View
          style={[
            styles.card,
            theme === "dark" ? { backgroundColor: "#999" } : {},
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}> Actions réalisées:</Text>
          </View>
          <View
            style={[
              styles.divider,
              theme === "dark" ? { backgroundColor: "black" } : {},
            ]}
          />
          {actions.length === 0 ? (
            <Text
              style={[
                styles.emptyText,
                theme === "dark" ? { color: "#555" } : {},
              ]}
            >
              Aucune action.
            </Text>
          ) : (
            actions.map(({ event, cycle }, i) => (
              <Text key={i} style={styles.itemText}>
                • [RCP {cycle}] {formatEventType(event.type)}
              </Text>
            ))
          )}
        </View>

        {/* Events Card */}
        <View
          style={[
            styles.card,
            theme === "dark" ? { backgroundColor: "#999" } : {},
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}> Événements saisis:</Text>
          </View>
          <View
            style={[
              styles.divider,
              theme === "dark" ? { backgroundColor: "black" } : {},
            ]}
          />
          {customEvents.length === 0 ? (
            <Text
              style={[
                styles.emptyText,
                theme === "dark" ? { color: "#555" } : {},
              ]}
            >
              Aucun événement.
            </Text>
          ) : (
            customEvents.map(({ event, cycle }, i: number) => (
              <Text key={i} style={styles.itemText}>
                • [RCP {cycle}] {formatEventDetails(event.details)}
              </Text>
            ))
          )}
        </View>

        {/* Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.outlineSummaryButton]}
            onPress={handleExportPdf}
          >
            <FontAwesome5 name="file-pdf" size={18} color="#546E7A" />
            <Text style={styles.actionButtonText}> Exporter en PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.outlineSummaryButton]}
            onPress={handleGoHome}
          >
            <FontAwesome5 name="home" size={18} color="#546E7A" />
            <Text style={styles.actionButtonText}>
              {" "}
              Retour à l&apos;accueil
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
        </tr>
      `,
    )
    .join("");

  const pediatricInfo = session.pediatricData
    ? `<p><strong>Patient:</strong> Enfant (${session.pediatricData.ageValue} ${session.pediatricData.ageMode})</p>`
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
  summaryBackground: {
    backgroundColor: "#F0F2F5",
  },
  summaryScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D47A1",
    marginLeft: 10,
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
    alignItems: "center",
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
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 2,
    borderWidth: 2,
  },
  actionButtonText: {
    color: "#546E7A",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  outlineSummaryButton: {
    backgroundColor: "transparent",
    borderColor: "#546E7A",
  },

  // Confirm styles
  confirmContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  buttonGroupConfirm: {
    width: "100%",
    gap: 15,
  },
  buttonConfirm: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  resumeButton: {
    borderColor: "#28a745",
  },
  stopButton: {
    borderColor: "#d9534f",
  },
  deathButton: {
    borderColor: "#333",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
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
});
