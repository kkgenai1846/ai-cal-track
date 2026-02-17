import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface ProgressBarProps {
    progress: number; // 0 to 1
    style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, style }) => {
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: progress,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const widthInterpolated = animatedWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={[styles.container, style]}>
            <Animated.View
                style={[
                    styles.fill,
                    {
                        width: widthInterpolated,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: 4,
        overflow: 'hidden',
        width: '100%',
    },
    fill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 4,
    },
});
