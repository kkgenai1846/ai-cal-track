import { Tabs, useRouter } from 'expo-router';
import { BarChart2, Home, Plus, User } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

// Custom Tab Bar Button for the floating action button
const CustomTabBarButton = ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
    <TouchableOpacity
        style={{
            top: -20, // Floating effect
            justifyContent: 'center',
            alignItems: 'center',
            ...styles.shadow
        }}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View
            style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: Colors.primary,
                justifyContent: 'center',
                alignItems: 'center', // Center the icon
            }}
        >
            {children}
        </View>
    </TouchableOpacity>
);

export default function TabLayout() {
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,

                    backgroundColor: '#ffffff',
                    borderRadius: 20,
                    height: 70,
                    borderTopWidth: 0, // Remove top border
                    ...styles.shadow,
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
                            // Handle add button press
                            console.log("Add button pressed");
                            // router.push('/modal/add-entry'); // Navigation logic to be implemented
                        }}>
                            <Plus size={30} color="#fff" strokeWidth={3} />
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
    );
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#000', // Shadow color
        shadowOffset: {
            width: 0,
            height: 4, // Shadow position
        },
        shadowOpacity: 0.1, // Shadow opacity
        shadowRadius: 4, // Shadow blur
        elevation: 5, // Android shadow
    },
});
