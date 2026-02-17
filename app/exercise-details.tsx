import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Colors } from "../constants/Colors";
import { UserData, userService } from "../services/userService";
import { calculateCaloriesBurned, Intensity } from "../utils/exerciseMetrics";

export default function ExerciseDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useUser();

    // Default values if params missing
    const exerciseId = params.id as 'cardio' | 'weights' || "cardio";
    const exerciseTitle = params.title as string || "Cardio";
    const exerciseIcon = params.icon as any || "fitness-outline";

    const [intensity, setIntensity] = useState<Intensity>("Medium");
    const [duration, setDuration] = useState("30");
    const [manualDuration, setManualDuration] = useState("");
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            userService.getUser(user.id).then(setUserData);
        }
    }, [user]);

    const durationOptions = ["15", "30", "60", "90"];

    const handleDurationSelect = (val: string) => {
        setDuration(val);
        setManualDuration("");
    };

    const handleManualDurationChange = (text: string) => {
        setManualDuration(text);
        if (text) setDuration("");
    };

    const handleContinue = () => {
        const finalDuration = parseInt(manualDuration || duration) || 0;
        if (finalDuration <= 0) return;

        const calculatedCals = calculateCaloriesBurned(
            exerciseId,
            intensity,
            finalDuration,
            userData
        );

        router.push({
            pathname: "/exercise-result",
            params: {
                calories: calculatedCals,
                type: exerciseId,
                name: exerciseTitle,
                duration: finalDuration.toString(),
                intensity: intensity
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>{exerciseTitle}</Text>
                        <Text style={styles.headerSubtitle}>Set your workout details</Text>
                    </View>
                    <View style={styles.placeholder}>
                        <Ionicons name={exerciseIcon} size={24} color={Colors.primary} />
                    </View>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="flash-outline" size={20} color={Colors.text} style={styles.sectionIcon} />
                            <Text style={styles.sectionTitle}>Intensity</Text>
                        </View>
                        <View style={styles.intensityContainer}>
                            <View style={styles.sliderTrack}>
                                <TouchableOpacity
                                    style={[styles.intensityPoint, intensity === 'Low' && styles.activePoint]}
                                    onPress={() => setIntensity('Low')}
                                />
                                <TouchableOpacity
                                    style={[styles.intensityPoint, intensity === 'Medium' && styles.activePoint]}
                                    onPress={() => setIntensity('Medium')}
                                />
                                <TouchableOpacity
                                    style={[styles.intensityPoint, intensity === 'High' && styles.activePoint]}
                                    onPress={() => setIntensity('High')}
                                />
                            </View>
                            <View style={styles.intensityLabels}>
                                <Text style={[styles.intensityLabel, intensity === 'Low' && styles.activeLabel]}>Low</Text>
                                <Text style={[styles.intensityLabel, intensity === 'Medium' && styles.activeLabel]}>Medium</Text>
                                <Text style={[styles.intensityLabel, intensity === 'High' && styles.activeLabel]}>High</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="time-outline" size={20} color={Colors.text} style={styles.sectionIcon} />
                            <Text style={styles.sectionTitle}>Duration (minutes)</Text>
                        </View>
                        <View style={styles.chipsContainer}>
                            {durationOptions.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[
                                        styles.chip,
                                        duration === opt && styles.activeChip,
                                    ]}
                                    onPress={() => handleDurationSelect(opt)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            duration === opt && styles.activeChipText,
                                        ]}
                                    >
                                        {opt} min
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="time-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter custom duration..."
                                value={manualDuration}
                                onChangeText={handleManualDurationChange}
                                keyboardType="number-pad"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F8F8F8",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitleContainer: {
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
    },
    headerSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    placeholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    sectionIcon: {
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
    },
    intensityContainer: {
        paddingHorizontal: 10,
    },
    sliderTrack: {
        height: 4,
        backgroundColor: "#EEE",
        borderRadius: 2,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
    },
    intensityPoint: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: "#DDD",
    },
    activePoint: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
        transform: [{ scale: 1.2 }],
    },
    intensityLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },
    intensityLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: "500",
    },
    activeLabel: {
        color: Colors.primary,
        fontWeight: "700",
    },
    chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 16,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#EEE",
    },
    activeChip: {
        backgroundColor: Colors.primaryLight,
        borderColor: Colors.primary,
    },
    chipText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: "500",
    },
    activeChipText: {
        color: Colors.primary,
        fontWeight: "600",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9F9F9",
        borderRadius: 12,
        paddingHorizontal: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#EEE",
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 15,
        color: Colors.text,
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
        borderTopWidth: 1,
        borderTopColor: "#F5F5F5",
    },
    continueButton: {
        backgroundColor: Colors.primary,
        height: 56,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    continueButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "700",
        marginRight: 8,
    },
});
