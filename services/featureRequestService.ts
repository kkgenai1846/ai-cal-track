import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDocs,
    increment,
    orderBy,
    query,
    updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface FeatureRequest {
    id: string;
    userId: string;
    userName: string;
    title: string;
    description: string;
    upvotes: number;
    upvotedBy: string[];
    createdAt: number;
}

const COLLECTION_NAME = 'feature_requests';

export const featureRequestService = {
    async addFeature(feature: Omit<FeatureRequest, 'id' | 'upvotes' | 'upvotedBy' | 'createdAt'>) {
        try {
            await addDoc(collection(db, COLLECTION_NAME), {
                ...feature,
                upvotes: 0,
                upvotedBy: [],
                createdAt: Date.now(),
            });
            return true;
        } catch (error) {
            console.error("Error adding feature request:", error);
            return false;
        }
    },

    async getFeatures(): Promise<FeatureRequest[]> {
        try {
            // Remove secondary orderBy to avoid needing a composite index
            const q = query(collection(db, COLLECTION_NAME), orderBy('upvotes', 'desc'));
            const querySnapshot = await getDocs(q);

            const results = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as FeatureRequest));

            // Client-side secondary sort by createdAt
            return results.sort((a, b) => {
                if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
                return b.createdAt - a.createdAt;
            });
        } catch (error) {
            console.error("Error fetching feature requests:", error);
            return [];
        }
    },

    async toggleUpvote(featureId: string, userId: string, isUpvoting: boolean) {
        try {
            const featureRef = doc(db, COLLECTION_NAME, featureId);
            await updateDoc(featureRef, {
                upvotes: increment(isUpvoting ? 1 : -1),
                upvotedBy: isUpvoting ? arrayUnion(userId) : arrayRemove(userId)
            });
            return true;
        } catch (error) {
            console.error("Error toggling upvote:", error);
            return false;
        }
    }
};
