import { useAuth, useUser } from '@clerk/clerk-expo';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { AuthButton } from '../../components/AuthButton';
import { Colors } from '../../constants/Colors';

export default function ProfileScreen() {
    const { user } = useUser();
    const { signOut } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Profile</Text>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.firstName?.charAt(0) || 'U'}</Text>
                    </View>
                    <Text style={styles.name}>{user?.fullName || 'User'}</Text>
                    <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
                </View>

                <AuthButton
                    title="Sign Out"
                    onPress={() => signOut()}
                    style={{ marginTop: 40, backgroundColor: Colors.error }}
                    textStyle={{ color: Colors.textWhite }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 40,
        alignSelf: 'flex-start',
    },
    userInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    name: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
});
