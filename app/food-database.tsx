import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../constants/Colors';
import { fatSecretService, FoodSearchResult } from '../services/fatSecretService';

export default function FoodDatabaseScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [foods, setFoods] = useState<FoodSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    const searchFoods = useCallback(async (query: string) => {
        if (query.length < 3) {
            setFoods([]);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const results = await fatSecretService.searchFoods(query, 5);
            setFoods(results);
        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : 'Failed to search foods');
            setFoods([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);

        // Clear existing timeout
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Set new timeout for debounced search
        const timeout = setTimeout(() => {
            searchFoods(text);
        }, 500);

        setDebounceTimeout(timeout);
    };

    const handleAddFood = (food: FoodSearchResult) => {
        const nutrition = fatSecretService.parseNutrition(food.food_description);

        router.push({
            pathname: '/log-food',
            params: {
                name: food.food_name,
                servingSize: nutrition.servingSize,
                calories: nutrition.calories.toString(),
                protein: nutrition.protein.toString(),
                carbs: nutrition.carbs.toString(),
                fat: nutrition.fat.toString(),
            }
        });
    };

    const renderFoodItem = ({ item }: { item: FoodSearchResult }) => {
        const nutrition = fatSecretService.parseNutrition(item.food_description);

        return (
            <TouchableOpacity
                style={styles.foodCard}
                onPress={() => handleAddFood(item)}
                activeOpacity={0.7}
            >
                <View style={styles.foodInfo}>
                    <Text style={styles.foodName} numberOfLines={2}>
                        {item.food_name}
                    </Text>
                    {item.brand_name && (
                        <Text style={styles.brandName}>{item.brand_name}</Text>
                    )}
                    <Text style={styles.servingSize}>{nutrition.servingSize}</Text>
                    <Text style={styles.calories}>{nutrition.calories} cal</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddFood(item)}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Search Food</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search food database..."
                    placeholderTextColor={Colors.textLight}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearchChange('')}>
                        <Ionicons name="close-circle" size={20} color={Colors.textLight} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Search Results */}
            <View style={styles.content}>
                {loading && (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingText}>Searching...</Text>
                    </View>
                )}

                {!loading && error && (
                    <View style={styles.centerContainer}>
                        <Ionicons name="alert-circle" size={48} color={Colors.error} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {!loading && !error && searchQuery.length > 0 && searchQuery.length < 3 && (
                    <View style={styles.centerContainer}>
                        <Ionicons name="create" size={48} color={Colors.textLight} />
                        <Text style={styles.hintText}>Type at least 3 characters to search</Text>
                    </View>
                )}

                {!loading && !error && searchQuery.length >= 3 && foods.length === 0 && (
                    <View style={styles.centerContainer}>
                        <Ionicons name="search" size={48} color={Colors.textLight} />
                        <Text style={styles.emptyText}>No foods found</Text>
                        <Text style={styles.hintText}>Try a different search term</Text>
                    </View>
                )}

                {!loading && !error && foods.length > 0 && (
                    <FlatList
                        data={foods}
                        renderItem={renderFoodItem}
                        keyExtractor={(item) => item.food_id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {!loading && !error && searchQuery.length === 0 && (
                    <View style={styles.centerContainer}>
                        <Ionicons name="restaurant" size={64} color={Colors.textLight} />
                        <Text style={styles.welcomeText}>Search Food Database</Text>
                        <Text style={styles.hintText}>
                            Search for any food to see{'\n'}nutritional information
                        </Text>
                    </View>
                )}
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    content: {
        flex: 1,
    },
    listContainer: {
        padding: 16,
    },
    foodCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    foodInfo: {
        flex: 1,
        marginRight: 12,
    },
    foodName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    brandName: {
        fontSize: 13,
        color: Colors.textLight,
        marginBottom: 6,
        fontStyle: 'italic',
    },
    servingSize: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    calories: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.primary,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.error,
        textAlign: 'center',
    },
    welcomeText: {
        marginTop: 16,
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    hintText: {
        marginTop: 8,
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
    },
});
