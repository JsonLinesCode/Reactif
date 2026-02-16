import React, { useState } from "react";
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    Alert,
    TextInput,
    LayoutAnimation,
    Platform,
    UIManager,
    KeyboardAvoidingView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {router} from "expo-router";
import { sessionStore } from "@/store/sessionStore";
import CustomSwitch from "@/components/CustomSwitch";



//For Android platforms (for animations)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AgeMode = 'months' | 'years';

let savedDatas: Record<AgeMode, string> = {
    months: "",
    years: ""
};

export default function ChildDatas() {
    {/* Animation for the expansion of the content */}
    const [expanded, setExpanded] = useState(false);
    const toggleExpand = () => {
        //Animation
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (!expanded) {
            setWeightExpanded(false);
        }
        setExpanded(!expanded);
    };

    {/* Age input states */}
    const [mode, setMode] = useState<AgeMode | undefined>('months');
    const [valeurTemp, setValeurTemp] = useState('');

    const onSelectSwitch = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (index === 1) {
            setMode('months');
        } else {
            setMode('years');
        }
        setValeurTemp('');
    };

    {/* Weight expansion state */}
    const [weightExpanded, setWeightExpanded] = useState(false);
    const toggleWeightExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (!weightExpanded) {
            setExpanded(false);
        }
        setWeightExpanded(!weightExpanded);
    };

    const MONTHLY_WEIGHTS = [3, 4, 5, 5.5, 6, 6.5, 7, 8, 8.5, 9, 9, 9.5];

    const calculateWeightFromAge = (age: number, mode: AgeMode | undefined) => {
        if (isNaN(age) || age < 0 || !mode) return null;

        const strategies: Record<AgeMode, () => number | null> = {
            months: () => (age >= 12 ? 10 : MONTHLY_WEIGHTS[age] ?? null),
            years: () => (age >= 1 && age <= 12 ? (age + 4) * 2 : null)
        };

        return strategies[mode] ? strategies[mode]() : null;
    };
    const parsedAge = parseInt(valeurTemp, 10);


    {/* Weight input state */}
    const [weightInput, setWeightInput] = useState('');
    const finalWeight = weightInput ? parseFloat(weightInput) : calculateWeightFromAge(parsedAge, mode);

    const adrenalineDose = finalWeight ? (0.01 * finalWeight).toFixed(2) : null;
    const cordaroneDose = finalWeight ? (5 * finalWeight).toFixed(1) : null;
    const energyDose = finalWeight ? (4 * finalWeight).toFixed(0) : null;

    const handleValidation = () => {
        if (!mode && !weightInput) {
             Alert.alert("Erreur", "Veuillez entrer une donnée (âge ou poids).");
             return;
        }

        const ageVal = parsedAge || 0;
        const currentMode = mode || 'years'; // Default if only weight is entered, though logically ageMode might not matter if weight is manual. Let's keep it simple.


        // Save to store
        sessionStore.setPediatricData({
            ageMode: currentMode,
            ageValue: ageVal,
            weight: finalWeight ?? 0,
            adrenalineDose: adrenalineDose ?? undefined,
            cordaroneDose: cordaroneDose ?? undefined,
            energyDose: energyDose ?? undefined
        });

        router.push("/displayChildData");
    };



    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#25292e'}} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
            <ScrollView contentContainerStyle={styles.Container} keyboardShouldPersistTaps="handled">
                <Text style={styles.titleText}>
                    Sélectionnez l'âge ou le poids de l'enfant pour calculer les doses et énergies de RCP pédiatrique.
                </Text>
                <TouchableOpacity
                    style={styles.choiceButton}
                    onPress={toggleExpand}
                >
                    <Text style={styles.choiceButtonText}>
                        {expanded ? "Âge" : "Âge"}
                    </Text>
                </TouchableOpacity>
                {/* Content that disappear/appear */}
                {expanded && (
                    <View style={styles.expandedContent}>
                        <Text style={styles.expendedButtonText}> Choix mois/années</Text>
                        <View style={{marginVertical: 20}}>
                            <CustomSwitch
                                selectionMode={mode === 'years' ? 2 : 1}
                                roundCorner={true}
                                option1={'Mois'}
                                option2={'Années'}
                                onSelectSwitch={onSelectSwitch}
                                selectionColor={'#007BFF'}
                            />
                        </View>

                        {mode === 'months' && (
                                <View style={styles.expandedContent}>
                                    <Text style={styles.expendedButtonText}>{"Entrez l'âge (mois):"}</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholder="Ex: 10"
                                        placeholderTextColor="#ccc"
                                        value={mode === 'months' ? valeurTemp : ''}
                                        onChangeText={(text) => {
                                            setMode('months');
                                            setValeurTemp(text);
                                        }}
                                    />
                                    <TouchableOpacity
                                        style={styles.validationButton}
                                        onPress={handleValidation}
                                    >
                                        <Text style={styles.subButtonText}> Valider et calculer</Text>
                                    </TouchableOpacity>
                                </View>
                        )}

                        {mode === 'years' && (
                                <View style={styles.expandedContent}>
                                    <Text style={styles.expendedButtonText}>Entrez âge (années):</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholder="Ex: 5"
                                        placeholderTextColor="#ccc"
                                        value={mode === 'years' ? valeurTemp : ''}
                                        onChangeText={(text) => {
                                            setMode('years');
                                            setValeurTemp(text);
                                        }}
                                        maxLength={2}
                                    />
                                    <TouchableOpacity
                                        style={styles.validationButton}
                                        onPress={handleValidation}
                                    >
                                        <Text style={styles.subButtonText}> Valider et calculer</Text>
                                    </TouchableOpacity>
                                </View>
                        )}
                    </View>
                )}
                <View style={styles.expandedContent}></View>
                <TouchableOpacity
                    style={styles.choiceButton}
                    onPress={toggleWeightExpand}
                >
                    <Text style={styles.choiceButtonText}>
                        {weightExpanded ? " Poids (kg)" : "Poids (kg)"}
                    </Text>
                </TouchableOpacity>

                {weightExpanded && (
                        <View style={styles.expandedContent}>
                            <Text style={styles.expendedButtonText}>Entrez le poids (kg):</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 12.5"
                                placeholderTextColor="#ccc"
                                keyboardType="decimal-pad" // Allow decimals for weight
                                value={weightInput}
                                onChangeText={(text) => {
                                    setWeightInput(text);
                                    // If user types here, we probably unset age mode or keep it but rely on weightInput
                                }}
                                maxLength={5} // e.g. 45.5 or 110.2
                            />
                            <TouchableOpacity
                                style={styles.validationButton}
                                onPress={handleValidation}
                            >
                                <Text style={styles.subButtonText}> Valider et calculer</Text>
                            </TouchableOpacity>
                        </View>
                )}

                {/* ADDED: Adult RCP note */}
                <Text style={styles.infoText}>
                    RCP adulte si gabarit adulte (habituellement à la puberté, vers 12-14 ans, ou si plus que 50kg approximativement).
                    Toujours se référer aux recommandations et protocoles locaux.
                </Text>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    Container: {
        flexGrow: 1,
        paddingTop: 100,
        paddingBottom: 150,
        paddingHorizontal: 20,
        justifyContent: "flex-start",
        backgroundColor: "#25292e",
        alignItems: "center",
    },
    titleText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        alignSelf: "center",
    },
    choiceButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    choiceButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 18,
        borderRadius: 12,
        marginBottom: 20,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    expandedContent: {
        backgroundColor: "#25292e",
        paddingVertical: 18,
        borderRadius: 12,
        marginBottom: 20,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    expendedButtonText: {
        color: "#7a7c8a",
        fontSize: 18,
        fontWeight: "bold",
    },
    subButton: {
        backgroundColor: "#66b2ff", // Lighter blue
        paddingVertical: 18,
        borderRadius: 12,
        marginBottom: 20,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    subButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    input: {
        backgroundColor: "#fff",
        color: "#000",
        padding: 10,
        borderRadius: 8,
        width: "80%",
        marginTop: 10,
        fontSize: 16,
    },
    inputButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 18,
        borderRadius: 12,
        marginBottom: 20,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    modeButtonSelected: {
        backgroundColor: "#fff",
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 20,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    activeTab: { backgroundColor: '#007AFF' },
    activeTabText:{ color: '#fff', fontSize: 14, fontWeight: 'bold'},
    tabText: { color: '#007AFF', fontWeight: 'bold', fontSize: 14},
    validationButton: {
        backgroundColor: "#28a745",
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 10,
        width: "100%",
        maxWidth: 150,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    infoText: {
        color: "#ccc",
        fontSize: 14,
        textAlign: "center",
        marginTop: 20,
    }
});
