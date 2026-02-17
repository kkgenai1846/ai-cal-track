import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

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
                    placeholderTextColor="#999"
                    secureTextEntry={isPassword && !showPassword}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
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
        color: '#333',
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
        height: 50,
        paddingHorizontal: 15,
    },
    focusedInput: {
        borderColor: '#6a11cb',
        backgroundColor: '#fff',
    },
    errorInput: {
        borderColor: '#ff4d4f',
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#333',
        fontSize: 16,
    },
    icon: {
        padding: 5,
    },
    errorText: {
        color: '#ff4d4f',
        fontSize: 12,
        marginTop: 5,
    },
});
