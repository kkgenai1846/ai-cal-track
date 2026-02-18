import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { userService } from '../services/userService';

export default function PreferencesScreen() {
    const { user } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Preferences State
    const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('light');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user) return;
        try {
            const userData = await userService.getUser(user.id);
            if (userData) {
                setTheme(userData.theme || 'light');
                setNotificationsEnabled(userData.notificationsEnabled ?? false);
            }
        } catch (error) {
            console.error("Error loading user preferences:", error);
            Alert.alert("Error", "Failed to load preferences.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await userService.updateUser(user.id, {
                theme,
                notificationsEnabled
            });
            Alert.alert("Success", "Preferences saved.");
            router.back();
        } catch (error) {
            console.error("Error saving preferences:", error);
            Alert.alert("Error", "Failed to save preferences.");
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
                <Text style={styles.headerTitle}>Preferences</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>

                {/* Theme Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <View style={styles.card}>
                        <Text style={styles.label}>Theme</Text>
                        <View style={styles.themeSelector}>
                            {(['light', 'dark', 'system'] as const).map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    style={[
                                        styles.themeOption,
                                        theme === t && styles.themeOptionSelected
                                    ]}
                                    onPress={() => setTheme(t)}
                                >
                                    <Text style={[
                                        styles.themeText,
                                        theme === t && styles.themeTextSelected
                                    ]}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Notifications Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Enable Notifications</Text>
                            <Switch
                                trackColor={{ false: "#767577", true: Colors.primary }}
                                thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={setNotificationsEnabled}
                                value={notificationsEnabled}
                            />
                        </View>
                    </View>
                </View>

            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Preferences</Text>
                    )}
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
        padding: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
    },
    themeSelector: {
        flexDirection: 'row',
        backgroundColor: Colors.surfaceHighlight,
        borderRadius: 12,
        padding: 4,
    },
    themeOption: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    themeOptionSelected: {
        backgroundColor: Colors.background,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    themeText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    themeTextSelected: {
        color: Colors.text,
        fontWeight: '600',
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
