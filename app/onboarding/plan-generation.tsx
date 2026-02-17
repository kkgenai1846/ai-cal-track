import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, Dumbbell } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthButton } from '../../components/AuthButton';
import { Colors } from '../../constants/Colors';
import { aiService } from '../../services/aiService';
import { userService } from '../../services/userService';

const STEPS = [
    "Analyzing your profile...",
    "Calculating daily metabolic rate...",
    "Determining optimal macro split...",
    "Finalizing your personalized plan...",
];

export default function PlanGenerationScreen() {
    const { user } = useUser();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [currentStep, setCurrentStep] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');

    // Use a ref to track if AI generation is actually done
    const aiGenerationDone = useRef(false);

    useEffect(() => {
        startProcess();
    }, []);

    const startProcess = () => {
        setStatus('loading');
        setCurrentStep(0);
        setErrorMsg('');
        aiGenerationDone.current = false;

        // Start AI generation in background
        generatePlan();

        // Start step progression
        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => {
                // If we are at the last step, don't advance automatically
                // We wait for AI generation to complete
                if (prev >= STEPS.length - 1) {
                    return prev;
                }
                return prev + 1;
            });
        }, 1500); // Advance every 1.5 seconds

        return () => clearInterval(stepInterval);
    };

    const generatePlan = async () => {
        if (!user) return;

        try {
            // 1. Get current user data to pass to AI
            const userData = await userService.getUser(user.id);
            if (!userData) throw new Error("User data not found in Firestore.");

            // 2. Generate Plan
            const plan = await aiService.generateFitnessPlan(userData);
            if (!plan) throw new Error("AI failed to generate a valid plan. Please try again.");

            // 3. Save Plan
            const saved = await userService.updateOnboardingData(user.id, {
                ...plan,
                onboardingCompleted: true
            });

            if (!saved) throw new Error("Failed to save the generated plan to database.");

            // Mark AI as done
            aiGenerationDone.current = true;

            // Force verify we are at the last step before showing success
            // This ensures the UI has caught up if AI was too fast
            setCurrentStep(STEPS.length - 1);

            setStatus('success');
            setTimeout(() => {
                router.replace('/');
            }, 1000);

        } catch (e: any) {
            console.error("Plan Generation Logic Error:", e);
            setStatus('error');
            // Grab the most specific error message
            const message = e.message || (e.error && e.error.message) || JSON.stringify(e);
            setErrorMsg(message);
        }
    };

    const handleSkip = async () => {
        if (!user) return;
        await userService.updateOnboardingData(user.id, { onboardingCompleted: true });
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Dumbbell size={48} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>
                        {status === 'success' ? "Plan Ready!" : "Building Your Plan"}
                    </Text>
                </View>

                {status === 'loading' || status === 'success' ? (
                    <View style={styles.stepsContainer}>
                        {STEPS.map((step, index) => {
                            const isCompleted = index < currentStep || status === 'success';
                            const isCurrent = index === currentStep && status !== 'success';
                            const isPending = index > currentStep;

                            return (
                                <View key={index} style={styles.stepRow}>
                                    <View style={styles.stepIcon}>
                                        {isCompleted ? (
                                            <CheckCircle2 size={24} color={Colors.primary} />
                                        ) : isCurrent ? (
                                            <ActivityIndicator size="small" color={Colors.primary} />
                                        ) : (
                                            <Circle size={24} color={Colors.border} />
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.stepText,
                                        isCompleted && styles.completedText,
                                        isCurrent && styles.currentText,
                                        isPending && styles.pendingText
                                    ]}>
                                        {step}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorTitle}>Generation Failed</Text>
                        <Text style={styles.errorText}>{errorMsg || "An unexpected error occurred."}</Text>
                        <AuthButton title="Try Again" onPress={startProcess} style={{ marginTop: 24 }} />
                        <AuthButton
                            title="Skip for Now"
                            onPress={handleSkip}
                            variant="secondary"
                            style={{ marginTop: 12, backgroundColor: 'transparent', borderWidth: 0 }}
                        />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        padding: 32,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        textAlign: 'center',
    },
    stepsContainer: {
        gap: 24,
        paddingHorizontal: 16,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    stepIcon: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepText: {
        fontSize: 16,
        fontWeight: '500',
    },
    completedText: {
        color: Colors.text,
    },
    currentText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    pendingText: {
        color: Colors.textSecondary,
    },
    errorContainer: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.error,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 24,
    },
});
