import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { analyzeFoodImage, FoodAnalysisResult } from '../services/foodAnalysisService';

export default function FoodAnalysisScreen() {
    const params = useLocalSearchParams();
    const imageUri = params.imageUri as string;
    const [currentStep, setCurrentStep] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanPosition] = useState(new Animated.Value(0));

    const analysisSteps = [
        { id: 1, label: 'Analyzing food' },
        { id: 2, label: 'Getting nutrition data' },
        { id: 3, label: 'Getting final result' },
    ];

    useEffect(() => {
        analyzeFood();
        startScanAnimation();
    }, []);

    const startScanAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanPosition, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(scanPosition, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const analyzeFood = async () => {
        try {
            setCurrentStep(1); // Start analyzing

            const result = await analyzeFoodImage(imageUri);

            setCurrentStep(2); // Getting nutrition data
            await new Promise(resolve => setTimeout(resolve, 500)); // brief pause

            setCurrentStep(3); // Final result
            setAnalysisResult(result);
        } catch (err) {
            console.error('Analysis error:', err);
            setError(err instanceof Error ? err.message : 'Failed to analyze food');
            Alert.alert('Error', 'Failed to analyze food. Please try again.');
        }
    };

    const handleContinue = () => {
        if (!analysisResult) return;

        router.replace({
            pathname: '/log-food',
            params: {
                name: analysisResult.dishName,
                servingSize: analysisResult.servingSize,
                calories: analysisResult.calories.toString(),
                protein: analysisResult.protein.toString(),
                carbs: analysisResult.carbs.toString(),
                fat: analysisResult.fat.toString(),
            }
        });
    };

    const scanTranslateY = scanPosition.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 250],
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Compact Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Food Analysis</Text>
                <View style={styles.backButton} />
            </View>

            <View style={styles.content}>
                {/* Compact Image with Scanning Animation */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.foodImage} />
                    {currentStep < 3 && (
                        <Animated.View
                            style={[
                                styles.scanLine,
                                {
                                    transform: [{ translateY: scanTranslateY }],
                                },
                            ]}
                        />
                    )}
                    {currentStep < 3 && <View style={styles.scanOverlay} />}
                </View>

                {/* Compact Progress Steps */}
                <View style={styles.stepsContainer}>
                    {analysisSteps.map((step, index) => (
                        <View key={step.id} style={styles.stepItem}>
                            <View style={[
                                styles.stepCheckbox,
                                index < currentStep && styles.stepCheckboxCompleted
                            ]}>
                                {index < currentStep ? (
                                    <Ionicons name="checkmark" size={16} color="#fff" />
                                ) : index === currentStep ? (
                                    <ActivityIndicator size="small" color={Colors.primary} />
                                ) : null}
                            </View>
                            <Text style={[
                                styles.stepLabel,
                                index <= currentStep && styles.stepLabelActive,
                                index < currentStep && styles.stepLabelCompleted
                            ]}>
                                {step.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Compact Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        currentStep < 3 && styles.continueButtonDisabled
                    ]}
                    onPress={handleContinue}
                    disabled={currentStep < 3}
                >
                    <Text style={styles.continueButtonText}>
                        {currentStep < 3 ? 'Analyzing...' : 'Continue'}
                    </Text>
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
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 4,
        width: 40,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 280,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 20,
    },
    foodImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 10,
    },
    scanOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
    stepsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stepCheckbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    stepCheckboxCompleted: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    stepLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    stepLabelActive: {
        color: Colors.text,
        fontWeight: '600',
    },
    stepLabelCompleted: {
        textDecorationLine: 'line-through',
        color: Colors.textSecondary,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    continueButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    continueButtonDisabled: {
        backgroundColor: '#CCC',
        shadowOpacity: 0,
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
