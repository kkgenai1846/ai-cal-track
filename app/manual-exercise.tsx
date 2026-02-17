import { useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Colors } from "../constants/Colors";
import { ActivityLog, logService } from "../services/logService";

export default function ManualExerciseScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [calories, setCalories] = useState("");
    const [isLogging, setIsLogging] = useState(false);

    const handleLog = async () => {
        if (!user) {
            Alert.alert("Error", "You must be logged in to track exercises.");
            return;
        }

        const calorieValue = parseFloat(calories);
        if (!calories || isNaN(calorieValue) || calorieValue <= 0) {
            Alert.alert("Invalid Input", "Please enter a valid amount of calories.");
            return;
        }

        setIsLogging(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const newActivity: ActivityLog = {
                id: Date.now().toString(),
                type: "exercise",
                name: "Manual Exercise",
                calories: calorieValue,
                time: currentTime,
            };

            // We increment by negative calories because exercises "add back" to the budget 
            // by reducing the net "consumed" total in our current home screen logic.
            const success = await logService.updateDailyLog(user.id, today, {
                calories: -calorieValue
            }, newActivity);

            if (success) {
                router.replace("/(tabs)/home");
            } else {
                Alert.alert("Error", "Failed to save your activity. Please try again.");
            }
        } catch (error) {
            console.error("Scale log error:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setIsLogging(false);
        }
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
                    <Text style={styles.headerTitle}>Manual Log</Text>
                    <View style={styles.placeholder} />
                </View>

                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="fire" size={80} color={Colors.primary} />
                    </View>

                    <Text style={styles.label}>Calories Burned</Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            value={calories}
                            onChangeText={setCalories}
                            keyboardType="number-pad"
                            autoFocus
                            placeholderTextColor="#CCC"
                        />
                        <Text style={styles.unitText}>cal</Text>
                    </View>

                    <Text style={styles.hint}>
                        Enter the total calories you've burned during your activity.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.logButton,
                            (!calories || isNaN(Number(calories)) || isLogging) && styles.disabledButton
                        ]}
                        onPress={handleLog}
                        disabled={!calories || isNaN(Number(calories)) || isLogging}
                    >
                        {isLogging ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.logButtonText}>Log Activity</Text>
                        )}
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
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
        paddingBottom: 8,
        width: "60%",
    },
    input: {
        fontSize: 48,
        fontWeight: "700",
        color: Colors.text,
        textAlign: "center",
    },
    unitText: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.textSecondary,
        marginLeft: 8,
        marginTop: 16,
    },
    hint: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: "center",
        marginTop: 24,
        lineHeight: 20,
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
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
        backgroundColor: "#EEE",
        shadowOpacity: 0,
        elevation: 0,
    },
    logButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "700",
    },
});
