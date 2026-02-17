import { useOAuth, useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';

import { AuthButton } from '../../components/AuthButton';
import { AuthInput } from '../../components/AuthInput';
import { Colors } from '../../constants/Colors';
import { userService } from '../../services/userService';

export default function SignUpScreen() {
    const router = useRouter();
    const { isLoaded, signUp, setActive } = useSignUp();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useWarmUpBrowser();
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

    const onGoogleSignUpPress = React.useCallback(async () => {
        try {
            const { createdSessionId, setActive, signUp } = await startOAuthFlow({
                redirectUrl: Linking.createURL('/', { scheme: 'aicaltrack' }),
            });

            if (createdSessionId) {
                setActive!({ session: createdSessionId });
            } else {
                // Use signIn or signUp for next steps
            }
        } catch (err) {
            console.error('OAuth error', err);
        }
    }, []);

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        setIsLoading(true);

        try {
            await signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName,
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (err: any) {
            Alert.alert('Error', err.errors ? err.errors[0].message : err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onPressVerify = async () => {
        if (!isLoaded) return;
        setIsLoading(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });

                // Ensure user is defined before saving to Firestore
                const userId = completeSignUp.createdUserId;
                if (userId) {
                    await userService.createUser(userId, {
                        email,
                        firstName,
                        lastName
                    });
                }

                router.replace('/');
            } else {
                console.error(JSON.stringify(completeSignUp, null, 2));
            }
        } catch (err: any) {
            Alert.alert('Error', err.errors ? err.errors[0].message : err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    {!pendingVerification && (
                        <>
                            <Image
                                source={require('../../assets/images/icon.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Start your health journey today</Text>
                        </>
                    )}
                    {pendingVerification && (
                        <>
                            <Ionicons name="mail-open-outline" size={64} color={Colors.primary} style={{ marginBottom: 20 }} />
                            <Text style={styles.title}>Verify Email</Text>
                            <Text style={styles.subtitle}>Enter the code sent to {email}</Text>
                        </>
                    )}
                </View>

                {!pendingVerification ? (
                    <View style={styles.form}>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <AuthInput
                                    label="First Name"
                                    placeholder="John"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <AuthInput
                                    label="Last Name"
                                    placeholder="Doe"
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </View>
                        </View>

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

                        <AuthButton
                            title="Sign Up"
                            onPress={onSignUpPress}
                            isLoading={isLoading}
                            style={{ marginTop: 10 }}
                        />

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <AuthButton
                            title="Continue with Google"
                            onPress={onGoogleSignUpPress}
                            variant="google"
                            icon={<Ionicons name="logo-google" size={20} color={Colors.google} style={{ marginRight: 8 }} />}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Link href="/(auth)/sign-in" asChild>
                                <Text style={styles.linkText}>Sign In</Text>
                            </Link>
                        </View>
                    </View>
                ) : (
                    <View style={styles.form}>
                        <AuthInput
                            label="Verification Code"
                            placeholder="123456"
                            value={code}
                            onChangeText={setCode}
                            keyboardType="number-pad"
                        />

                        <AuthButton
                            title="Verify Email"
                            onPress={onPressVerify}
                            isLoading={isLoading}
                            style={{ marginTop: 10 }}
                        />
                    </View>
                )}
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
        marginTop: 40,
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
    row: {
        flexDirection: 'row',
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
});
