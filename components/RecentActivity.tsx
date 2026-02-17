import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ActivityItem = {
    id: string;
    type: "meal" | "water" | "exercise";
    name: string;
    calories?: number;
    time: string;
    protein?: number;
    carbs?: number;
    fat?: number;
    waterAmount?: number;
    intensity?: string;
    duration?: number;
};

type RecentActivityProps = {
    activities: ActivityItem[];
    onDelete?: (item: ActivityItem) => void;
};

export function RecentActivity({ activities, onDelete }: RecentActivityProps) {
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={64}
                color="#D0D0D0"
            />
            <Text style={styles.emptyTitle}>No activity logged today</Text>
            <Text style={styles.emptySubtitle}>
                Start tracking your meals and stay on top of your goals!
            </Text>
        </View>
    );

    const getActivityIcon = (type: ActivityItem["type"]) => {
        switch (type) {
            case "meal":
                return "food-apple";
            case "water":
                return "water";
            case "exercise":
                return "run";
            default:
                return "food";
        }
    };

    const renderActivityItem = (item: ActivityItem) => {
        const isExercise = item.type === "exercise";

        if (isExercise) {
            return (
                <View key={item.id} style={styles.exerciseCard}>
                    <View style={styles.exerciseIconContainer}>
                        <MaterialCommunityIcons
                            name={getActivityIcon(item.type)}
                            size={32}
                            color={Colors.primary}
                        />
                    </View>

                    <View style={styles.exerciseDetails}>
                        <View style={styles.exerciseHeader}>
                            <Text style={styles.exerciseName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.activityTime}>{item.time}</Text>
                        </View>

                        <View style={styles.exerciseMetricsRow}>
                            <View style={styles.burnedContainer}>
                                <MaterialCommunityIcons name="fire" size={14} color={Colors.primary} />
                                <Text style={styles.burnedText}>{item.calories} cal</Text>
                            </View>
                        </View>

                        <View style={styles.exerciseInfoRow}>
                            <View style={styles.infoBadge}>
                                <Text style={styles.infoLabel}>Intensity: </Text>
                                <Text style={styles.infoValue}>{item.intensity || 'Medium'}</Text>
                            </View>
                            <View style={styles.infoBadge}>
                                <Text style={styles.infoLabel}>Duration: </Text>
                                <Text style={styles.infoValue}>{item.duration || 0} min</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => onDelete?.(item)}
                        style={styles.deleteButtonOverlay}
                    >
                        <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View key={item.id} style={styles.activityItem}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                        name={getActivityIcon(item.type)}
                        size={24}
                        color={Colors.primary}
                    />
                </View>
                <View style={styles.activityContent}>
                    <View style={styles.activityHeader}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.activityName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.activityTime}>{item.time}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => onDelete?.(item)}
                            style={styles.deleteButton}
                        >
                            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                        </TouchableOpacity>
                    </View>
                    {item.calories !== undefined && item.calories > 0 && (
                        <View style={styles.macrosRow}>
                            <Text style={styles.caloriesText}>
                                {item.calories} kcal
                            </Text>
                            {/* ... macros if present ... */}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>Recent Activity</Text>
                {activities.length > 0 && (
                    <Text style={styles.count}>{activities.length}</Text>
                )}
            </View>

            {activities.length === 0 ? (
                renderEmptyState()
            ) : (
                <View style={styles.activitiesList}>
                    {activities.map(renderActivityItem)}
                </View>
            )}
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
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.text,
    },
    count: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.primary,
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: "center",
        paddingHorizontal: 20,
    },
    activitiesList: {
        gap: 12,
    },
    activityItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },
    activityContent: {
        flex: 1,
        gap: 4,
    },
    activityHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    activityName: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
        flex: 1,
    },
    activityTime: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    macrosRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    caloriesText: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.primary,
    },
    macroText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    deleteButton: {
        padding: 4,
        marginLeft: 8,
    },
    exerciseCard: {
        flexDirection: "row",
        backgroundColor: "#F9F9F9",
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#EEE",
        position: 'relative',
    },
    exerciseIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: Colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    exerciseDetails: {
        flex: 1,
        justifyContent: "center",
        gap: 2,
        paddingRight: 20, // Space for delete button
    },
    exerciseHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    exerciseName: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.text,
        flex: 1,
    },
    exerciseMetricsRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    burnedContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    burnedText: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.primary,
    },
    exerciseInfoRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 2,
    },
    infoBadge: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    infoValue: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.text,
    },
    deleteButtonOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 4,
    },
});

export default RecentActivity;
