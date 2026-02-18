import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
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
import { FeatureRequest, featureRequestService } from '../services/featureRequestService';

export default function FeatureRequestsScreen() {
    const { user } = useUser();
    const router = useRouter();
    const [features, setFeatures] = useState<FeatureRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // New Feature Form
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadFeatures();
    }, []);

    const loadFeatures = async () => {
        setIsLoading(true);
        const data = await featureRequestService.getFeatures();
        setFeatures(data);
        setIsLoading(false);
    };

    const handleUpvote = async (feature: FeatureRequest) => {
        if (!user) return;

        // Optimistic update
        const isUpvoting = !feature.upvotedBy.includes(user.id);
        const updatedFeatures = features.map(f => {
            if (f.id === feature.id) {
                return {
                    ...f,
                    upvotes: isUpvoting ? f.upvotes + 1 : f.upvotes - 1,
                    upvotedBy: isUpvoting
                        ? [...f.upvotedBy, user.id]
                        : f.upvotedBy.filter(id => id !== user.id)
                };
            }
            return f;
        });

        // Sort again to keep order correct
        updatedFeatures.sort((a, b) => b.upvotes - a.upvotes);
        setFeatures(updatedFeatures);

        await featureRequestService.toggleUpvote(feature.id, user.id, isUpvoting);
    };

    const handleSubmit = async () => {
        if (!newTitle.trim() || !newDescription.trim() || !user) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        setIsSubmitting(true);
        const success = await featureRequestService.addFeature({
            userId: user.id,
            userName: user.fullName || "Anonymous",
            title: newTitle.trim(),
            description: newDescription.trim(),
        });

        if (success) {
            setNewTitle('');
            setNewDescription('');
            setIsModalVisible(false);
            loadFeatures(); // Reload to see new feature
            Alert.alert("Success", "Feature request submitted!");
        } else {
            Alert.alert("Error", "Failed to submit request.");
        }
        setIsSubmitting(false);
    };

    const renderItem = ({ item }: { item: FeatureRequest }) => {
        const isUpvoted = user ? item.upvotedBy.includes(user.id) : false;

        return (
            <View style={styles.card}>
                <View style={styles.voteContainer}>
                    <TouchableOpacity
                        style={[styles.voteButton, isUpvoted && styles.voteButtonActive]}
                        onPress={() => handleUpvote(item)}
                    >
                        <Ionicons name="flame" size={20} color={isUpvoted ? "#FFD700" : Colors.textLight} />
                        <Text style={[styles.voteCount, isUpvoted && styles.voteCountActive]}>
                            {item.upvotes}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
                    <Text style={styles.cardAuthor}>by {item.userName}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Feature Requests</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.addButtonHeader}>
                    <Ionicons name="add" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={features}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No requests yet. Add one!</Text>
                        </View>
                    }
                />
            )}

            {/* Add Feature Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Request Feature</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Dark Mode"
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="What should we build?"
                            value={newDescription}
                            onChangeText={setNewDescription}
                            multiline
                        />

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit Request</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    addButtonHeader: {
        padding: 4,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    voteContainer: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    voteButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: Colors.surfaceHighlight,
        minWidth: 44,
    },
    voteButtonActive: {
        backgroundColor: Colors.primary + '20', // Light tint of primary
        borderColor: Colors.primary,
        borderWidth: 1,
    },
    voteCount: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.textSecondary,
        marginTop: 2,
    },
    voteCountActive: {
        color: Colors.primary,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    cardDescription: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 4,
        lineHeight: 18,
    },
    cardAuthor: {
        fontSize: 11,
        color: Colors.textLight,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 6,
    },
    input: {
        backgroundColor: Colors.inputBackground,
        padding: 12,
        borderRadius: 10,
        fontSize: 15,
        color: Colors.text,
        marginBottom: 14,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: Colors.primary,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    submitButtonText: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: '700',
    },
});
