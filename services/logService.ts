import { arrayUnion, doc, getDoc, increment, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ActivityLog {
    id: string;
    type: "meal" | "water" | "exercise";
    name: string;
    calories?: number;
    time: string;
    protein?: number;
    carbs?: number;
    fat?: number;
    waterAmount?: number;
    intensity?: string;
    duration?: number;
}

export interface DailyLog {
    date: string; // YYYY-MM-DD
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
    activities?: ActivityLog[];
}

export const logService = {
    async getDailyLog(uid: string, date: string): Promise<DailyLog | null> {
        try {
            const docRef = doc(db, "users", uid, "dailyLogs", date);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as DailyLog;
            } else {
                return null;
            }
        } catch (e) {
            console.error("Error getting daily log: ", e);
            return null;
        }
    },

    subscribeToDailyLog(uid: string, date: string, callback: (log: DailyLog | null) => void) {
        const docRef = doc(db, "users", uid, "dailyLogs", date);
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data() as DailyLog);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error("Error subscribing to daily log:", error);
            callback(null);
        });
    },

    async updateDailyLog(uid: string, date: string, data: Partial<DailyLog>, newActivity?: ActivityLog) {
        try {
            const docRef = doc(db, "users", uid, "dailyLogs", date);
            const docSnap = await getDoc(docRef);

            // Prepare update data with increment for numeric fields if they exist in data
            const updateData: any = {
                updatedAt: new Date()
            };

            if (data.calories !== undefined) updateData.calories = increment(data.calories);
            if (data.protein !== undefined) updateData.protein = increment(data.protein);
            if (data.carbs !== undefined) updateData.carbs = increment(data.carbs);
            if (data.fat !== undefined) updateData.fat = increment(data.fat);
            if (data.water !== undefined) updateData.water = increment(data.water);

            if (newActivity) {
                updateData.activities = arrayUnion(newActivity);
            }

            if (docSnap.exists()) {
                await updateDoc(docRef, updateData);
            } else {
                await setDoc(docRef, {
                    date,
                    calories: data.calories || 0,
                    protein: data.protein || 0,
                    carbs: data.carbs || 0,
                    fat: data.fat || 0,
                    water: data.water || 0,
                    activities: newActivity ? [newActivity] : [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            return true;
        } catch (e) {
            console.error("Error updating daily log: ", e);
            return false;
        }
    },

    async removeActivity(uid: string, date: string, activityId: string, amount: number, type: 'exercise' | 'food' | 'water') {
        try {
            const docRef = doc(db, "users", uid, "dailyLogs", date);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return false;

            const currentData = docSnap.data() as DailyLog;
            const updatedActivities = currentData.activities?.filter(a => a.id !== activityId) || [];

            const updateData: any = {
                activities: updatedActivities,
                updatedAt: new Date()
            };

            // Undo the impact on totals
            if (type === 'exercise') {
                updateData.calories = increment(amount);
            } else if (type === 'food') {
                updateData.calories = increment(-amount);
            } else if (type === 'water') {
                updateData.water = increment(-amount);
            }

            await updateDoc(docRef, updateData);
            return true;
        } catch (e) {
            console.error("Error removing activity: ", e);
            return false;
        }
    },

    async updateActivity(uid: string, date: string, activityId: string, updatedData: Partial<ActivityLog>) {
        try {
            const docRef = doc(db, "users", uid, "dailyLogs", date);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return false;

            const currentData = docSnap.data() as DailyLog;
            const activities = [...(currentData.activities || [])];
            const index = activities.findIndex(a => a.id === activityId);

            if (index === -1) return false;

            const oldActivity = activities[index];
            const newActivity = { ...oldActivity, ...updatedData };
            activities[index] = newActivity;

            const updateData: any = {
                activities: activities,
                updatedAt: new Date()
            };

            // Calculate deltas for totals
            if (oldActivity.type === 'water') {
                const delta = (newActivity.waterAmount || 0) - (oldActivity.waterAmount || 0);
                if (delta !== 0) updateData.water = increment(delta);
            } else if (oldActivity.type === 'exercise') {
                const delta = (newActivity.calories || 0) - (oldActivity.calories || 0);
                // Exercises are stored as positive in ActivityLog but subtracted from totals
                if (delta !== 0) updateData.calories = increment(-delta);
            } else if (oldActivity.type === 'meal') {
                const cDelta = (newActivity.calories || 0) - (oldActivity.calories || 0);
                const pDelta = (newActivity.protein || 0) - (oldActivity.protein || 0);
                const cbDelta = (newActivity.carbs || 0) - (oldActivity.carbs || 0);
                const fDelta = (newActivity.fat || 0) - (oldActivity.fat || 0);

                if (cDelta !== 0) updateData.calories = increment(cDelta);
                if (pDelta !== 0) updateData.protein = increment(pDelta);
                if (cbDelta !== 0) updateData.carbs = increment(cbDelta);
                if (fDelta !== 0) updateData.fat = increment(fDelta);
            }

            await updateDoc(docRef, updateData);
            return true;
        } catch (e) {
            console.error("Error updating activity: ", e);
            return false;
        }
    }
}
    ;
