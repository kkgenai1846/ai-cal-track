import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

type EditGoalsModalProps = {
    visible: boolean;
    onClose: () => void;
    onSave: (goals: {
        dailyCalories: number;
        dailyProtein: number;
        dailyCarbs: number;
        dailyFat: number;
        dailyWater: number;
    }) => void;
    initialGoals: {
        dailyCalories: number;
        dailyProtein: number;
        dailyCarbs: number;
        dailyFat: number;
        dailyWater: number;
    };
};

export default function EditGoalsModal({
    visible,
    onClose,
    onSave,
    initialGoals,
}: EditGoalsModalProps) {
    const [calories, setCalories] = useState((initialGoals.dailyCalories || 0).toString());
    const [protein, setProtein] = useState((initialGoals.dailyProtein || 0).toString());
    const [carbs, setCarbs] = useState((initialGoals.dailyCarbs || 0).toString());
    const [fat, setFat] = useState((initialGoals.dailyFat || 0).toString());
    const [water, setWater] = useState((initialGoals.dailyWater || 0).toString());

    useEffect(() => {
        if (visible) {
            setCalories((initialGoals.dailyCalories || 0).toString());
            setProtein((initialGoals.dailyProtein || 0).toString());
            setCarbs((initialGoals.dailyCarbs || 0).toString());
            setFat((initialGoals.dailyFat || 0).toString());
            setWater((initialGoals.dailyWater || 0).toString());
        }
    }, [visible, initialGoals]);

    const handleSave = () => {
        onSave({
            dailyCalories: Number(calories) || 0,
            dailyProtein: Number(protein) || 0,
            dailyCarbs: Number(carbs) || 0,
            dailyFat: Number(fat) || 0,
            dailyWater: Number(water) || 0,
        });
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={styles.container}
                        >
                            <View style={styles.modalContent}>
                                <View style={styles.header}>
                                    <Text style={styles.title}>Edit Daily Goals</Text>
                                    <TouchableOpacity onPress={onClose}>
                                        <Ionicons name="close" size={24} color={Colors.text} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <View style={styles.labelContainer}>
                                        <MaterialCommunityIcons name="fire" size={20} color={Colors.primary} />
                                        <Text style={styles.label}>Calories</Text>
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        value={calories}
                                        onChangeText={setCalories}
                                        keyboardType="numeric"
                                        placeholder="2000"
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <View style={styles.labelContainer}>
                                            <MaterialCommunityIcons name="bread-slice" size={18} color="#1976D2" />
                                            <Text style={styles.label}>Carbs (g)</Text>
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            value={carbs}
                                            onChangeText={setCarbs}
                                            keyboardType="numeric"
                                            placeholder="275"
                                        />
                                    </View>
                                    <View style={{ width: 16 }} />
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <View style={styles.labelContainer}>
                                            <MaterialCommunityIcons name="food-steak" size={18} color="#D32F2F" />
                                            <Text style={styles.label}>Protein (g)</Text>
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            value={protein}
                                            onChangeText={setProtein}
                                            keyboardType="numeric"
                                            placeholder="140"
                                        />
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <View style={styles.labelContainer}>
                                            <MaterialCommunityIcons name="oil" size={18} color="#F57C00" />
                                            <Text style={styles.label}>Fat (g)</Text>
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            value={fat}
                                            onChangeText={setFat}
                                            keyboardType="numeric"
                                            placeholder="65"
                                        />
                                    </View>
                                    <View style={{ width: 16 }} />
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <View style={styles.labelContainer}>
                                            <Ionicons name="water" size={18} color="#2196F3" />
                                            <Text style={styles.label}>Water (L)</Text>
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            value={water}
                                            onChangeText={setWater}
                                            keyboardType="numeric"
                                            placeholder="3"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    container: {
        width: "100%",
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        gap: 20,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.text,
    },
    inputGroup: {
        gap: 8,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.textSecondary,
    },
    input: {
        backgroundColor: Colors.inputBackground,
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        color: Colors.text,
    },
    row: {
        flexDirection: 'row',
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 10,
    },
    saveButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
