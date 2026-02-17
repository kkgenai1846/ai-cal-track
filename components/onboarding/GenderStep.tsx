import { User, UserCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface GenderStepProps {
    selectedGender?: 'male' | 'female' | 'other';
    onSelect: (gender: 'male' | 'female' | 'other') => void;
}

export const GenderStep: React.FC<GenderStepProps> = ({ selectedGender, onSelect }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tell us about yourself</Text>
            <Text style={styles.subtitle}>To calculate your personalized calorie plan, we need to know your gender.</Text>

            <View style={styles.optionsContainer}>
                <TouchableOpacity
                    style={[
                        styles.option,
                        selectedGender === 'male' && styles.selectedOption,
                    ]}
                    onPress={() => onSelect('male')}
                >
                    <User
                        size={40}
                        color={selectedGender === 'male' ? Colors.white : Colors.textSecondary}
                    />
                    <Text style={[styles.optionText, selectedGender === 'male' && styles.selectedOptionText]}>Male</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.option,
                        selectedGender === 'female' && styles.selectedOption,
                    ]}
                    onPress={() => onSelect('female')}
                >
                    <User
                        size={40}
                        color={selectedGender === 'female' ? Colors.white : Colors.textSecondary}
                    />
                    <Text style={[styles.optionText, selectedGender === 'female' && styles.selectedOptionText]}>Female</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.option,
                        selectedGender === 'other' && styles.selectedOption,
                    ]}
                    onPress={() => onSelect('other')}
                >
                    <UserCircle
                        size={40}
                        color={selectedGender === 'other' ? Colors.white : Colors.textSecondary}
                    />
                    <Text style={[styles.optionText, selectedGender === 'other' && styles.selectedOptionText]}>Other</Text>
                </TouchableOpacity>
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
        lineHeight: 24,
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
    },
    selectedOptionText: {
        color: Colors.white,
    },
});
