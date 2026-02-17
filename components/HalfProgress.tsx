import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

type Props = {
    progress: number;    // 0 → 1
    size?: number;
    strokeWidth?: number;
    segments?: number;
    gapAngle?: number;
    value?: number;
    label?: string;
};

export function SegmentedHalfCircleProgress3D({
    progress,
    size = 60,
    strokeWidth = 28,
    segments = 15,
    gapAngle = 25,
    value,
    label,
}: Props) {
    const clamped = Math.max(0, Math.min(1, progress));

    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;

    const totalAngle = 180;
    const totalGap = gapAngle * (segments - 1);

    // ⬇ slightly reduce angle to avoid edge overlap
    const segmentAngle = (totalAngle - totalGap) / segments - 0.5;

    const activeSegments = Math.round(clamped * segments);

    const polarToCartesian = (angle: number) => {
        const rad = (Math.PI / 180) * angle;
        return {
            x: cx + radius * Math.cos(rad),
            y: cy - radius * Math.sin(rad),
        };
    };

    const createArc = (startAngle: number, endAngle: number) => {
        const start = polarToCartesian(startAngle);
        const end = polarToCartesian(endAngle);

        return `
  M ${start.x} ${start.y}
  A ${radius} ${radius} 0 0 0 ${end.x} ${end.y}
        `;
    };

    let currentAngle = 180;

    return (
        <View style={{
            width: size,
            height: (size / 2) + 30, // Extra space at bottom for text
            alignItems: 'center',
            justifyContent: 'flex-start', // SVG at top
        }}>
            <Svg width={size} height={size / 2} style={{ position: 'absolute', top: 0 }}>
                {Array.from({ length: segments }).map((_, i) => {
                    const start = currentAngle;
                    const end = currentAngle - segmentAngle;
                    currentAngle = end - gapAngle;

                    const isActive = i < activeSegments;

                    return (
                        <Path
                            key={i}
                            d={createArc(start, end)}
                            stroke={isActive ? Colors.primary :
                                "#E5E7EB"}
                            strokeWidth={strokeWidth}
                            fill="none"

                            strokeLinecap="butt"    // ✅ CRITICAL
                        />
                    );
                })}
            </Svg>
            <View style={styles.textOverlay}>
                <Text style={styles.icon}>🔥</Text>
                <Text style={styles.mainText}>{value}</Text>
                <Text style={styles.subText}>{label}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    textOverlay: {
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 0,
    },
    icon: {
        fontSize: 24,
        marginBottom: -5,
    },
    mainText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#000',
        lineHeight: 36,
    },
    subText: {
        fontSize: 14,
        color: '#666',
        marginTop: -2,
    },
});