import { useOAuth, useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthButton } from '../../components/AuthButton';
import { AuthInput } from '../../components/AuthInput';
import { Colors } from '../../constants/Colors';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';

export default function SignInScreen() {
    const router = useRouter();
    const { signIn, setActive, isLoaded } = useSignIn();
    useWarmUpBrowser();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onSignInPress = async () => {
        if (!isLoaded) return;
        setIsLoading(true);

        try {
            const completeSignIn = await signIn.create({
                identifier: email,
                password,
            });

            // This indicates the user is signed in
            await setActive({ session: completeSignIn.createdSessionId });
            router.replace('/');
        } catch (err: any) {
            Alert.alert('Error', err.errors ? err.errors[0].message : err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

    const onGoogleSignInPress = React.useCallback(async () => {
        try {
            const { createdSessionId, setActive, signUp } = await startOAuthFlow({
                redirectUrl: Linking.createURL('/', { scheme: 'aicaltrack' }),
            });

            if (createdSessionId) {
                setActive!({ session: createdSessionId });
            } else {
                // Use signIn or signUp for next steps such as MFA
            }
        } catch (err) {
            console.error('OAuth error', err);
        }
    }, []);

    useEffect(() => {
        console.log("Rendering SignInScreen with Google OAuth flow");
    }, []);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/images/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue your journey</Text>
                </View>

                <View style={styles.form}>
                    <AuthInput
                        label="Email Address"
                        placeholder="hello@example.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <AuthInput
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        isPassword
                    />

                    <View style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </View>

                    <AuthButton
                        title="Sign In"
                        onPress={onSignInPress}
                        isLoading={isLoading}
                        style={{ marginTop: 10 }}
                    />

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <AuthButton
                        title="Sign in with Google"
                        onPress={onGoogleSignInPress}
                        variant="google"
                        icon={<Ionicons name="logo-google" size={20} color={Colors.google} style={{ marginRight: 8 }} />}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href="/(auth)/sign-up" asChild>
                            <Text style={styles.linkText}>Sign Up</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 60,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        marginHorizontal: 16,
        color: Colors.textLight,
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    linkText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
});
