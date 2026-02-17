import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthButton } from '../../components/AuthButton';
import { BirthdayStep } from '../../components/onboarding/BirthdayStep';
import { GenderStep } from '../../components/onboarding/GenderStep';
import { GoalStep } from '../../components/onboarding/GoalStep';
import { MeasurementsStep } from '../../components/onboarding/MeasurementsStep';
import { WorkoutFrequencyStep } from '../../components/onboarding/WorkoutFrequencyStep';
import { ProgressBar } from '../../components/ProgressBar';
import { Colors } from '../../constants/Colors';
import { userService } from '../../services/userService';

// Total number of steps
const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [gender, setGender] = useState<'male' | 'female' | 'other' | undefined>();
    const [goal, setGoal] = useState<'gain' | 'lose' | 'maintain' | undefined>();
    const [workoutFrequency, setWorkoutFrequency] = useState<string | undefined>();
    const [birthday, setBirthday] = useState<Date | undefined>();
    const [height, setHeight] = useState<number | undefined>();
    const [weight, setWeight] = useState<number | undefined>();

    const progress = currentStep / TOTAL_STEPS;

    const handleNext = async () => {
        if (currentStep < TOTAL_STEPS) {
            // Validation
            if (currentStep === 1 && !gender) return Alert.alert('Selection Required', 'Please select your gender.');
            if (currentStep === 2 && !goal) return Alert.alert('Selection Required', 'Please select your goal.');
            if (currentStep === 3 && !workoutFrequency) return Alert.alert('Selection Required', 'Please select your workout frequency.');
            if (currentStep === 4 && !birthday) return Alert.alert('Selection Required', 'Please select your birthday.');

            setCurrentStep(currentStep + 1);
        } else {
            // Final Step - Submit
            if (!user) return;
            if (!height || !weight) return Alert.alert('Input Required', 'Please enter your height and weight.');

            setIsLoading(true);
            try {
                // Save onboarding data but don't mark as completed yet
                const result = await userService.updateOnboardingData(user.id, {
                    gender,
                    goal,
                    workoutFrequency,
                    birthday,
                    height,
                    weight,
                    onboardingCompleted: false // Mark as false until AI plan is generated
                });

                if (result) {
                    // @ts-ignore
                    router.replace('/onboarding/plan-generation');
                } else {
                    Alert.alert('Error', 'Failed to save data. Please try again.');
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <GenderStep selectedGender={gender} onSelect={setGender} />;
            case 2:
                return <GoalStep selectedGoal={goal} onSelect={setGoal} />;
            case 3:
                return <WorkoutFrequencyStep frequency={workoutFrequency} onSelect={setWorkoutFrequency} />;
            case 4:
                return <BirthdayStep birthday={birthday} onSelect={setBirthday} />;
            case 5:
                return <MeasurementsStep initialHeight={height} initialWeight={weight} onUpdate={(h, w) => { setHeight(h); setWeight(w); }} />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <ProgressBar progress={progress} />
                <Text style={styles.stepIndicator}>Step {currentStep} of {TOTAL_STEPS}</Text>
            </View>

            <View style={styles.content}>
                {renderStep()}
            </View>

            <View style={styles.footer}>
                <View style={styles.buttonContainer}>
                    {currentStep > 1 && (
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <AuthButton
                                title="Back"
                                onPress={handleBack}
                                variant="secondary"
                                style={styles.backButton}
                                textStyle={{ color: Colors.text }}
                            />
                        </View>
                    )}
                    <View style={{ flex: 1, marginLeft: currentStep > 1 ? 8 : 0 }}>
                        <AuthButton
                            title={currentStep === TOTAL_STEPS ? "Finish" : "Next"}
                            onPress={handleNext}
                            isLoading={isLoading}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    stepIndicator: {
        textAlign: 'right',
        color: Colors.textSecondary,
        fontSize: 12,
        marginTop: 8,
    },
    content: {
        flex: 1,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: Colors.surfaceHighlight,
        backgroundColor: Colors.background,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    backButton: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    }
});
