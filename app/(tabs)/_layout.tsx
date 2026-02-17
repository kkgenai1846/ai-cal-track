import { Tabs, useRouter } from 'expo-router';
import { BarChart2, Home, Plus, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { QuickAddModal } from '../../components/QuickAddModal';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

// Custom Tab Bar Button for the floating action button
const CustomTabBarButton = ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
    <TouchableOpacity
        style={{
            justifyContent: 'center',
            alignItems: 'center',
        }}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View
            style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: Colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {children}
        </View>
    </TouchableOpacity>
);

export default function TabLayout() {
    const router = useRouter();
    const [isQuickAddVisible, setIsQuickAddVisible] = useState(false);

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: '#ffffff',
                        borderRadius: 0,
                        height: 60,
                        borderTopWidth: 1,
                        borderTopColor: '#E0E0E0',
                        paddingBottom: 0,
                    },
                    tabBarActiveTintColor: Colors.primary,
                    tabBarInactiveTintColor: Colors.textSecondary,
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <Home size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="analytics"
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <BarChart2 size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <User size={size} color={color} />
                        ),
                    }}
                />
                {/* Dummy screen for the '+' button functionality */}
                <Tabs.Screen
                    name="add"
                    options={{
                        tabBarButton: (props) => (
                            <CustomTabBarButton {...props} onPress={() => {
                                setIsQuickAddVisible(true);
                            }}>
                                <Plus size={24} color="#fff" strokeWidth={3} />
                            </CustomTabBarButton>
                        ),
                    }}
                    listeners={() => ({
                        tabPress: (e) => {
                            e.preventDefault(); // Prevent default navigation
                        },
                    })}
                />
            </Tabs>
            <QuickAddModal
                visible={isQuickAddVisible}
                onClose={() => setIsQuickAddVisible(false)}
                onLogExercise={() => {
                    setIsQuickAddVisible(false);
                    router.push('/log-exercise');
                }}
                onAddWater={() => {
                    setIsQuickAddVisible(false);
                    router.push('/log-water');
                }}
                onFoodDatabase={() => {
                    setIsQuickAddVisible(false);
                    Alert.alert('Food Database', 'Feature coming soon!');
                }}
                onScanFood={() => {
                    setIsQuickAddVisible(false);
                    Alert.alert('Scan Food', 'Premium feature - Upgrade to unlock!');
                }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
});
