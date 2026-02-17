import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

interface DateStripProps {
    onDateSelect?: (date: Date) => void;
}

export default function DateStrip({ onDateSelect }: DateStripProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [weekStart, setWeekStart] = useState<Date>(getStartOfWeek(new Date()));
    const [weekDates, setWeekDates] = useState<Date[]>([]);

    // Helper to get the start of the week (Sunday)
    function getStartOfWeek(date: Date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day; // Adjust if you want Monday start: - day + (day == 0 ? -6 : 1)
        return new Date(d.setDate(diff));
    }

    useEffect(() => {
        generateWeek(weekStart);
    }, [weekStart]);

    const generateWeek = (start: Date) => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        setWeekDates(days);
    };

    const changeWeek = (direction: 'prev' | 'next') => {
        const newStart = new Date(weekStart);
        newStart.setDate(weekStart.getDate() + (direction === 'next' ? 7 : -7));

        // Prevent navigating to future weeks
        const currentWeekStart = getStartOfWeek(new Date());
        if (direction === 'next' && newStart > currentWeekStart) {
            return;
        }

        setWeekStart(newStart);
    };

    const isCurrentWeek = weekStart.getTime() === getStartOfWeek(new Date()).getTime();

    const handleDatePress = (date: Date) => {
        setSelectedDate(date);
        if (onDateSelect) {
            onDateSelect(date);
        }
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => changeWeek('prev')} style={styles.arrowButton}>
                    <ChevronLeft size={24} color={Colors.textSecondary} />
                </TouchableOpacity>

                <Text style={styles.monthYear}>
                    {weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>

                <TouchableOpacity
                    onPress={() => changeWeek('next')}
                    style={[styles.arrowButton, isCurrentWeek && { opacity: 0.3 }]}
                    disabled={isCurrentWeek}
                >
                    <ChevronRight size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.daysContainer}>
                {weekDates.map((date, index) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0); // M, T, W

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dayItem,
                                isSelected && styles.selectedDayItem,
                                isToday && !isSelected && styles.todayItem
                            ]}
                            onPress={() => handleDatePress(date)}
                        >
                            <Text style={[
                                styles.dayName,
                                isSelected && styles.selectedText,
                                isToday && !isSelected && { color: Colors.primary }
                            ]}>{dayName}</Text>

                            <View style={[
                                styles.dateNumberContainer,
                                isSelected && styles.selectedDateNumberContainer
                            ]}>
                                <Text style={[
                                    styles.dateNumber,
                                    isSelected && styles.selectedText,
                                    isToday && !isSelected && { color: Colors.primary }
                                ]}>{date.getDate()}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    arrowButton: {
        padding: 4,
    },
    monthYear: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: (width - 48) / 7, // Distribute available width
        height: 60,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingVertical: 4,
    },
    selectedDayItem: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    todayItem: {
        borderColor: Colors.primary,
        borderWidth: 1.5,
    },
    dayName: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
        fontWeight: '500',
    },
    dateNumberContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    selectedDateNumberContainer: {
        backgroundColor: 'transparent', // Text color handles the contrast
    },
    dateNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
    },
    selectedText: {
        color: '#ffffff',
    },
});
