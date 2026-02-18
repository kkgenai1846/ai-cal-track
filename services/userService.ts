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

    // Onboarding Data
    gender?: 'male' | 'female' | 'other';
    goal?: 'gain' | 'lose' | 'maintain';
    workoutFrequency?: string;
    birthday?: Date;
    height?: number; // in feet
    weight?: number; // in kg

    // AI Fitness Plan
    dailyCalories?: number;
    dailyProtein?: number;
    dailyCarbs?: number;
    dailyFat?: number;
    dailyWater?: number; // in liters
    aiAdvice?: string;
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
                const data = docSnap.data();
                return {
                    ...data,
                    // Convert Firestore Timestamps to Dates if needed
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                    birthday: data.birthday?.toDate?.() || data.birthday,
                } as UserData;
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
            const docRef = doc(db, "users", uid);
            await updateDoc(docRef, {
                onboardingCompleted: true, // Default to true, but allow override
                ...data,
                updatedAt: new Date()
            });
            console.log("Onboarding data updated successfully!");
            return true;
        } catch (e) {
            console.error("Error updating onboarding data: ", e);
            return false;
        }
    },

    async syncUser(user: any) {
        try {
            const uid = user.id;
            const existingUser = await this.getUser(uid);

            if (existingUser) {
                return existingUser;
            }

            console.log("User not found in Firestore, syncing...");
            const email = user.emailAddresses[0]?.emailAddress || "";
            const firstName = user.firstName || "";
            const lastName = user.lastName || "";

            const newUser: Omit<UserData, 'createdAt' | 'updatedAt' | 'onboardingCompleted'> = {
                email,
                firstName,
                lastName,
                photoUrl: user.imageUrl,
            };

            await this.createUser(uid, newUser);

            // Return the newly created user with default fields
            return {
                ...newUser,
                createdAt: new Date(),
                updatedAt: new Date(),
                onboardingCompleted: false
            } as UserData;

        } catch (e) {
            console.error("Error syncing user: ", e);
            return null;
        }
    }
};
