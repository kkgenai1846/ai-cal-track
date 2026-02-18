import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { AuthButton } from '../components/AuthButton';
import { Colors } from '../constants/Colors';
import { userService } from '../services/userService';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  const router = useRouter();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (isLoaded && isSignedIn && user) {
        console.log("Syncing user to Firestore...", user.id);
        const userData = await userService.syncUser(user);

        if (userData && !userData.onboardingCompleted) {
          console.log("Redirecting to onboarding...");
          // @ts-ignore
          router.replace('/onboarding');
        }
      }
    };

    checkUserStatus();
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    // Let RootLayout handle redirection
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome back,</Text>
        <Text style={styles.subtitle}>{user?.firstName || 'User'}!</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Progress</Text>
          <Text style={styles.cardText}>No data yet. Start tracking your calories!</Text>
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
    padding: 24,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.google,
  },
  cardText: {
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});


