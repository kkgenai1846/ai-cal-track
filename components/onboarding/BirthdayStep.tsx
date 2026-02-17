import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Gift } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface BirthdayStepProps {
    birthday?: Date;
    onSelect: (date: Date) => void;
}

export const BirthdayStep: React.FC<BirthdayStepProps> = ({ birthday, onSelect }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [tempDate, setTempDate] = useState(birthday || new Date(2000, 0, 1));

    const onChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || tempDate;
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        setTempDate(currentDate);
        onSelect(currentDate);
    };

    const formatDate = (date?: Date) => {
        if (!date) return 'Select Date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Gift size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>When were you born?</Text>
            <Text style={styles.subtitle}>We use this to calculate your metabolic rate.</Text>

            <View style={styles.inputContainer}>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowPicker(true)}
                >
                    <Calendar size={24} color={Colors.primary} />
                    <Text style={[styles.dateText, !birthday && styles.placeholderText]}>
                        {formatDate(birthday)}
                    </Text>
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={tempDate}
                        mode="date"
                        display="spinner"
                        onChange={onChange}
                        maximumDate={new Date()}
                        textColor={Colors.text}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
    },
    header: {
        marginBottom: 24,
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
    inputContainer: {
        width: '100%',
        maxWidth: 320,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 12,
    },
    dateText: {
        fontSize: 18,
        color: Colors.text,
        fontWeight: '500',
    },
    placeholderText: {
        color: Colors.textLight,
    }
});
