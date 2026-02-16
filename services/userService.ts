import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserData {
    email: string;
    firstName: string;
    lastName: string;
    photoUrl?: string; // from Google or Clerk
    createdAt: Date;
    updatedAt: Date;
    onboardingCompleted: boolean;
    caloriesGoal?: number; // Future feature
}

export const userService = {
    async createUser(uid: string, data: Omit<UserData, 'createdAt' | 'updatedAt' | 'onboardingCompleted'>) {
        try {
            await setDoc(doc(db, "users", uid), {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
                onboardingCompleted: false,
            });
            return true;
        } catch (e) {
            console.error("Error creating user: ", e);
            return false;
        }
    },

    async getUser(uid: string) {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as UserData;
            } else {
                return null;
            }
        } catch (e) {
            console.error("Error getting user: ", e);
            return null;
        }
    },

    async updateUser(uid: string, data: Partial<UserData>) {
        try {
            const docRef = doc(db, "users", uid);
            await updateDoc(docRef, {
                ...data,
                updatedAt: new Date()
            });
            return true;
        } catch (e) {
            console.error("Error updating user: ", e);
            return false;
        }
    }
};
