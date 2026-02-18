import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SegmentedHalfCircleProgress3D } from "./HalfProgress";

type CaloriesCardProps = {
    remainingCalories: number;
    totalCalories: number;
    consumedCalories: number;
    carbs: number;
    protein: number;
    fat: number;
    onEdit?: () => void;
};

export function CaloriesCard({
    remainingCalories,
    totalCalories,
    consumedCalories,
    carbs,
    protein,
    fat,
    onEdit,
}: CaloriesCardProps) {
    const progress = Math.min(Math.max(consumedCalories / totalCalories, 0), 1);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.subtitle}>Calories</Text>
                <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                    <Ionicons name="pencil" size={16} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
                <SegmentedHalfCircleProgress3D
                    progress={progress}
                    size={160} // Reduced size 200 -> 160
                    strokeWidth={36} // Reduced stroke 50 -> 36
                    segments={16}
                    gapAngle={20}
                    value={remainingCalories}
                    label="Remaining"
                />
            </View>

            <View style={styles.macrosContainer}>
                <View style={styles.macroItem}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="bread-slice" size={18} color="#1976D2" />
                    </View>
                    <View>
                        <Text style={styles.macroValue}>{carbs}g</Text>
                        <Text style={styles.macroLabel}>Carbs Left</Text>
                    </View>
                </View>

                <View style={styles.macroItem}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="food-steak" size={18} color="#D32F2F" />
                    </View>
                    <View>
                        <Text style={styles.macroValue}>{protein}g</Text>
                        <Text style={styles.macroLabel}>Protein Left</Text>
                    </View>
                </View>

                <View style={styles.macroItem}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="oil" size={18} color="#F57C00" />
                    </View>
                    <View>
                        <Text style={styles.macroValue}>{fat}g</Text>
                        <Text style={styles.macroLabel}>Fats Left</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "white",
        borderRadius: 20, // Reduced radius slightly
        padding: 16, // Reduced padding 20 -> 16
        marginVertical: 8, // Reduced margin 10 -> 8
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4, // Reduced margin 10 -> 4
    },
    subtitle: {
        fontSize: 16, // Reduced font size 18 -> 16
        fontWeight: "700",
        color: Colors.text,
        letterSpacing: 0.5,
    },
    editButton: {
        width: 32, // Reduced size 40 -> 32
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F5F5F5",
        alignItems: "center",
        justifyContent: "center",
    },
    // editText styles removed
    progressContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4, // Reduced margin 10 -> 4
        marginBottom: 12, // Reduced margin 20 -> 12
    },
    macrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8, // Reduced gap 12 -> 8
    },
    macroItem: {
        flex: 1,
        backgroundColor: Colors.primaryLight,
        borderRadius: 12, // Reduced radius 16 -> 12
        padding: 8, // Reduced padding 12 -> 8
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4, // Reduced gap 8 -> 4
    },
    iconContainer: {
        width: 36, // Reduced size 48 -> 36
        height: 36,
        backgroundColor: 'white',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    macroValue: {
        fontSize: 14, // Reduced font size 16 -> 14
        fontWeight: 'bold',
        color: '#000',
    },
    macroLabel: {
        fontSize: 10, // Reduced font size 12 -> 10
        color: '#666',
    },
});
