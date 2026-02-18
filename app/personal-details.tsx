import { useUser } from '@clerk/clerk-expo';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { userService } from '../services/userService';

export default function PersonalDetailsScreen() {
    const { user } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [calories, setCalories] = useState('2000');
    const [protein, setProtein] = useState('140');
    const [carbs, setCarbs] = useState('275');
    const [fat, setFat] = useState('65');
    const [water, setWater] = useState('3');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user) return;
        try {
            const userData = await userService.getUser(user.id);
            if (userData) {
                setCalories((userData.dailyCalories || 2000).toString());
                setProtein((userData.dailyProtein || 140).toString());
                setCarbs((userData.dailyCarbs || 275).toString());
                setFat((userData.dailyFat || 65).toString());
                setWater((userData.dailyWater || 3).toString());
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            Alert.alert("Error", "Failed to load your details.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await userService.updateUser(user.id, {
                dailyCalories: Number(calories) || 0,
                dailyProtein: Number(protein) || 0,
                dailyCarbs: Number(carbs) || 0,
                dailyFat: Number(fat) || 0,
                dailyWater: Number(water) || 0,
            });
            Alert.alert("Success", "Your personal details have been updated.");
            router.back();
        } catch (error) {
            console.error("Error saving user data:", error);
            Alert.alert("Error", "Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Daily Targets</Text>
                        <Text style={styles.sectionSubtitle}>Customize your daily nutritional goals.</Text>

                        <View style={styles.card}>
                            {/* Calories */}
                            <View style={styles.inputRow}>
                                <View style={styles.labelContainer}>
                                    <View style={[styles.iconBox, { backgroundColor: '#FFF0F0' }]}>
                                        <MaterialCommunityIcons name="fire" size={20} color={Colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={styles.label}>Calories</Text>
                                        <Text style={styles.subLabel}>kcal/day</Text>
                                    </View>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={calories}
                                    onChangeText={setCalories}
                                    keyboardType="numeric"
                                    placeholder="2000"
                                />
                            </View>

                            <View style={styles.divider} />

                            {/* Protein */}
                            <View style={styles.inputRow}>
                                <View style={styles.labelContainer}>
                                    <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                                        <MaterialCommunityIcons name="food-steak" size={20} color="#1976D2" />
                                    </View>
                                    <View>
                                        <Text style={styles.label}>Protein</Text>
                                        <Text style={styles.subLabel}>grams/day</Text>
                                    </View>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={protein}
                                    onChangeText={setProtein}
                                    keyboardType="numeric"
                                    placeholder="140"
                                />
                            </View>

                            <View style={styles.divider} />

                            {/* Carbs */}
                            <View style={styles.inputRow}>
                                <View style={styles.labelContainer}>
                                    <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                                        <MaterialCommunityIcons name="bread-slice" size={20} color="#F57C00" />
                                    </View>
                                    <View>
                                        <Text style={styles.label}>Carbs</Text>
                                        <Text style={styles.subLabel}>grams/day</Text>
                                    </View>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={carbs}
                                    onChangeText={setCarbs}
                                    keyboardType="numeric"
                                    placeholder="275"
                                />
                            </View>

                            <View style={styles.divider} />

                            {/* Fat */}
                            <View style={styles.inputRow}>
                                <View style={styles.labelContainer}>
                                    <View style={[styles.iconBox, { backgroundColor: '#FBE9E7' }]}>
                                        <MaterialCommunityIcons name="oil" size={20} color="#D84315" />
                                    </View>
                                    <View>
                                        <Text style={styles.label}>Fat</Text>
                                        <Text style={styles.subLabel}>grams/day</Text>
                                    </View>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={fat}
                                    onChangeText={setFat}
                                    keyboardType="numeric"
                                    placeholder="65"
                                />
                            </View>

                            <View style={styles.divider} />

                            {/* Water */}
                            <View style={styles.inputRow}>
                                <View style={styles.labelContainer}>
                                    <View style={[styles.iconBox, { backgroundColor: '#E0F7FA' }]}>
                                        <Ionicons name="water" size={20} color="#00BCD4" />
                                    </View>
                                    <View>
                                        <Text style={styles.label}>Water</Text>
                                        <Text style={styles.subLabel}>liters/day</Text>
                                    </View>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={water}
                                    onChangeText={setWater}
                                    keyboardType="numeric"
                                    placeholder="3"
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 20,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 16,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    subLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    input: {
        backgroundColor: Colors.inputBackground,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        width: 100,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.background,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        backgroundColor: Colors.textLight,
        shadowOpacity: 0,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});
