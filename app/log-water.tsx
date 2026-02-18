import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { ActivityLog, logService } from '../services/logService';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

export default function LogWaterScreen() {
    const { user } = useUser();
    const [waterMl, setWaterMl] = useState(0);

    // Constants for glass measurements
    const HALF_GLASS_ML = 125;
    const FULL_GLASS_ML = 250;
    const MAX_ML = 1000; // 4 full glasses

    const handleIncrement = () => {
        if (waterMl < MAX_ML) {
            setWaterMl(prev => prev + HALF_GLASS_ML);
        }
    };

    const handleDecrement = () => {
        if (waterMl > 0) {
            setWaterMl(prev => Math.max(0, prev - HALF_GLASS_ML));
        }
    };

    const handleLogWater = async () => {
        if (!user) {
            Alert.alert("Error", "Please log in to save water intake.");
            return;
        }

        if (waterMl === 0) {
            Alert.alert("No Water", "Please add some water before logging.");
            return;
        }

        const currentTime = new Date().toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
        });
        const waterLiters = waterMl / 1000;

        const newActivity: ActivityLog = {
            id: Date.now().toString(),
            type: "water",
            name: "Water Intake",
            calories: 0,
            waterAmount: waterLiters,
            time: currentTime,
        };

        await logService.updateDailyLog(user.id, formatDate(new Date()), { water: waterLiters }, newActivity);

        Alert.alert("Success", `Logged ${waterMl}ml of water!`, [
            { text: "OK", onPress: () => router.back() }
        ]);
    };

    const renderGlasses = () => {
        const glasses = [];
        let remainingMl = waterMl;

        // Calculate how many glasses to show (max 4)
        let glassCount = 0;
        const tempMl = waterMl;

        // Count full glasses
        const fullGlasses = Math.floor(tempMl / FULL_GLASS_ML);
        const remainder = tempMl % FULL_GLASS_ML;

        glassCount = fullGlasses;
        if (remainder >= HALF_GLASS_ML) {
            glassCount += 1; // Add one more for the half glass
        }

        // Render glasses
        for (let i = 0; i < Math.min(glassCount, 4); i++) {
            if (remainingMl >= FULL_GLASS_ML) {
                glasses.push(
                    <Image
                        key={i}
                        source={require("@/assets/images/full_glass.png")}
                        style={styles.glassImage}
                        resizeMode="contain"
                    />
                );
                remainingMl -= FULL_GLASS_ML;
            } else if (remainingMl >= HALF_GLASS_ML) {
                glasses.push(
                    <Image
                        key={i}
                        source={require("@/assets/images/half_glass.png")}
                        style={styles.glassImage}
                        resizeMode="contain"
                    />
                );
                remainingMl -= HALF_GLASS_ML;
            }
        }

        // If no water, show empty glass
        if (waterMl === 0) {
            glasses.push(
                <Image
                    key="empty"
                    source={require("@/assets/images/empty_glass.png")}
                    style={styles.glassImageLarge}
                    resizeMode="contain"
                />
            );
        }

        return glasses;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Water Intake</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Glass Display Area */}
            <View style={styles.glassContainer}>
                <View style={styles.glassRow}>
                    {renderGlasses()}
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity
                    onPress={handleDecrement}
                    style={[styles.controlButton, waterMl === 0 && styles.controlButtonDisabled]}
                    disabled={waterMl === 0}
                >
                    <Ionicons name="remove" size={32} color={waterMl === 0 ? Colors.border : Colors.primary} />
                </TouchableOpacity>

                <View style={styles.mlDisplay}>
                    <Text style={styles.mlText}>{waterMl}</Text>
                    <Text style={styles.mlLabel}>ml</Text>
                </View>

                <TouchableOpacity
                    onPress={handleIncrement}
                    style={[styles.controlButton, waterMl >= MAX_ML && styles.controlButtonDisabled]}
                    disabled={waterMl >= MAX_ML}
                >
                    <Ionicons name="add" size={32} color={waterMl >= MAX_ML ? Colors.border : Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Log Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.logButton, waterMl === 0 && styles.logButtonDisabled]}
                    onPress={handleLogWater}
                    disabled={waterMl === 0}
                >
                    <Text style={styles.logButtonText}>Log Water</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    placeholder: {
        width: 32,
    },
    glassContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    glassRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        maxWidth: '90%',
    },
    glassImage: {
        width: 80,
        height: 120,
    },
    glassImageLarge: {
        width: 120,
        height: 180,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        gap: 40,
    },
    controlButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    controlButtonDisabled: {
        backgroundColor: Colors.surface,
        opacity: 0.5,
    },
    mlDisplay: {
        alignItems: 'center',
        minWidth: 100,
    },
    mlText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    mlLabel: {
        fontSize: 16,
        color: Colors.textLight,
        marginTop: 4,
    },
    bottomContainer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    },
    logButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    logButtonDisabled: {
        backgroundColor: Colors.border,
        opacity: 0.5,
    },
    logButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});
