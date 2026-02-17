import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type QuickAddOption = {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
    iconLibrary: "Ionicons" | "MaterialCommunityIcons";
    isPremium?: boolean;
    onPress: () => void;
};

type QuickAddModalProps = {
    visible: boolean;
    onClose: () => void;
    onLogExercise: () => void;
    onAddWater: () => void;
    onFoodDatabase: () => void;
    onScanFood: () => void;
};

export function QuickAddModal({
    visible,
    onClose,
    onLogExercise,
    onAddWater,
    onFoodDatabase,
    onScanFood,
}: QuickAddModalProps) {
    const options: QuickAddOption[] = [
        {
            id: "exercise",
            title: "Log Exercise",
            icon: "barbell",
            iconLibrary: "Ionicons",
            onPress: onLogExercise,
        },
        {
            id: "water",
            title: "Add Drink Water",
            icon: "water",
            iconLibrary: "MaterialCommunityIcons",
            onPress: onAddWater,
        },
        {
            id: "food",
            title: "Food Database",
            icon: "restaurant",
            iconLibrary: "Ionicons",
            onPress: onFoodDatabase,
        },
        {
            id: "scan",
            title: "Scan Food",
            icon: "scan",
            iconLibrary: "Ionicons",
            onPress: onScanFood,
        },
    ];

    const renderOption = (option: QuickAddOption) => {
        const IconComponent =
            option.iconLibrary === "Ionicons"
                ? Ionicons
                : MaterialCommunityIcons;

        return (
            <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={option.onPress}
                activeOpacity={0.7}
            >
                <View style={styles.iconContainer}>
                    <IconComponent
                        name={option.icon as any}
                        size={24}
                        color={Colors.primary}
                    />
                    {option.isPremium && (
                        <View style={styles.premiumBadge}>
                            <Ionicons name="star" size={8} color="#FFD700" />
                        </View>
                    )}
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                {option.isPremium && (
                    <Text style={styles.premiumText}>Premium</Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Quick Add</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons
                                    name="close"
                                    size={20}
                                    color={Colors.text}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.optionsGrid}>
                            {options.map(renderOption)}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
        alignItems: "stretch",
    },
    modalContainer: {
        backgroundColor: "transparent",
        marginBottom: 70,
        paddingHorizontal: 16,
    },
    modalContent: {
        padding: 0,
        backgroundColor: "transparent",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        backgroundColor: "white",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    closeButton: {
        padding: 2,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.text,
    },
    optionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 8,
    },
    optionCard: {
        width: "48.5%",
        backgroundColor: "white",
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 0,
        minHeight: 110,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        position: "relative",
    },
    premiumBadge: {
        position: "absolute",
        top: -3,
        right: -3,
        backgroundColor: "#FFF",
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "#FFD700",
    },
    optionTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.text,
        textAlign: "center",
        marginBottom: 2,
    },
    premiumText: {
        fontSize: 10,
        fontWeight: "500",
        color: "#FFD700",
    },
});
