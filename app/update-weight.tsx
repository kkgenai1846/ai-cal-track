import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RulerPicker } from 'react-native-ruler-picker';
import { Colors } from '../constants/Colors';
import { logService } from '../services/logService';

export default function UpdateWeightScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user, isLoaded } = useUser();

    // We intentionally start with null and a loading state to ensure 
    // we determine the ONLY correct start weight before rendering the picker.
    // This prevents the "flash of default" or "reset to min" issues.
    const [weight, setWeight] = useState<number | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isLoaded || !user) return;

        let startWeight = 70; // Hard fallback

        // 1. Params (High Priority)
        if (params.currentWeight) {
            const val = Number(Array.isArray(params.currentWeight) ? params.currentWeight[0] : params.currentWeight);
            if (!isNaN(val) && val > 0) {
                startWeight = val;
            }
        }
        // 2. Metadata (Medium Priority - only if param missing/invalid)
        else {
            const metadataWeight = Number(user.publicMetadata?.weight || user.unsafeMetadata?.weight);
            if (!isNaN(metadataWeight) && metadataWeight > 0) {
                startWeight = metadataWeight;
            }
        }

        if (startWeight < 35) startWeight = 70;

        console.log("Resolved Start Weight:", startWeight);
        setWeight(startWeight);
        setIsReady(true);
    }, [isLoaded, user, params.currentWeight]);

    const handleSaveWeight = async () => {
        if (!user || weight === null) return;
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            await logService.logWeight(user.id, weight, today);

            // Update local user metadata for immediate UI feedback
            await user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    weight: weight
                }
            });

            router.back();
        } catch (error) {
            console.error("Failed to update weight", error);
            alert("Failed to update weight. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isReady || weight === null) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Update Weight</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.weightDisplay}>
                    <Text style={styles.weightValue}>{weight}</Text>
                    <Text style={styles.weightUnit}>kg</Text>
                </View>

                <Text style={styles.instruction}>Swipe to adjust</Text>

                <View style={styles.rulerContainer}>
                    {isReady && weight !== null ? (
                        <RulerPicker
                            key={String(weight)} // NUCLEAR OPTION: Force remount if weight changes
                            min={30}
                            max={200}
                            step={0.1}
                            fractionDigits={1}
                            initialValue={weight}
                            onValueChange={(value) => setWeight(Number(value))}
                            onValueChangeEnd={(value) => setWeight(Number(value))}
                            unit=""
                            width={350}
                            height={150}
                            indicatorColor={Colors.primary}
                            indicatorHeight={40}
                            valueTextStyle={{ color: Colors.background, fontSize: 32 }}
                        />
                    ) : (
                        <ActivityIndicator size="small" color={Colors.primary} />
                    )}
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveWeight}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Update Weight</Text>
                    )}
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
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    weightDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    weightValue: {
        fontSize: 64,
        fontWeight: '800',
        color: Colors.primary,
    },
    weightUnit: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginLeft: 8,
    },
    instruction: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 40,
    },
    rulerContainer: {
        height: 150,
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
