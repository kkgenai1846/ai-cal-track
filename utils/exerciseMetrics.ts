import { UserData } from '../services/userService';

export type Intensity = 'Low' | 'Medium' | 'High';

const MET_VALUES: Record<string, Record<Intensity, number>> = {
    cardio: {
        Low: 6.0,    // Slow jog
        Medium: 10.0, // Running ~10km/h
        High: 13.5,   // Running ~14km/h+
    },
    weights: {
        Low: 3.5,    // Light lifting
        Medium: 6.0, // Vigorous lifting
        High: 8.0,   // Powerlifting/Explosive
    },
};

/**
 * Calculates calories burned using the MET formula:
 * Calories = MET * Weight(kg) * Duration(hours)
 */
export const calculateCaloriesBurned = (
    type: 'cardio' | 'weights',
    intensity: Intensity,
    durationMinutes: number,
    userData: UserData | null
): number => {
    const met = MET_VALUES[type]?.[intensity] || 5.0;
    const weight = userData?.weight || 70; // fallback to 70kg
    const durationHours = durationMinutes / 60;

    const calories = met * weight * durationHours;

    return Math.round(calories);
};
