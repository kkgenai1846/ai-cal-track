import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface AuthInputProps extends TextInputProps {
    label?: string;
    error?: string;
    isPassword?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
    label,
    error,
    isPassword = false,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                isFocused && styles.focusedInput,
                error ? styles.errorInput : null
            ]}>
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={Colors.inputPlaceholder}
                    secureTextEntry={isPassword && !showPassword}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.textLight} />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        width: '100%',
    },
    label: {
        color: Colors.text,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
        height: 50,
        paddingHorizontal: 15,
    },
    focusedInput: {
        borderColor: Colors.primary,
        backgroundColor: Colors.white,
    },
    errorInput: {
        borderColor: Colors.error,
    },
    input: {
        flex: 1,
        height: '100%',
        color: Colors.text,
        fontSize: 16,
    },
    icon: {
        padding: 5,
    },
    errorText: {
        color: Colors.error,
        fontSize: 12,
        marginTop: 5,
    },
});
