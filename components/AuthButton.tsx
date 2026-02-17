import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface AuthButtonProps {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'google';
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
    title,
    onPress,
    isLoading = false,
    variant = 'primary',
    style,
    textStyle,
    icon
}) => {
    const isPrimary = variant === 'primary';
    const isGoogle = variant === 'google';

    const content = (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={isLoading}
            style={[
                styles.container,
                isGoogle && styles.googleContainer,
                !isPrimary && !isGoogle && styles.secondaryContainer,
                style,
            ]}
        >
            {isLoading ? (
                <ActivityIndicator color={isPrimary ? '#fff' : '#000'} />
            ) : (
                <>
                    {icon && <>{icon}</>}
                    <Text style={[
                        styles.text,
                        isGoogle && styles.googleText,
                        !isPrimary && !isGoogle && styles.secondaryText,
                        textStyle
                    ]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );

    if (isPrimary) {
        return (
            <LinearGradient
                colors={['#6a11cb', '#2575fc']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gradient, style]}
            >
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onPress}
                    disabled={isLoading}
                    style={styles.gradientButton}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.text}>{title}</Text>
                    )}
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    gradient: {
        borderRadius: 25,
        width: '100%',
        height: 50,
    },
    gradientButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    googleContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        marginTop: 10,
    },
    secondaryContainer: {
        backgroundColor: 'transparent',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    googleText: {
        color: '#333',
    },
    secondaryText: {
        color: '#6a11cb',
    },
});
