import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";

type ExerciseOption = {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
};

export default function LogExerciseScreen() {
    const router = useRouter();

    const exerciseOptions: ExerciseOption[] = [
        {
            id: "cardio",
            title: "Cardio",
            description: "Running, walking, cycling, etc.",
            icon: "fitness-outline",
            onPress: () => {
                router.push({
                    pathname: "/exercise-details",
                    params: { id: "cardio", title: "Cardio", icon: "fitness-outline" }
                });
            },
        },
        {
            id: "weights",
            title: "Weight Lifting",
            description: "Gym, machines, strength training, etc.",
            icon: "barbell",
            onPress: () => {
                router.push({
                    pathname: "/exercise-details",
                    params: { id: "weights", title: "Weight Lifting", icon: "barbell" }
                });
            },
        },
        {
            id: "manual",
            title: "Manual",
            description: "Enter calories burned manually",
            icon: "create-outline",
            onPress: () => {
                router.push("/manual-exercise");
            },
        },
    ];

    const renderOption = (option: ExerciseOption) => (
        <TouchableOpacity
            key={option.id}
            style={styles.optionCard}
            onPress={option.onPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={option.icon} size={28} color={Colors.primary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Log Exercise</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.subtitle}>Choose exercise type</Text>
                <View style={styles.optionsContainer}>
                    {exerciseOptions.map(renderOption)}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.textSecondary,
        marginBottom: 16,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    optionsContainer: {
        gap: 12,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
});
