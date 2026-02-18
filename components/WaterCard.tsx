import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ActivityLog } from "../services/logService";

type WaterCardProps = {
    consumedLiters: number;
    goalLiters: number;
    waterActivities: ActivityLog[];
    onAdd?: () => void;
    onEdit?: () => void;
    onWaterPress?: (item: ActivityLog) => void;
    onReset?: () => void;
};

export function WaterCard({
    consumedLiters,
    goalLiters,
    waterActivities,
    onAdd,
    onEdit,
    onWaterPress,
}: WaterCardProps) {
    const totalGlasses = 9;

    // Calculate remaining (based on actual user goal)
    const remainingLiters = Math.max(0, goalLiters - consumedLiters);

    const renderGlasses = () => {
        const glasses = [];

        // Define thresholds based on 125ml half and 250ml full
        const HALF_GLASS_ML = 125;
        const FULL_GLASS_ML = 250;
        // Use 187ml as threshold - anything below is half, 187+ is full
        const threshold = 187; // Middle point between 125 and 250

        // If we have activities, use them. Otherwise, calculate from consumedLiters for backward compatibility
        let glassesToRender: Array<{ id: string; amount: number } | null> = [];

        if (waterActivities.length > 0) {
            // Use activities (new method) - break down each activity into glasses
            waterActivities.forEach((activity, activityIndex) => {
                let remainingMl = Math.round((activity.waterAmount || 0) * 1000);
                let glassIndex = 0;

                // Break down this activity into multiple glasses if needed
                while (remainingMl > 0 && glassesToRender.length < totalGlasses) {
                    if (remainingMl >= FULL_GLASS_ML) {
                        // Add a full glass
                        glassesToRender.push({
                            id: `${activity.id}-${glassIndex}`,
                            amount: FULL_GLASS_ML / 1000
                        });
                        remainingMl -= FULL_GLASS_ML;
                    } else if (remainingMl >= HALF_GLASS_ML) {
                        // Add a half glass
                        glassesToRender.push({
                            id: `${activity.id}-${glassIndex}`,
                            amount: HALF_GLASS_ML / 1000
                        });
                        remainingMl -= HALF_GLASS_ML;
                    } else {
                        // Add remaining as a partial glass (show as half)
                        glassesToRender.push({
                            id: `${activity.id}-${glassIndex}`,
                            amount: remainingMl / 1000
                        });
                        remainingMl = 0;
                    }
                    glassIndex++;
                }
            });

            // Fill remaining slots with null
            while (glassesToRender.length < totalGlasses) {
                glassesToRender.push(null);
            }
        } else if (consumedLiters > 0) {
            // Fallback: calculate from total consumed (for old data)
            let remainingMl = Math.round(consumedLiters * 1000); // Convert to ml and round

            for (let i = 0; i < totalGlasses && remainingMl > 0; i++) {
                if (remainingMl >= FULL_GLASS_ML) {
                    // Full glass
                    glassesToRender.push({ id: `fallback-${i}`, amount: FULL_GLASS_ML / 1000 });
                    remainingMl -= FULL_GLASS_ML;
                } else if (remainingMl >= HALF_GLASS_ML) {
                    // Half glass
                    glassesToRender.push({ id: `fallback-${i}`, amount: HALF_GLASS_ML / 1000 });
                    remainingMl -= HALF_GLASS_ML;
                } else if (remainingMl > 0) {
                    // Less than half glass - still show as half glass if there's any water
                    glassesToRender.push({ id: `fallback-${i}`, amount: remainingMl / 1000 });
                    remainingMl = 0;
                }
            }

            // Fill remaining slots with null
            while (glassesToRender.length < totalGlasses) {
                glassesToRender.push(null);
            }
        } else {
            // No water logged, show all empty
            glassesToRender = Array(totalGlasses).fill(null);
        }

        // Render the glasses
        for (let i = 0; i < totalGlasses; i++) {
            const glassData = glassesToRender[i];

            if (glassData) {
                // Determine if half or full based on amount (convert to ml for comparison)
                const amountMl = Math.round(glassData.amount * 1000);
                const isHalf = amountMl < threshold; // Less than 187ml = half glass

                console.log(`Glass ${i}: ${amountMl}ml, isHalf: ${isHalf}, threshold: ${threshold}`);

                const iconSource = isHalf
                    ? require("@/assets/images/half_glass.png")
                    : require("@/assets/images/full_glass.png");

                glasses.push(
                    <TouchableOpacity
                        key={glassData.id}
                        style={styles.glassContainer}
                        onPress={() => {
                            // Only allow interaction if this is a real activity (not fallback)
                            if (waterActivities.length > 0 && waterActivities[i]) {
                                onWaterPress?.(waterActivities[i]);
                            }
                        }}
                    >
                        <Image source={iconSource} style={styles.glassIcon} resizeMode="contain" />
                    </TouchableOpacity>
                );
            } else {
                // Render empty glass
                glasses.push(
                    <TouchableOpacity
                        key={`empty-${i}`}
                        style={styles.glassContainer}
                        onPress={onAdd}
                    >
                        <Image
                            source={require("@/assets/images/empty_glass.png")}
                            style={styles.glassIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                );
            }
        }
        return glasses;
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>Water</Text>
                    <Text style={styles.subtitle}>{consumedLiters.toFixed(2)} / {goalLiters.toFixed(1)} L</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={onAdd} style={styles.addButton}>
                        <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onEdit} style={styles.removeButton}>
                        <Ionicons name="remove" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.gridContainer}>
                {renderGlasses()}
            </View>

            <View style={styles.footer}>
                <Text style={styles.remainingText}>
                    {remainingLiters > 0.05
                        ? `${remainingLiters.toFixed(2)}L left to goal`
                        : "Goal reached! 🎉"}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    headerLeft: {
        gap: 2,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.text,
    },
    subtitle: {
        fontSize: 12,
        color: "#666",
    },
    editButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F5F5F5",
        alignItems: "center",
        justifyContent: "center",
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    removeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.error,
        alignItems: "center",
        justifyContent: "center",
    },
    gridContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    glassContainer: {
        width: "10%",
        aspectRatio: 0.6,
        alignItems: "center",
        justifyContent: "center",
    },
    glassIcon: {
        width: "100%",
        height: "100%",
    },
    footer: {
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        alignItems: "center",
    },
    remainingText: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.textSecondary,
    },
});
