import { ArrowDownCircle, ArrowUpCircle, MinusCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface GoalStepProps {
    selectedGoal?: 'gain' | 'lose' | 'maintain';
    onSelect: (goal: 'gain' | 'lose' | 'maintain') => void;
}

export const GoalStep: React.FC<GoalStepProps> = ({ selectedGoal, onSelect }) => {
    const options = [
        {
            value: 'lose' as const,
            label: 'Lose Weight',
            icon: ArrowDownCircle
        },
        {
            value: 'maintain' as const,
            label: 'Maintain',
            icon: MinusCircle
        },
        {
            value: 'gain' as const,
            label: 'Gain Muscle',
            icon: ArrowUpCircle
        }
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>What is your goal?</Text>
            <Text style={styles.subtitle}>We'll adjust your caloric intake based on your objective.</Text>

            <View style={styles.optionsContainer}>
                {options.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = selectedGoal === option.value;

                    let subtext = "";
                    if (option.value === 'lose') subtext = "Get leaner and fitter";
                    if (option.value === 'maintain') subtext = "Stay healthy and fit";
                    if (option.value === 'gain') subtext = "Build muscle and strength";

                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.option,
                                isSelected && styles.selectedOption,
                            ]}
                            onPress={() => onSelect(option.value)}
                        >
                            <IconComponent
                                size={32}
                                color={isSelected ? Colors.white : Colors.textSecondary}
                            />
                            <View>
                                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                                    {option.label}
                                </Text>
                                <Text style={[styles.optionSubtext, isSelected && styles.selectedOptionSubtext]}>
                                    {subtext}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 40,
        textAlign: 'center',
    },
    optionsContainer: {
        flexDirection: 'column',
        gap: 16,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 16,
    },
    selectedOption: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    optionText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    selectedOptionText: {
        color: Colors.white,
    },
    optionSubtext: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    selectedOptionSubtext: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
});
