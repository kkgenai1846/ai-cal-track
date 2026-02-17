import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { userService } from '../services/userService';

export default function HomeScreen() {
  const { signOut, isSignedIn, isLoaded } = useAuth();
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
        } else if (userData && userData.onboardingCompleted) {
          console.log("Redirecting to main tabs...");
          // @ts-ignore
          router.replace('/(tabs)/home');
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={{ marginTop: 20, color: Colors.textSecondary }}>Loading your profile...</Text>
    </View>
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


