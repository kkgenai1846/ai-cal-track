import { Activity, Calendar, Dumbbell } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface WorkoutFrequencyStepProps {
    frequency?: string;
    onSelect: (frequency: string) => void;
}

export const WorkoutFrequencyStep: React.FC<WorkoutFrequencyStepProps> = ({ frequency, onSelect }) => {
    const options = [
        {
            value: 'Rarely (0-1 days/week)',
            label: 'Rarely',
            icon: Calendar
        },
        {
            value: 'Sometimes (2-3 days/week)',
            label: 'Sometimes',
            icon: Dumbbell
        },
        {
            value: 'Often (4+ days/week)',
            label: 'Often',
            icon: Activity
        }
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>How often do you exercise?</Text>
            <Text style={styles.subtitle}>This helps us estimate your daily calorie expenditure.</Text>

            <View style={styles.optionsContainer}>
                {options.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = frequency === option.value;

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
                            <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                                {option.label}
                            </Text>
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
