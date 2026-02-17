import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Tabs, useRouter } from 'expo-router';
import { BarChart2, Home, Plus, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    const [showImageSourceDialog, setShowImageSourceDialog] = useState(false);

    const handleGalleryPick = async () => {
        setShowImageSourceDialog(false);

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need permission to access your photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

    const handleCameraCapture = async () => {
        setShowImageSourceDialog(false);

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need permission to access your camera.');
            return;
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
                    router.push('/food-database');
                }}
                onScanFood={() => {
                    setIsQuickAddVisible(false);
                    setShowImageSourceDialog(true);
                }}
            />

            {/* Image Source Dialog */}
            <Modal
                visible={showImageSourceDialog}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowImageSourceDialog(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowImageSourceDialog(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Image Source</Text>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={handleGalleryPick}
                        >
                            <Ionicons name="images" size={24} color={Colors.primary} />
                            <Text style={styles.modalOptionText}>Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={handleCameraCapture}
                        >
                            <Ionicons name="camera" size={24} color={Colors.primary} />
                            <Text style={styles.modalOptionText}>Camera</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setShowImageSourceDialog(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F9F9F9',
        marginBottom: 12,
        gap: 12,
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    modalCancel: {
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
});
