import { useAuth, useUser } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { userService } from '../services/userService';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
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
    return <Redirect href="/(auth)/sign-in" />;
  }

  // User is signed in, redirect to the home tab
  return <Redirect href="/(tabs)/home" />;
}

