import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Tabs, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { QuickAddModal } from '../../components/QuickAddModal';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
    const router = useRouter();
    const [isQuickAddVisible, setIsQuickAddVisible] = useState(false);

    const handleScanFood = async () => {
        setIsQuickAddVisible(false);

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (libraryStatus !== 'granted') {
                return;
            }
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            router.push({
                pathname: '/food-analysis',
                params: { imageUri: result.assets[0].uri }
            });
        }
    };

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: Colors.primary,
                    tabBarInactiveTintColor: Colors.textSecondary,
                    tabBarStyle: {
                        position: 'absolute',
                        backgroundColor: '#fff',
                        borderTopWidth: 1,
                        borderTopColor: '#F0F0F0',
                        height: Platform.OS === 'ios' ? 85 : 65,
                        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
                        paddingTop: 8,
                        paddingHorizontal: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        elevation: 0,
                    },
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '600',
                        marginTop: -2,
                    },
                    tabBarIconStyle: {
                        marginTop: 2,
                    },
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="home" size={28} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="analytics"
                    options={{
                        title: 'Analytics',
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="bar-chart" size={28} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="person" size={28} color={color} />
                        ),
                    }}
                />

                {/* Hidden screen for add - FAB will handle this */}
                <Tabs.Screen
                    name="add"
                    options={{
                        title: '',
                        tabBarButton: () => (
                            <TouchableOpacity
                                style={styles.fabContainer}
                                onPress={() => setIsQuickAddVisible(true)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.fab}>
                                    <Ionicons name="add" size={32} color="#fff" />
                                </View>
                            </TouchableOpacity>
                        ),
                    }}
                    listeners={{
                        tabPress: (e) => {
                            e.preventDefault();
                            setIsQuickAddVisible(true);
                        },
                    }}
                />
            </Tabs>

            <QuickAddModal
                visible={isQuickAddVisible}
                onClose={() => setIsQuickAddVisible(false)}
                onLogExercise={() => {
                    setIsQuickAddVisible(false);
                    router.push('/exercise-details');
                }}
                onAddWater={() => {
                    setIsQuickAddVisible(false);
                    router.push('/log-water');
                }}
                onFoodDatabase={() => {
                    setIsQuickAddVisible(false);
                    router.push('/log-food');
                }}
                onScanFood={handleScanFood}
            />
        </>
    );
}

const styles = StyleSheet.create({
    fabContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        top: -24,
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
