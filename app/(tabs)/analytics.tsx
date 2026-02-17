import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { aiService, WeeklyInsight } from '../../services/aiService';
import { logService } from '../../services/logService';

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
    const { user } = useUser();
    const [weekStreak, setWeekStreak] = useState<boolean[]>(Array(7).fill(false));
    const [currentStreak, setCurrentStreak] = useState(0);
    const [streakModalVisible, setStreakModalVisible] = useState(false);
    const [weightModalVisible, setWeightModalVisible] = useState(false);

    // AI Analysis State
    const [weeklyInsight, setWeeklyInsight] = useState<WeeklyInsight | null>(null);
    const [loadingInsight, setLoadingInsight] = useState(false);

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

        // Check each day for activities
        for (const date of weekDates) {
            const dateStr = formatDate(date);
            const dailyLog = await logService.getDailyLog(user.id, dateStr);

            // Day has streak if it has at least one activity
            const hasActivity = dailyLog && dailyLog.activities && dailyLog.activities.length > 0;
            streakData.push(hasActivity || false);
        }

        setWeekStreak(streakData);

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

    // Fetch AI Insight when streak modal opens
    useEffect(() => {
        if (streakModalVisible && !weeklyInsight && !loadingInsight && user) {
            generateInsight();
        }
    }, [streakModalVisible]);

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
            if (logs.length > 0) {
                const insight = await aiService.generateWeeklyInsight(logs);
                setWeeklyInsight(insight);
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

                    {/* My Weight Card */}
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.7}
                        onPress={() => setWeightModalVisible(true)}
                    >
                        <View style={styles.weightIconContainer}>
                            <Ionicons name="fitness" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.cardTitle}>My Weight</Text>
                        <View style={styles.weightDisplay}>
                            <Text style={styles.weightNumber}>
                                {weight || '--'}
                            </Text>
                            <Text style={styles.weightUnit}>kg</Text>
                        </View>
                        {!weight && (
                            <Text style={styles.weightHint}>Set in profile</Text>
                        )}
                        <View style={styles.nextIconContainer}>
                            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
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
        fontSize: 12,
        color: Colors.text,
        lineHeight: 16,
        textAlign: 'justify',
        marginBottom: 10,
        backgroundColor: '#F8F9FA',
        padding: 10,
        borderRadius: 12,
    },
    subHeading: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
        marginTop: 4,
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
        // ... (unused now?) Keep for safety or remove? 
        // We are using tableRow now.
        marginBottom: 8,
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
        marginVertical: 20,
        gap: 8,
    },
    weightInput: {
        fontSize: 40,
        fontWeight: '700',
        color: Colors.text,
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
        paddingBottom: 4,
        textAlign: 'center',
        minWidth: 100,
    },
    weightInputUnit: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        marginBottom: 16,
        width: '100%',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
