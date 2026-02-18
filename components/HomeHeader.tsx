import { useUser } from '@clerk/clerk-expo';
import { Bell } from 'lucide-react-native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

export default function HomeHeader() {
    const { user } = useUser();

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <View style={styles.avatarContainer}>
                    {user?.imageUrl ? (
                        <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
                            <Text style={styles.avatarText}>{user?.firstName?.charAt(0) || 'U'}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.nameText}>{user?.firstName || 'User'}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.notificationButton}>
                <Bell size={24} color={Colors.text} />
                {/* Optional: Add a red dot if there are notifications */}
                {/* <View style={styles.badge} /> */}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20, // Adjust based on SafeAreaView or specific design needs
        paddingBottom: 20,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    textContainer: {
        justifyContent: 'center',
    },
    welcomeText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    nameText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    notificationButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
});
