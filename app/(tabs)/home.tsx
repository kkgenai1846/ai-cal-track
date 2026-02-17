import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CaloriesCard } from '../../components/CaloriesCard';
import DateStrip from '../../components/DateStrip';
import EditGoalsModal from '../../components/EditGoalsModal';
import HomeHeader from '../../components/HomeHeader';
import RecentActivity from '../../components/RecentActivity';
import { WaterCard } from '../../components/WaterCard';
import { Colors } from '../../constants/Colors';
import { ActivityLog, DailyLog, logService } from '../../services/logService';
import { UserData, userService } from '../../services/userService';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

export default function HomeScreen() {
    const { user } = useUser();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [userData, setUserData] = useState<UserData | null>(null);
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleEditGoals = () => {
        setIsEditModalVisible(true);
    };

    const handleSaveGoals = async (newGoals: {
        dailyCalories: number;
        dailyProtein: number;
        dailyCarbs: number;
        dailyFat: number;
        dailyWater: number;
    }) => {
        if (!user || !userData) return;

        // Optimistic update
        const updatedUserData = { ...userData, ...newGoals };
        setUserData(updatedUserData);

        // Update in Firestore
        await userService.updateUser(user.id, newGoals);
    };

    const handleAddWater = async () => {
        if (!user || !userData) return;

        // Check current water intake
        const currentWater = dailyLog?.water || 0;

        // HARD CAP at 3L - this is the absolute maximum
        const MAX_WATER_LITERS = 3;

        // The user requested the logic of the glass to be based on 3 liters total for 9 glasses
        const basisLiters = 3;
        const singleGlassAmount = basisLiters / 9; // ~0.333L
        const halfGlassAmount = singleGlassAmount / 2; // ~0.167L

        // Check if we can add a half glass using the HARD CAP
        const canAddHalf = (currentWater + halfGlassAmount) <= MAX_WATER_LITERS;
        const canAddFull = (currentWater + singleGlassAmount) <= MAX_WATER_LITERS;

        if (!canAddHalf) {
            Alert.alert(
                "Goal Reached",
                `You've reached your water goal of ${MAX_WATER_LITERS}L! 🎉`,
                [{ text: "OK" }]
            );
            return;
        }

        const buttons: any[] = [];

        if (canAddHalf) {
            buttons.push({
                text: "Half Glass",
                onPress: () => performWaterUpdate(halfGlassAmount)
            });
        }

        if (canAddFull) {
            buttons.push({
                text: "Full Glass",
                onPress: () => performWaterUpdate(singleGlassAmount)
            });
        }

        buttons.push({
            text: "Cancel",
            style: "cancel"
        });

        Alert.alert(
            "Log Water",
            "Select amount to log:",
            buttons
        );
    };

    const performWaterUpdate = async (amount: number) => {
        if (!user) return;
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newActivity: ActivityLog = {
            id: Date.now().toString(),
            type: "water",
            name: "Water Intake",
            calories: 0,
            waterAmount: amount, // Store the amount for undo/delete
            time: currentTime,
        };

        // Note: we still update the 'water' total in DailyLog for the progress card
        await logService.updateDailyLog(user.id, formatDate(selectedDate), { water: amount }, newActivity);
    };

    const handleDeleteActivity = async (item: ActivityLog) => {
        if (!user) return;

        const actualAmount = item.type === 'water' ? (item.waterAmount || 0) : (item.calories || 0);

        const success = await logService.removeActivity(
            user.id,
            formatDate(selectedDate),
            item.id,
            actualAmount,
            item.type === 'meal' ? 'food' : item.type
        );

        if (!success) {
            Alert.alert("Error", "Failed to delete activity.");
        }
    };

    const handleWaterPress = (activity: ActivityLog) => {
        if (!user) return;

        const basisLiters = 3;
        const singleGlass = basisLiters / 9;
        const halfGlass = singleGlass / 2;

        const isHalf = (activity.waterAmount || 0) < 0.25;
        const nextAmount = isHalf ? singleGlass : halfGlass;
        const nextLabel = isHalf ? "Convert to Full Glass" : "Convert to Half Glass";

        Alert.alert(
            "Edit Water",
            "What would you like to do?",
            [
                {
                    text: nextLabel,
                    onPress: () => logService.updateActivity(user.id, formatDate(selectedDate), activity.id, { waterAmount: nextAmount })
                },
                {
                    text: "Delete",
                    onPress: () => handleDeleteActivity(activity),
                    style: "destructive"
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ]
        );
    };

    useEffect(() => {
        if (!user) return;

        let unsubscribeLogs: () => void;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch User Data (for goals)
                const userDoc = await userService.getUser(user.id);
                setUserData(userDoc);

                // 2. Subscribe to Daily Log for selected date
                const dateKey = formatDate(selectedDate);
                unsubscribeLogs = logService.subscribeToDailyLog(user.id, dateKey, (log) => {
                    setDailyLog(log);
                    setLoading(false);
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            if (unsubscribeLogs) unsubscribeLogs();
        };
    }, [user, selectedDate]);

    // Derived values
    const dailyCaloriesGoal = userData?.dailyCalories || 2000;
    const items = dailyLog;

    const consumedCalories = items?.calories || 0;
    const remainingCalories = Math.max(0, dailyCaloriesGoal - consumedCalories);

    const consumedCarbs = items?.carbs || 0;
    const consumedProtein = items?.protein || 0;
    const consumedFat = items?.fat || 0;

    // Calculate remaining macros (Goal - Consumed)
    // In a real app, you'd fetch these goals from user settings. Defaulting for now.
    const goalCarbs = userData?.dailyCarbs || 275; // Default reference
    const goalProtein = userData?.dailyProtein || 140;
    const goalFat = userData?.dailyFat || 65;

    const remainingCarbs = Math.max(0, goalCarbs - consumedCarbs);
    const remainingProtein = Math.max(0, goalProtein - consumedProtein);
    const remainingFat = Math.max(0, goalFat - consumedFat);

    if (loading && !userData && !dailyLog) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <HomeHeader />
            <View style={styles.dateStripContainer}>
                <DateStrip onDateSelect={handleDateSelect} />
            </View>
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <CaloriesCard
                    remainingCalories={Math.round(remainingCalories)}
                    totalCalories={dailyCaloriesGoal}
                    consumedCalories={Math.round(consumedCalories)}
                    carbs={Math.round(remainingCarbs)}
                    protein={Math.round(remainingProtein)}
                    fat={Math.round(remainingFat)}
                    onEdit={handleEditGoals}
                />

                <WaterCard
                    consumedLiters={Math.min(items?.water || 0, 3)}
                    goalLiters={Math.min(userData?.dailyWater || 3, 3)}
                    waterActivities={dailyLog?.activities?.filter(a => a.type === 'water') || []}
                    onEdit={handleEditGoals}
                    onAdd={handleAddWater}
                    onWaterPress={handleWaterPress}
                />

                {userData && (
                    <EditGoalsModal
                        visible={isEditModalVisible}
                        onClose={() => setIsEditModalVisible(false)}
                        onSave={handleSaveGoals}
                        initialGoals={{
                            dailyCalories: userData.dailyCalories || 2000,
                            dailyProtein: userData.dailyProtein || 140,
                            dailyCarbs: userData.dailyCarbs || 275,
                            dailyFat: userData.dailyFat || 65,
                            dailyWater: userData.dailyWater || 3,
                        }}
                    />
                )}

                <RecentActivity
                    activities={dailyLog?.activities || []}
                    onDelete={handleDeleteActivity}
                />

                {/* Placeholder for future content */}
                <View style={{ height: 100 }} />
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => Alert.alert("Add Item", "Feature coming soon!")}>
                <Ionicons name="add" size={30} color={Colors.primary} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    dateStripContainer: {
        paddingVertical: 10,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    scrollContent: {
        paddingBottom: 80, // Increased to account for FAB height + safe area
    },
    fab: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        height: 56,
        paddingBottom: Platform.OS === 'ios' ? 34 : 0, // Safe area for iOS
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 8,
    },
});
