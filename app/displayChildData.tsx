import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sessionStore, PediatricData } from '@/store/sessionStore';
import {router} from "expo-router";

export default function DisplayChildData() {
  const [data, setData] = useState<PediatricData | undefined>(sessionStore.getPediatricData());

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setData(sessionStore.getPediatricData());
    });
    return unsubscribe;
  }, []);

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Aucune donnée pédiatrique disponible.</Text>
      </SafeAreaView>
    );
  }

  const { ageValue, ageMode, weight, adrenalineDose, cordaroneDose, energyDose } = data;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Données Patient</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Age:</Text>
          <Text style={styles.value}>
            {ageValue} {ageMode === 'months' ? 'Mois' : 'Ans'}
          </Text>

          <Text style={styles.label}>Poids Estimé/Saisi:</Text>
          <Text style={styles.value}>{weight} kg</Text>

          <View style={styles.separator} />

          <Text style={styles.label}>Adrénaline (IV/IO):</Text>
          <Text style={styles.value}>{adrenalineDose ? `${adrenalineDose} mg` : 'N/A'}</Text>

          <Text style={styles.label}>Amiodarone (Cordarone):</Text>
          <Text style={styles.value}>{cordaroneDose ? `${cordaroneDose} mg` : 'N/A'}</Text>

          <Text style={styles.label}>Choc électrique (Energie):</Text>
          <Text style={styles.value}>{energyDose ? `${energyDose} J` : 'N/A'}</Text>
        </View>
          <TouchableOpacity
          style={styles.validationButton}
          onPress={ () => router.push("/cpr")}
          >
              <Text
              style={styles.validationButtonText}
              >
                  Valider et commencer RCP
              </Text>
          </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#90EE90', // Light green border
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#2a2e33',
  },
  label: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 10,
  },
  value: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 15,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
    validationButton: {
        backgroundColor: "#28a745",
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 10,
        width: "100%",
        maxWidth: 150,
        alignItems: "auto",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    validationButtonText:{
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});
