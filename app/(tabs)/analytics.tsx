import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, StackedBarChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/Colors';
import { aiService, WeeklyInsight } from '../../services/aiService';
import { logService } from '../../services/logService';


// ... existing imports

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

// Get dates for current week (Sunday to Saturday)
const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const weekDates: Date[] = [];

    // Calculate Sunday of current week
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);

    // Get all 7 days of the week
    for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        weekDates.push(date);
    }

    return weekDates;
};

// Day labels
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function AnalyticsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [weekStreak, setWeekStreak] = useState<boolean[]>(Array(7).fill(false));
    const [currentStreak, setCurrentStreak] = useState(0);
    const [streakModalVisible, setStreakModalVisible] = useState(false);
    const [weightModalVisible, setWeightModalVisible] = useState(false);

    const formatWaterValue = (value: number) => {
        if (value < 1) {
            return `${Math.round(value * 1000)} ml`;
        }
        return `${value.toFixed(1)} L`;
    };

    // Chart Data State
    const [weeklyCalories, setWeeklyCalories] = useState<number[]>(Array(7).fill(0));
    const [weeklyEnergyData, setWeeklyEnergyData] = useState<number[][]>([]);
    const [energySummary, setEnergySummary] = useState({ burned: 0, consumed: 0, net: 0 });
    const [weeklyWater, setWeeklyWater] = useState<number[]>(Array(7).fill(0));

    // AI Analysis State
    const [weeklyInsight, setWeeklyInsight] = useState<WeeklyInsight | null>(null);
    const [loadingInsight, setLoadingInsight] = useState(true);

    // Weight Editing State
    const [newWeight, setNewWeight] = useState('');
    const [savingWeight, setSavingWeight] = useState(false);

    useEffect(() => {
        if (user) {
            fetchWeeklyData();
        }
    }, [user]);

    const fetchWeeklyData = async () => {
        if (!user) return;

        const weekDates = getWeekDates();
        const streakData: boolean[] = [];
        const calorieData: number[] = [];
        const energyData: number[][] = [];
        const waterData: number[] = [];
        let totalBurned = 0;
        let totalConsumed = 0;

        // Check each day for activities and calories
        for (const date of weekDates) {
            const dateStr = formatDate(date);
            const dailyLog = await logService.getDailyLog(user.id, dateStr);

            // Day has streak if it has at least one activity
            const hasActivity = dailyLog && dailyLog.activities && dailyLog.activities.length > 0;
            streakData.push(hasActivity || false);

            // Calculate Consumed vs Burned
            let dayConsumed = 0;
            let dayBurned = 0;

            if (dailyLog && dailyLog.activities) {
                dailyLog.activities.forEach(activity => {
                    if (activity.type === 'meal' || activity.type === 'food') {
                        dayConsumed += (activity.calories || 0);
                    } else if (activity.type === 'exercise') {
                        dayBurned += (activity.calories || 0);
                    }
                });
            }

            // Fallback: if no activities but calories exist (legacy data or direct log), assume it's consumed
            if (dayConsumed === 0 && dayBurned === 0 && dailyLog?.calories) {
                dayConsumed = dailyLog.calories;
            }

            calorieData.push(dayBurned); // For the first chart (Burned)
            energyData.push([dayBurned, dayConsumed]);

            totalBurned += dayBurned;
            totalConsumed += dayConsumed;

            // Get total water (assuming dailyLog.water is in ml or liters, just displaying value)
            waterData.push(dailyLog?.water || 0);
        }

        setWeekStreak(streakData);
        setWeeklyCalories(calorieData);
        setWeeklyEnergyData(energyData);
        setWeeklyWater(waterData);
        setEnergySummary({
            burned: totalBurned,
            consumed: totalConsumed,
            net: totalConsumed - totalBurned
        });

        // Calculate current streak (consecutive days from today backwards)
        const today = new Date().getDay(); // 0 = Sunday
        let streak = 0;
        for (let i = today; i >= 0; i--) {
            if (streakData[i]) {
                streak++;
            } else {
                break;
            }
        }
        setCurrentStreak(streak);
    };

    // Fetch AI Insight on mount
    useEffect(() => {
        if (user && !weeklyInsight) {
            generateInsight();
        }
    }, [user]);

    const generateInsight = async () => {
        if (!user) return;
        setLoadingInsight(true);
        try {
            const weekDates = getWeekDates();
            const logs = [];
            for (const date of weekDates) {
                const dateStr = formatDate(date);
                const log = await logService.getDailyLog(user.id, dateStr);
                if (log) logs.push(log);
            }
            // Even if few logs, try to generate insight or fallback
            if (logs.length > 0) {
                const insight = await aiService.generateWeeklyInsight(user.id, logs);
                setWeeklyInsight(insight);
            } else {
                // If no logs, maybe stop loading? Or handle as "No data"
                // For now, let's just unset loading so the specific "No Data" UI can show if we add it, 
                // or the "Tap to retry" button appears (refactored below to be "No Data")
                setLoadingInsight(false);
            }
        } catch (error) {
            console.error("Failed to generate insight", error);
        } finally {
            setLoadingInsight(false);
        }
    };

    const handleSaveWeight = async () => {
        if (!user || !newWeight) return;
        setSavingWeight(true);
        try {
            await user.update({
                unsafeMetadata: {
                    weight: Number(newWeight)
                }
            });
            setWeight(Number(newWeight));
            setWeightModalVisible(false);
        } catch (error) {
            console.error("Failed to save weight", error);
        } finally {
            setSavingWeight(false);
        }
    };

    const [weight, setWeight] = useState<number | null>(null);

    useEffect(() => {
        if (user) {
            // First try metadata
            const metadataWeight = user.publicMetadata?.weight || user.unsafeMetadata?.weight;
            if (metadataWeight) {
                setWeight(Number(metadataWeight));
            }
            // If needed we could also fetch from a measurements collection here
        }
    }, [user]);

    // Get user weight from profile
    const userWeight = user?.publicMetadata?.weight || user?.unsafeMetadata?.weight || null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 80 : 70 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Progress Heading */}
                <Text style={styles.mainHeading}>Progress</Text>

                {/* Cards Row */}
                <View style={styles.cardsRow}>
                    {/* Daily Streak Card */}
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.7}
                        onPress={() => setStreakModalVisible(true)}
                    >
                        <Image
                            source={require('../../assets/images/fire.png')}
                            style={styles.fireIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.cardTitle}>Day Streak</Text>
                        <Text style={styles.streakNumber}>{currentStreak}</Text>

                        {/* Week Days with Checkboxes */}
                        <View style={styles.weekContainer}>
                            {DAY_LABELS.map((day, index) => (
                                <View key={index} style={styles.dayItem}>
                                    <Text style={styles.dayLabel}>{day}</Text>
                                    <View style={[
                                        styles.checkbox,
                                        weekStreak[index] && styles.checkboxActive
                                    ]}>
                                        {weekStreak[index] && (
                                            <Ionicons name="checkmark" size={12} color="#fff" />
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </TouchableOpacity>

                    {/* Weight Card */}
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push('/update-weight')}
                    >
                        <View style={styles.weightIconContainer}>
                            <Ionicons name="fitness" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.cardTitle}>Current Weight</Text>
                        <View style={styles.weightDisplay}>
                            <Text style={styles.weightNumber}>{weight ? weight : '--'}</Text>
                            <Text style={styles.weightUnit}>kg</Text>
                        </View>
                        <Text style={styles.weightHint}>Tap to update</Text>
                        <View style={styles.nextIconContainer}>
                            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* AI Progress Insights (Main Screen) */}
                {weeklyInsight?.aiProgress ? (
                    <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <Ionicons name="sparkles" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text }}>AI Progress Insights</Text>
                        </View>

                        {/* Top Row: Analysis & Score */}
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                            <View style={{ flex: 1.6, backgroundColor: '#F3E5F5', borderRadius: 16, padding: 12, justifyContent: 'space-between' }}>
                                <ScrollView
                                    style={{ maxHeight: 70 }}
                                    nestedScrollEnabled={true}
                                    showsVerticalScrollIndicator={true}
                                >
                                    <TouchableOpacity activeOpacity={0.8}>
                                        <Text style={{ fontSize: 12, color: '#4A148C', lineHeight: 18 }}>
                                            {weeklyInsight.aiProgress.analysis}
                                        </Text>
                                    </TouchableOpacity>
                                </ScrollView>
                                <Text style={{ fontSize: 8, color: '#aa00ff', alignSelf: 'flex-end', marginTop: 2, fontStyle: 'italic' }}>
                                    Scroll for more ↕
                                </Text>
                                <View style={{ backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4, flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="flash" size={8} color={Colors.primary} style={{ marginRight: 3 }} />
                                    <Text style={{ fontSize: 9, fontWeight: '700', color: Colors.primary }}>AI ANALYSIS</Text>
                                </View>
                            </View>

                            {/* Right: Health Score */}
                            <View style={{ flex: 1, backgroundColor: '#E8F5E9', borderRadius: 16, padding: 10, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="heart" size={22} color={Colors.primary} style={{ marginBottom: 4 }} />
                                <Text style={{ fontSize: 26, fontWeight: '800', color: '#1B5E20' }}>
                                    {weeklyInsight.aiProgress.healthScore}
                                </Text>
                                <Text style={{ fontSize: 9, color: '#1B5E20', marginTop: 2 }}>Health Score</Text>
                            </View>
                        </View>

                        {/* Tags Row */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                            {weeklyInsight.aiProgress.tags.map((tag: string, i: number) => {
                                const bgColors = ['#E8F5E9', '#E3F2FD', '#FFF3E0']; // Green, Blue, Orange
                                const textColors = ['#1B5E20', '#0D47A1', '#E65100'];
                                const icons = ['nutrition', 'water', 'trending-up'];
                                return (
                                    <View key={i} style={{ backgroundColor: bgColors[i % 3], borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}>
                                        <Ionicons name={icons[i % 3] as any} size={12} color={textColors[i % 3]} style={{ marginRight: 4 }} />
                                        <Text style={{ fontSize: 10, fontWeight: '700', color: textColors[i % 3] }}>{tag}</Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Weekly Win */}
                        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1, borderWidth: 1, borderColor: '#f0f0f0' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Text style={{ fontSize: 18, marginRight: 6 }}>🏆</Text>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>{weeklyInsight.aiProgress.weeklyWin.title}</Text>
                            </View>
                            <Text style={{ fontSize: 12, color: Colors.textSecondary, lineHeight: 18 }}>
                                {weeklyInsight.aiProgress.weeklyWin.description}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
                        {loadingInsight ? (
                            <View style={{ opacity: 0.7 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                    <Ionicons name="sparkles" size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textSecondary }}>Using AI to analyze...</Text>
                                </View>
                                {/* Skeleton Top Row */}
                                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                                    <View style={{ flex: 1.6, backgroundColor: '#f0f0f0', borderRadius: 16, height: 100 }} />
                                    <View style={{ flex: 1, backgroundColor: '#f0f0f0', borderRadius: 16, height: 100 }} />
                                </View>
                                {/* Skeleton Tags Row */}
                                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
                                    <View style={{ flex: 1, backgroundColor: '#f0f0f0', borderRadius: 10, height: 30 }} />
                                    <View style={{ flex: 1, backgroundColor: '#f0f0f0', borderRadius: 10, height: 30 }} />
                                    <View style={{ flex: 1, backgroundColor: '#f0f0f0', borderRadius: 10, height: 30 }} />
                                </View>
                                {/* Skeleton Win Card */}
                                <View style={{ backgroundColor: '#f0f0f0', borderRadius: 16, height: 60, marginTop: 5 }} />
                            </View>
                        ) : (
                            <View style={{ padding: 20, alignItems: 'center', marginBottom: 50 }}>
                                <TouchableOpacity onPress={generateInsight} style={{ padding: 10 }}>
                                    <Text style={{ color: Colors.primary, fontSize: 14 }}>Tap to retry AI Analysis</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Weekly Calories Chart */}
                <View style={[styles.card, { marginHorizontal: 16, marginBottom: 20, alignItems: 'flex-start', paddingBottom: 20 }]}>
                    <Text style={[styles.cardTitle, { fontSize: 16, marginBottom: 16, width: '100%' }]}>Calories Burned (This Week)</Text>
                    <BarChart
                        data={{
                            labels: DAY_LABELS,
                            datasets: [
                                {
                                    data: weeklyCalories
                                }
                            ]
                        }}
                        width={Dimensions.get("window").width - 56} // Card width (Window - 32 margin - 24 padding)
                        height={200}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: "#fff",
                            backgroundGradientFrom: "#fff",
                            backgroundGradientTo: "#fff",
                            decimalPlaces: 0,
                            color: (opacity = 1) => Colors.primary,
                            labelColor: (opacity = 1) => Colors.textSecondary,
                            style: {
                                borderRadius: 16
                            },
                            barPercentage: 0.6,
                            fillShadowGradient: Colors.primary,
                            fillShadowGradientOpacity: 1,
                            propsForBackgroundLines: {
                                strokeWidth: 0 // Remove background lines for cleaner look
                            }
                        }}
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                            paddingRight: 0,
                        }}
                        showValuesOnTopOfBars
                        fromZero
                    />
                </View>

                {/* Weekly Energy Card */}
                <View style={[styles.card, { marginHorizontal: 16, marginBottom: 20, alignItems: 'flex-start', paddingBottom: 20 }]}>
                    <Text style={[styles.cardTitle, { fontSize: 16, marginBottom: 16, width: '100%' }]}>Weekly Energy</Text>

                    {/* Summary Stats */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Burned</Text>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#ff9500' }}>{energySummary.burned}</Text>
                            <Text style={{ fontSize: 10, color: Colors.textLight }}>kcal</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Consumed</Text>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#4cd964' }}>{energySummary.consumed}</Text>
                            <Text style={{ fontSize: 10, color: Colors.textLight }}>kcal</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Net</Text>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text }}>{energySummary.net}</Text>
                            <Text style={{ fontSize: 10, color: Colors.textLight }}>kcal</Text>
                        </View>
                    </View>

                    <StackedBarChart
                        data={{
                            labels: DAY_LABELS,
                            legend: [],
                            data: weeklyEnergyData.length > 0 ? weeklyEnergyData : [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                            barColors: ["#ff9500", "#4cd964"] // Burned (Orange), Consumed (Green)
                        }}
                        width={Dimensions.get("window").width - 56}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: "#fff",
                            backgroundGradientFrom: "#fff",
                            backgroundGradientTo: "#fff",
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => Colors.textSecondary,
                            style: {
                                borderRadius: 16
                            },
                            propsForBackgroundLines: {
                                strokeWidth: 1,
                                stroke: "#e3e3e3",
                                strokeDasharray: "0",
                            },
                        }}
                        hideLegend={true}
                    />

                    {/* Custom Legend */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', marginTop: 10, gap: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#ff9500', marginRight: 6 }} />
                            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Burned</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#4cd964', marginRight: 6 }} />
                            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Consumed</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.card, { marginHorizontal: 16, marginBottom: 20, alignItems: 'flex-start', paddingBottom: 20, zIndex: 10 }]}>
                    <Text style={[styles.cardTitle, { fontSize: 16, marginBottom: 16, width: '100%' }]}>Water Intake (This Week)</Text>

                    <LineChart
                        data={{
                            labels: DAY_LABELS,
                            datasets: [
                                {
                                    data: weeklyWater.length > 0 ? weeklyWater : [0, 0, 0, 0, 0, 0, 0]
                                }
                            ]
                        }}
                        width={Dimensions.get("window").width - 56} // Card width
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix="L"
                        yAxisInterval={1}
                        chartConfig={{
                            backgroundColor: "#fff",
                            backgroundGradientFrom: "#fff",
                            backgroundGradientTo: "#fff",
                            decimalPlaces: 1, // optional, defaults to 2dp
                            color: (opacity = 1) => `rgba(0, 191, 255, ${opacity})`, // Deep Blue
                            labelColor: (opacity = 1) => Colors.textSecondary,
                            style: {
                                borderRadius: 16
                            },
                            propsForDots: {
                                r: "4",
                                strokeWidth: "2",
                                stroke: "#00BFFF"
                            }
                        }}
                        bezier
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                            paddingRight: 0,
                        }}
                        fromZero
                        renderDotContent={({ x, y, index, indexData }) => {
                            const value = parseFloat(indexData.toString());
                            if (value === 0) return null; // Don't show label for 0
                            return (
                                <View
                                    key={index}
                                    style={{
                                        position: 'absolute',
                                        top: y - 24, // Position above the dot
                                        left: x - 20, // Center horizontally (approx)
                                        width: 40,
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text style={{ fontSize: 10, color: Colors.textSecondary, fontWeight: '600' }}>
                                        {formatWaterValue(value)}
                                    </Text>
                                </View>
                            );
                        }}
                    />
                </View>


            </ScrollView>

            {/* Streak Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={streakModalVisible}
                onRequestClose={() => setStreakModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Daily Streak</Text>
                        </View>
                        <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                            <View style={styles.modalBody}>
                                <Image
                                    source={require('../../assets/images/fire.png')}
                                    style={[styles.fireIcon, { width: 60, height: 60, alignSelf: 'center' }]}
                                    resizeMode="contain"
                                />
                                <Text style={styles.modalStreakNumber}>{currentStreak} Days Streak</Text>
                            </View>

                            {loadingInsight ? (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color={Colors.primary} />
                                    <Text style={{ marginTop: 10, color: Colors.textSecondary, fontSize: 12 }}>
                                        Analyzing your weekly progress...
                                    </Text>
                                </View>
                            ) : weeklyInsight ? (
                                <View>
                                    <Text style={styles.aiSummary}>
                                        {weeklyInsight.summary}
                                    </Text>

                                    <Text style={styles.subHeading}>Daily Breakdown</Text>
                                    <View style={styles.statsContainer}>
                                        <View style={styles.tableHeader}>
                                            <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Date</Text>
                                            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Food (Cal)</Text>
                                            <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'center' }]}>Water</Text>
                                            <Text style={[styles.tableHeaderText, { flex: 1.2, textAlign: 'right' }]}>Ex (Burn)</Text>
                                        </View>
                                        {weeklyInsight.stats.map((stat, index) => (
                                            <View key={index} style={styles.tableRow}>
                                                <View style={{ width: '100%' }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                                        <Text style={[styles.tableText, { flex: 0.8, fontSize: 10, fontWeight: '600' }]}>{stat.date.slice(5)}</Text>

                                                        <View style={{ flex: 1.5 }}>
                                                            <Text style={[styles.tableText, { fontSize: 10 }]} numberOfLines={2}>{stat.foodSummary}</Text>
                                                            <Text style={[styles.tableText, { fontSize: 9, color: Colors.textSecondary }]}>{stat.foodCals} kcal</Text>
                                                        </View>

                                                        <Text style={[styles.tableText, { flex: 0.8, textAlign: 'center', fontSize: 10 }]}>{stat.waterVol}</Text>

                                                        <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
                                                            <Text style={[styles.tableText, { fontSize: 10, textAlign: 'right' }]} numberOfLines={2}>{stat.exerciseSummary}</Text>
                                                            {stat.exerciseCals > 0 && (
                                                                <Text style={[styles.tableText, { fontSize: 9, color: Colors.primary, textAlign: 'right' }]}>🔥 {stat.exerciseCals}</Text>
                                                            )}
                                                        </View>
                                                    </View>

                                                    {/* Daily Summary & Motivation */}
                                                    <View style={styles.dailyInsightContainer}>
                                                        <Text style={styles.dailyInsightText}>
                                                            <Text style={{ fontWeight: '700' }}>Review: </Text>{stat.dailySummary}
                                                        </Text>
                                                        <Text style={[styles.dailyInsightText, { color: Colors.primary, marginTop: 2 }]}>
                                                            <Text style={{ fontWeight: '700' }}>Tip: </Text>{stat.dailySuggestion}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </View>

                                    <Text style={[styles.subHeading, { marginTop: 15 }]}>Highlights</Text>
                                    {weeklyInsight.highlights.map((highlight, index) => (
                                        <View key={index} style={styles.highlightRow}>
                                            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                                            <Text style={styles.highlightText}>{highlight}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.modalDescription}>
                                    {currentStreak > 0
                                        ? `You've been consistent for ${currentStreak} days! Keep up the great work.`
                                        : "Start your journey today by logging your first meal or workout!"}
                                </Text>
                            )}

                        </ScrollView>
                        <TouchableOpacity
                            style={[styles.saveButton, { marginTop: 10, backgroundColor: Colors.textSecondary, width: '100%' }]}
                            onPress={() => setStreakModalVisible(false)}
                        >
                            <Text style={styles.saveButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal >

            {/* Weight Modal */}
            < Modal
                animationType="fade"
                transparent={true}
                visible={weightModalVisible}
                onRequestClose={() => setWeightModalVisible(false)
                }
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Weight Tracker</Text>
                            <TouchableOpacity onPress={() => setWeightModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <View style={[styles.weightIconContainer, { width: 60, height: 60, borderRadius: 30, alignSelf: 'center' }]}>
                                <Ionicons name="fitness" size={30} color={Colors.primary} />
                            </View>

                            <View style={styles.weightInputContainer}>
                                <TextInput
                                    style={styles.weightInput}
                                    placeholder={weight ? weight.toString() : "0.0"}
                                    value={newWeight}
                                    onChangeText={setNewWeight}
                                    keyboardType="numeric"
                                    maxLength={5}
                                />
                                <Text style={styles.weightInputUnit}>kg</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveWeight}
                                disabled={savingWeight || !newWeight}
                            >
                                {savingWeight ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Update Weight</Text>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.modalDescription}>
                                Track your weight progress. This will be saved to your profile.
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal >
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollView: {
        flex: 1,
    },
    mainHeading: {
        fontSize: 26,
        fontWeight: '700',
        color: Colors.text,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    cardsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 16,
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    fireIcon: {
        width: 36,
        height: 36,
        marginBottom: 6,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    streakNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 8,
    },
    weekContainer: {
        flexDirection: 'row',
        gap: 2,
        width: '100%',
        justifyContent: 'space-around',
    },
    dayItem: {
        alignItems: 'center',
        gap: 2,
        flex: 1,
        maxWidth: 24,
    },
    dayLabel: {
        fontSize: 9,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    checkbox: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkboxActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    weightIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    weightDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 3,
    },
    weightNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
    },
    weightUnit: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    weightHint: {
        fontSize: 10,
        color: Colors.textLight,
        marginTop: 3,
    },
    nextIconContainer: {
        position: 'absolute',
        bottom: 8,
        right: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '90%',
        maxWidth: 340,
        maxHeight: '80%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalScrollView: {
        width: '100%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    modalBody: {
        alignItems: 'center',
    },
    modalStreakNumber: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.primary,
        marginTop: 10,
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    aiSummary: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    bentoGrid: {
        marginBottom: 20,
        gap: 10,
    },
    bentoRow: {
        flexDirection: 'row',
        gap: 10,
    },
    bentoCard: {
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bentoLabel: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginTop: 4,
        marginBottom: 2,
        fontWeight: '600',
    },
    bentoValue: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.text,
        textAlign: 'center',
    },
    subHeading: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        width: '100%',
        marginBottom: 10,
        marginTop: 10,
    },
    highlightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    highlightText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    statsContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    dailyStatCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
        paddingBottom: 8,
        marginBottom: 8,
        width: '100%',
    },
    tableHeaderText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    tableText: {
        fontSize: 10,
        color: Colors.text,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        alignItems: 'center',
        width: '100%',
    },
    dailyInsightContainer: {
        backgroundColor: '#F8F9FA',
        padding: 6,
        borderRadius: 6,
        marginTop: 4,
    },
    dailyInsightText: {
        fontSize: 10,
        color: Colors.text,
        fontStyle: 'italic',
    },
    weightInputContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
        paddingBottom: 4,
    },
    weightInput: {
        fontSize: 48,
        fontWeight: '700',
        color: Colors.primary,
        minWidth: 100,
        textAlign: 'center',
    },
    weightInputUnit: {
        fontSize: 18,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
