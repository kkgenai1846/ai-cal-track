import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { ActivityLog, logService } from '../services/logService';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

export default function LogFoodScreen() {
    const { user } = useUser();
    const params = useLocalSearchParams();

    // Parse food data from route params
    const foodName = (params.name as string) || '';
    const initialServingSize = (params.servingSize as string) || '1 serving';
    const baseCalories = parseFloat((params.calories as string) || '0');
    const baseProtein = parseFloat((params.protein as string) || '0');
    const baseCarbs = parseFloat((params.carbs as string) || '0');
    const baseFat = parseFloat((params.fat as string) || '0');

    // Extract initial quantity from serving size (e.g., "2" from "2 cups")
    const extractQuantity = (servingText: string): number => {
        const match = servingText.match(/^(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : 1;
    };

    const initialQuantity = extractQuantity(initialServingSize);

    // Editable state
    const [servingQuantity, setServingQuantity] = useState(initialQuantity);
    const [servingSize, setServingSize] = useState(initialServingSize);

    // Calculated nutrition values based on serving quantity
    const calories = (baseCalories * servingQuantity).toFixed(0);
    const protein = (baseProtein * servingQuantity).toFixed(1);
    const carbs = (baseCarbs * servingQuantity).toFixed(1);
    const fat = (baseFat * servingQuantity).toFixed(1);

    // Update serving size text when quantity changes
    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity < 0.1) return; // Prevent zero or negative

        setServingQuantity(newQuantity);

        // Update the serving text to reflect new quantity
        const baseServing = initialServingSize.replace(/^\d+\.?\d*\s*/, '');
        setServingSize(`${newQuantity} ${baseServing}`);
    };

    const handleLogFood = async () => {
        if (!user) {
            Alert.alert("Error", "Please log in to save food intake.");
            return;
        }

        const caloriesNum = parseFloat(calories) || 0;
        const proteinNum = parseFloat(protein) || 0;
        const carbsNum = parseFloat(carbs) || 0;
        const fatNum = parseFloat(fat) || 0;

        if (caloriesNum === 0) {
            Alert.alert("Invalid Data", "Please enter valid serving amount.");
            return;
        }

        const currentTime = new Date().toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
        });

        const newActivity: ActivityLog = {
            id: Date.now().toString(),
            type: "food",
            name: foodName,
            calories: caloriesNum,
            protein: proteinNum,
            carbs: carbsNum,
            fat: fatNum,
            time: currentTime,
            servingSize: servingSize,
        };

        await logService.updateDailyLog(
            user.id,
            formatDate(new Date()),
            {
                calories: caloriesNum,
                protein: proteinNum,
                carbs: carbsNum,
                fat: fatNum,
            },
            newActivity
        );

        Alert.alert("Success", `Logged ${foodName}!`, [
            {
                text: "OK",
                onPress: () => router.push('/(tabs)/home')
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Log Food</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                {/* Food Name */}
                <Text style={styles.foodName}>{foodName}</Text>

                {/* Serving Size with Quantity Controls */}
                <View style={styles.servingCard}>
                    <View style={styles.servingHeader}>
                        <Ionicons name="restaurant-outline" size={18} color={Colors.textSecondary} />
                        <Text style={styles.servingLabel}>Serving Size</Text>
                    </View>

                    <View style={styles.servingControls}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(Math.max(0.5, servingQuantity - 0.5))}
                        >
                            <Ionicons name="remove" size={20} color={Colors.primary} />
                        </TouchableOpacity>

                        <View style={styles.servingInfo}>
                            <TextInput
                                style={styles.quantityInput}
                                value={servingQuantity.toString()}
                                onChangeText={(text) => {
                                    const num = parseFloat(text) || 1;
                                    handleQuantityChange(num);
                                }}
                                keyboardType="decimal-pad"
                            />
                            <Text style={styles.servingText}>{servingSize.replace(/^\d+\.?\d*\s*/, '')}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(servingQuantity + 0.5)}
                        >
                            <Ionicons name="add" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Nutrition Grid */}
                <View style={styles.nutritionGrid}>
                    {/* Calories - Full Width */}
                    <View style={[styles.nutritionCard, styles.caloriesCard]}>
                        <View style={styles.nutritionHeader}>
                            <View style={[styles.iconCircle, { backgroundColor: '#FFE5E5' }]}>
                                <Ionicons name="flame" size={20} color="#FF6B6B" />
                            </View>
                            <Text style={styles.nutritionLabel}>Calories</Text>
                        </View>
                        <View style={styles.nutritionInputRow}>
                            <Text style={styles.nutritionValue}>{calories}</Text>
                            <Text style={styles.nutritionUnit}>kcal</Text>
                        </View>
                    </View>

                    {/* Macros Row */}
                    <View style={styles.macrosRow}>
                        {/* Protein */}
                        <View style={[styles.nutritionCard, styles.macroCard]}>
                            <View style={styles.nutritionHeader}>
                                <View style={[styles.iconCircle, { backgroundColor: '#E0F7F4' }]}>
                                    <Ionicons name="fitness" size={18} color="#4ECDC4" />
                                </View>
                                <Text style={styles.macroLabel}>Protein</Text>
                            </View>
                            <View style={styles.nutritionInputRow}>
                                <Text style={styles.macroValue}>{protein}</Text>
                                <Text style={styles.macroUnit}>g</Text>
                            </View>
                        </View>

                        {/* Carbs */}
                        <View style={[styles.nutritionCard, styles.macroCard]}>
                            <View style={styles.nutritionHeader}>
                                <View style={[styles.iconCircle, { backgroundColor: '#FFF8E1' }]}>
                                    <Ionicons name="nutrition" size={18} color="#FFD93D" />
                                </View>
                                <Text style={styles.macroLabel}>Carbs</Text>
                            </View>
                            <View style={styles.nutritionInputRow}>
                                <Text style={styles.macroValue}>{carbs}</Text>
                                <Text style={styles.macroUnit}>g</Text>
                            </View>
                        </View>

                        {/* Fat */}
                        <View style={[styles.nutritionCard, styles.macroCard]}>
                            <View style={styles.nutritionHeader}>
                                <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                                    <Ionicons name="water" size={18} color="#95E1D3" />
                                </View>
                                <Text style={styles.macroLabel}>Fat</Text>
                            </View>
                            <View style={styles.nutritionInputRow}>
                                <Text style={styles.macroValue}>{fat}</Text>
                                <Text style={styles.macroUnit}>g</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Log Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.logButton} onPress={handleLogFood}>
                    <Text style={styles.logButtonText}>Log Food</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: 'white',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    placeholder: {
        width: 32,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    foodName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 20,
    },
    servingCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    servingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    servingLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginLeft: 6,
        fontWeight: '500',
    },
    servingInput: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
        padding: 0,
    },
    servingControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    servingInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    quantityInput: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        minWidth: 40,
        textAlign: 'center',
    },
    servingText: {
        fontSize: 15,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    nutritionGrid: {
        gap: 10,
    },
    nutritionCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    caloriesCard: {
        marginBottom: 0,
    },
    nutritionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nutritionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginLeft: 8,
    },
    nutritionInputRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    nutritionValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
        flex: 1,
    },
    nutritionUnit: {
        fontSize: 16,
        color: Colors.textLight,
        marginLeft: 8,
    },
    macrosRow: {
        flexDirection: 'row',
        gap: 12,
    },
    macroCard: {
        flex: 1,
    },
    macroLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginLeft: 6,
    },
    macroValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        flex: 1,
    },
    macroUnit: {
        fontSize: 14,
        color: Colors.textLight,
        marginLeft: 4,
    },
    bottomContainer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    logButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    logButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});
