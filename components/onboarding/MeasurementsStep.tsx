import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface MeasurementsStepProps {
    initialHeight?: number;
    initialWeight?: number;
    onUpdate: (height: number, weight: number) => void;
}

export const MeasurementsStep: React.FC<MeasurementsStepProps> = ({ initialHeight, initialWeight, onUpdate }) => {
    const [height, setHeight] = useState(initialHeight?.toString() || '');
    const [weight, setWeight] = useState(initialWeight?.toString() || '');

    const handleHeightChange = (text: string) => {
        setHeight(text);
        const h = parseFloat(text);
        const w = parseFloat(weight);
        if (!isNaN(h) && !isNaN(w)) {
            onUpdate(h, w);
        }
    };

    const handleWeightChange = (text: string) => {
        setWeight(text);
        const h = parseFloat(height);
        const w = parseFloat(text);
        if (!isNaN(h) && !isNaN(w)) {
            onUpdate(h, w);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Body Measurements</Text>
            <Text style={styles.subtitle}>We use this to calculate your BMI and calorie needs.</Text>

            <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Height (ft)</Text>
                    <TextInput
                        style={styles.input}
                        value={height}
                        onChangeText={handleHeightChange}
                        keyboardType="numeric"
                        placeholder="5.8"
                        placeholderTextColor={Colors.textLight}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Weight (kg)</Text>
                    <TextInput
                        style={styles.input}
                        value={weight}
                        onChangeText={handleWeightChange}
                        keyboardType="numeric"
                        placeholder="70"
                        placeholderTextColor={Colors.textLight}
                    />
                </View>
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
    inputGroup: {
        gap: 24,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginLeft: 4,
    },
    input: {
        backgroundColor: Colors.inputBackground,
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        color: Colors.text,
        borderWidth: 1,
        borderColor: 'transparent',
    },
});
