import { useAuth, useUser } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { AuthButton } from '../components/AuthButton';
import { userService } from '../services/userService';

export default function HomeScreen() {
  const { signOut, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      console.log("Syncing user to Firestore...", user.id);
      userService.syncUser(user);
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6a11cb" />
      </View>
    );
  }

  if (!isSignedIn) {
    // Let RootLayout handle redirection
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6a11cb" />
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
          style={{ marginTop: 40, backgroundColor: '#ff4d4f' }}
          textStyle={{ color: '#fff' }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  cardText: {
    color: '#666',
    lineHeight: 22,
  },
});


