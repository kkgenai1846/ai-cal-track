import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ActivityItem = {
    id: string;
    type: "meal" | "water" | "exercise" | "food";
    name: string;
    calories: number;
    time: string;
    protein?: number;
    carbs?: number;
    fat?: number;
    waterAmount?: number;
    intensity?: string;
    duration?: number;
    servingSize?: string;
};

type RecentActivityProps = {
    activities: ActivityItem[];
    onDelete?: (item: ActivityItem) => void | Promise<void>;
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
            case "food":
                return "food-apple";
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

    // Get food-specific icon based on food name
    const getFoodIcon = (foodName: string): string => {
        const nameLower = foodName.toLowerCase();

        // Common foods with specific icons
        if (nameLower.includes('egg')) return 'egg';
        if (nameLower.includes('rice')) return 'rice';
        if (nameLower.includes('chicken')) return 'food-drumstick';
        if (nameLower.includes('meat') || nameLower.includes('beef') || nameLower.includes('steak')) return 'food-steak';
        if (nameLower.includes('fish') || nameLower.includes('salmon') || nameLower.includes('tuna')) return 'fish';
        if (nameLower.includes('apple')) return 'apple';
        if (nameLower.includes('banana')) return 'fruit-cherries';
        if (nameLower.includes('bread') || nameLower.includes('toast')) return 'bread-slice';
        if (nameLower.includes('milk') || nameLower.includes('dairy')) return 'cup';
        if (nameLower.includes('cheese')) return 'cheese';
        if (nameLower.includes('pasta') || nameLower.includes('noodle')) return 'noodles';
        if (nameLower.includes('pizza')) return 'pizza';
        if (nameLower.includes('burger') || nameLower.includes('hamburger')) return 'hamburger';
        if (nameLower.includes('salad') || nameLower.includes('vegetable') || nameLower.includes('lettuce')) return 'food-variant';
        if (nameLower.includes('coffee') || nameLower.includes('tea')) return 'coffee';
        if (nameLower.includes('cake') || nameLower.includes('dessert') || nameLower.includes('cookie')) return 'cake';

        // Default to apple if no match
        return 'food-apple';
    };

    const renderActivityItem = (item: ActivityItem) => {
        const isExercise = item.type === "exercise";
        const isFood = item.type === "food";

        // Enhanced Food Card
        if (isFood) {
            const foodIcon = getFoodIcon(item.name);

            return (
                <View key={item.id} style={styles.foodCard}>
                    <View style={styles.foodIconContainer}>
                        <MaterialCommunityIcons
                            name={foodIcon as any}
                            size={28}
                            color="#FF6B6B"
                        />
                    </View>

                    <View style={styles.foodDetails}>
                        <View style={styles.foodHeader}>
                            <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.activityTime}>{item.time}</Text>
                        </View>

                        <View style={styles.foodMetricsRow}>
                            {/* Serving Size */}
                            {item.servingSize && (
                                <View style={styles.servingBadge}>
                                    <Ionicons name="restaurant-outline" size={12} color="#666" />
                                    <Text style={styles.servingText} numberOfLines={1}>{item.servingSize}</Text>
                                </View>
                            )}

                            {/* Calories */}
                            <View style={styles.caloriesBadge}>
                                <MaterialCommunityIcons name="fire" size={14} color="#FF6B6B" />
                                <Text style={styles.foodCalories} numberOfLines={1}>{item.calories} cal</Text>
                            </View>
                        </View>

                        {/* Macros Row */}
                        {(item.protein !== undefined || item.carbs !== undefined || item.fat !== undefined) && (
                            <View style={styles.macrosGrid}>
                                {item.protein !== undefined && (
                                    <View style={styles.macroChip}>
                                        <Text style={styles.macroLabel}>P:</Text>
                                        <Text style={styles.macroValue} numberOfLines={1}>{item.protein}g</Text>
                                    </View>
                                )}
                                {item.carbs !== undefined && (
                                    <View style={styles.macroChip}>
                                        <Text style={styles.macroLabel}>C:</Text>
                                        <Text style={styles.macroValue} numberOfLines={1}>{item.carbs}g</Text>
                                    </View>
                                )}
                                {item.fat !== undefined && (
                                    <View style={styles.macroChip}>
                                        <Text style={styles.macroLabel}>F:</Text>
                                        <Text style={styles.macroValue} numberOfLines={1}>{item.fat}g</Text>
                                    </View>
                                )}
                            </View>
                        )}
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
    foodCard: {
        flexDirection: "row",
        backgroundColor: "#FFFAF5",
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#FFE5D9",
        position: 'relative',
    },
    foodIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: "#FFE5E5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    foodDetails: {
        flex: 1,
        justifyContent: "center",
        gap: 4,
        paddingRight: 20,
    },
    foodHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    foodName: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.text,
        flex: 1,
    },
    foodMetricsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 2,
    },
    servingBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        maxWidth: 120,
    },
    servingText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#666",
        flexShrink: 1,
    },
    caloriesBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        flexShrink: 1,
    },
    foodCalories: {
        fontSize: 13,
        fontWeight: "600",
        color: "#FF6B6B",
        flexShrink: 1,
    },
    macrosGrid: {
        flexDirection: "row",
        gap: 6,
        marginTop: 4,
        flexWrap: "wrap",
    },
    macroChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F9FF",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 2,
        maxWidth: 80,
    },
    macroLabel: {
        fontSize: 10,
        fontWeight: "600",
        color: Colors.textSecondary,
    },
    macroValue: {
        fontSize: 10,
        fontWeight: "700",
        color: Colors.text,
        flexShrink: 1,
    },
});

export default RecentActivity;
