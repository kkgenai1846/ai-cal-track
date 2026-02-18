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

    // Physical Stats
    age?: number;
    birthday?: Date;
    weight?: number; // in kg
    height?: number; // in cm
    gender?: 'male' | 'female' | 'other';
    activityLevel?: string;
    goal?: string;
    workoutFrequency?: string;

    // Daily Goals (Calculated by AI)
    caloriesGoal?: number; // Legacy or duplicate? Keeping for safety
    dailyCalories?: number; // Main one used in Home
    dailyProtein?: number;
    dailyCarbs?: number;
    dailyFat?: number;
    dailyWater?: number;

    // Preferences
    theme?: 'system' | 'light' | 'dark';
    notificationsEnabled?: boolean;
}

export const userService = {
    async createUser(uid: string, data: Omit<UserData, 'createdAt' | 'updatedAt' | 'onboardingCompleted'>) {
        try {
            console.log("Creating user in Firestore:", uid, data);
            await setDoc(doc(db, "users", uid), {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
                onboardingCompleted: false,
            });
            console.log("User created successfully!");
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
    },

    async updateOnboardingData(uid: string, data: Partial<UserData>) {
        try {
            console.log("Updating onboarding data for:", uid, data);
            // Re-use updateUser which handles the merge and updatedAt
            return await this.updateUser(uid, data);
        } catch (e) {
            console.error("Error updating onboarding data: ", e);
            return false;
        }
    },

    async syncUser(user: any) {
        try {
            const uid = user.id;
            const existingUser = await this.getUser(uid);

            if (!existingUser) {
                console.log("User not found in Firestore, syncing...");
                const email = user.emailAddresses[0]?.emailAddress || "";
                const firstName = user.firstName || "";
                const lastName = user.lastName || "";

                await this.createUser(uid, {
                    email,
                    firstName,
                    lastName,
                    photoUrl: user.imageUrl,
                });
                return true;
            }
            return false; // User already exists
        } catch (e) {
            console.error("Error syncing user: ", e);
            return false;
        }
    }
};
