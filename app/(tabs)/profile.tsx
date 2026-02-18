import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { ChevronRight, Crown, FileText, Lock, LogOut, Mail, MessageSquarePlus, Settings, User, Zap } from 'lucide-react-native';
import { Image, Linking, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function ProfileScreen() {
    const { user } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();

    const menuItems = [
        {
            title: "Account",
            items: [
                { icon: User, label: "Personal Details", onPress: () => router.push('/personal-details') },
                { icon: Settings, label: "Preferences", onPress: () => router.push('/preferences') },
                { icon: Crown, label: "Upgrade to Premium", onPress: () => { }, iconColor: Colors.warning },
            ]
        },
        {
            title: "Support",
            items: [
                { icon: MessageSquarePlus, label: "Request New Features", onPress: () => router.push('/feature-requests') },
                { icon: Mail, label: "Contact Us", onPress: () => Linking.openURL('mailto:ckinstech@gmail.com?subject=Support Request') },
                { icon: FileText, label: "Terms & Conditions", onPress: () => router.push('/terms') },
                { icon: Lock, label: "Privacy Policy", onPress: () => router.push('/privacy') },
            ]
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.screenTitle}>Profile</Text>
                </View>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        {user?.imageUrl ? (
                            <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{user?.firstName?.charAt(0) || 'U'}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>{user?.fullName || 'User'}</Text>
                        <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Free Plan</Text>
                        </View>
                    </View>
                </View>

                {/* Free Trial Banner */}
                <TouchableOpacity style={styles.trialBanner}>
                    <View style={styles.trialContent}>
                        <View style={styles.trialIconContainer}>
                            <Zap size={24} color="#FFF" fill="#FFF" />
                        </View>
                        <View style={styles.trialTextContainer}>
                            <Text style={styles.trialTitle}>Start 7-Day Free Trial</Text>
                            <Text style={styles.trialSubtitle}>Unlock premium features today</Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color="#FFF" />
                </TouchableOpacity>

                {/* Menu Sections */}
                {menuItems.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.sectionCard}>
                            {section.items.map((item, itemIndex) => (
                                <View key={itemIndex}>
                                    <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                                        <View style={styles.menuItemLeft}>
                                            <View style={[styles.iconContainer, { backgroundColor: Colors.surfaceHighlight }]}>
                                                <item.icon size={20} color={item.iconColor || Colors.text} />
                                            </View>
                                            <Text style={styles.menuItemLabel}>{item.label}</Text>
                                        </View>
                                        <ChevronRight size={20} color={Colors.textLight} />
                                    </TouchableOpacity>
                                    {itemIndex < section.items.length - 1 && <View style={styles.separator} />}
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={() => signOut()}>
                    <LogOut size={20} color={Colors.error} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={styles.versionInfo}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        marginTop: 20,
        marginBottom: 24,
    },
    screenTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        marginRight: 20,
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    badge: {
        backgroundColor: Colors.surfaceHighlight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    trialBanner: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    trialContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    trialIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    trialTextContainer: {
        flex: 1,
    },
    trialTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 2,
    },
    trialSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionCard: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuItemLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.border,
        marginLeft: 64, // Align with text
        marginRight: 12,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        marginTop: 8,
        marginBottom: 24,
        borderRadius: 16,
        backgroundColor: '#FFF0F0',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.error,
        marginLeft: 8,
    },
    versionInfo: {
        alignItems: 'center',
        marginTop: 8,
    },
    versionText: {
        fontSize: 12,
        color: Colors.textLight,
    },
});
