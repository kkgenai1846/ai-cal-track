import { useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { ActivityLog, logService } from "../services/logService";

export default function ExerciseResultScreen() {
    const router = useRouter();
    const { user } = useUser();
    const { calories, type, name, intensity, duration } = useLocalSearchParams();
    const [isLogging, setIsLogging] = useState(false);

    const burnAmount = parseInt(calories as string) || 0;

    const handleLog = async () => {
        if (!user) {
            Alert.alert("Error", "You must be logged in to track exercises.");
            return;
        }

        setIsLogging(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const currentTime = new Date().toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit'
            });

            const newActivity: ActivityLog = {
                id: Date.now().toString(),
                type: "exercise",
                name: (name as string) || "Workout",
                calories: burnAmount,
                time: currentTime,
                intensity: intensity as string,
                duration: parseInt(duration as string) || 0,
            };

            // Log as negative consumed calories to "add" to the remaining budget
            const success = await logService.updateDailyLog(user.id, today, {
                calories: -burnAmount
            }, newActivity);

            if (success) {
                router.replace("/(tabs)/home");
            } else {
                Alert.alert("Error", "Failed to save activity.");
            }
        } catch (error) {
            console.error("Log exercise error:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setIsLogging(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Workout Summary</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="fire" size={100} color={Colors.primary} />
                </View>

                <Text style={styles.label}>Your Workout Burned</Text>

                <View style={styles.resultContainer}>
                    <Text style={styles.caloriesText}>{burnAmount}</Text>
                    <Text style={styles.unitText}>Cals</Text>
                </View>

                <Text style={styles.description}>
                    Great job on your {(name as string || '').toLowerCase()} workout! These calories have been added back to your daily budget.
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.logButton, isLogging && styles.disabledButton]}
                    onPress={handleLog}
                    disabled={isLogging}
                >
                    {isLogging ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.logButtonText}>Log Activity</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
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
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: Colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    label: {
        fontSize: 18,
        color: Colors.textSecondary,
        fontWeight: "500",
        marginBottom: 8,
    },
    resultContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 24,
    },
    caloriesText: {
        fontSize: 64,
        fontWeight: "800",
        color: Colors.text,
    },
    unitText: {
        fontSize: 24,
        fontWeight: "600",
        color: Colors.textSecondary,
        marginLeft: 8,
    },
    description: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 22,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
    },
    logButton: {
        backgroundColor: Colors.primary,
        height: 56,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.7,
    },
    logButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
});
