import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
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

    const handleAddWater = () => {
        router.push('/log-water');
    };

    const performWaterUpdate = async (amount: number) => {
        if (!user) return;
        const currentTime = new Date().toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
        });

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

    const handleReduceWater = async () => {
        if (!user || !dailyLog) return;

        // Get the most recent water activity
        const waterActivities = dailyLog.activities?.filter(a => a.type === 'water') || [];

        if (waterActivities.length > 0) {
            // New system: Remove the last water activity
            const lastWaterActivity = waterActivities[waterActivities.length - 1];
            await handleDeleteActivity(lastWaterActivity);
        } else {
            // Legacy system: Reduce total water by 125ml (half glass)
            const currentWater = dailyLog?.water || 0;

            if (currentWater <= 0) {
                Alert.alert("No Water", "No water intake to remove.");
                return;
            }

            const HALF_GLASS_LITERS = 0.125; // 125ml in liters
            const newWaterAmount = Math.max(0, currentWater - HALF_GLASS_LITERS);

            // Update the daily log with reduced water
            await logService.updateDailyLog(user.id, formatDate(selectedDate), { water: newWaterAmount - currentWater });
        }
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

        const HALF_GLASS_ML = 125;
        const FULL_GLASS_ML = 250;
        const threshold = (HALF_GLASS_ML + FULL_GLASS_ML) / 2; // 187.5ml

        const currentMl = (activity.waterAmount || 0) * 1000;
        const isHalf = currentMl < threshold;
        const nextAmountMl = isHalf ? FULL_GLASS_ML : HALF_GLASS_ML;
        const nextLabel = isHalf ? "Convert to Full Glass (250ml)" : "Convert to Half Glass (125ml)";

        Alert.alert(
            "Edit Water Glass",
            `Current: ${Math.round(currentMl)}ml`,
            [
                {
                    text: nextLabel,
                    onPress: () => logService.updateActivity(user.id, formatDate(selectedDate), activity.id, { waterAmount: nextAmountMl / 1000 })
                },
                {
                    text: "Delete Glass",
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
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <DateStrip onDateSelect={handleDateSelect} />
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
                    waterActivities={(dailyLog?.activities?.filter(a => a.type === 'water') || []).sort((a, b) => Number(a.id) - Number(b.id))}
                    onEdit={handleReduceWater}
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
                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    scrollContent: {
        paddingBottom: Platform.OS === 'ios' ? 90 : 70, // Account for tab bar height + bottom gap
    },
});
