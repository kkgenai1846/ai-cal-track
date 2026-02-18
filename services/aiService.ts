import { doc, getDoc, setDoc } from 'firebase/firestore';
import Groq from 'groq-sdk';
import { db } from '../config/firebase';
import { DailyLog } from './logService';

const groq = new Groq({
    apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true, // Only for local dev/demo
});

export interface WeeklyInsight {
    summary: string;
    highlights: string[];
    bento: {
        insightTag: string; // e.g. "On Track", "Needs Focus"
        hydrationStatus: string; // e.g. "Great!", "Low"
        bestWorkout: string; // e.g. "5km Run"
        nutritionGrade: string; // "A", "B", "C"
    };
    aiProgress: {
        healthScore: number;
        analysis: string;
        tags: string[];
        weeklyWin: {
            title: string;
            description: string;
        };
    };
    stats: {
        date: string;
        foodCals: number;
        foodSummary: string;
        waterVol: string;
        exerciseCals: number;
        exerciseSummary: string;
        dailySummary: string;
        dailySuggestion: string;
    }[];
}

export const aiService = {
    async generateFitnessPlan(userData: any): Promise<any> {
        try {
            console.log("Generating fitness plan for:", userData);

            const prompt = `
            You are an expert nutritionist and fitness coach.
            Create a personalized daily nutrition and hydration plan for this user:
            
            Profile:
            - Age: ${userData.age}
            - Weight: ${userData.weight}kg
            - Height: ${userData.height}cm
            - Gender: ${userData.gender}
            - Activity Level: ${userData.activityLevel}
            - Goal: ${userData.goal}

            Return a valid JSON object with these exact keys (numbers only):
            {
                "dailyCalories": number,
                "dailyProtein": number (grams),
                "dailyCarbs": number (grams),
                "dailyFat": number (grams),
                "dailyWater": number (liters, e.g. 2.5)
            }
            Calculations should be based on Mifflin-St Jeor equation and standard macro splits suitable for their goal.
            `;

            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: "You are a helpful fitness AI that outputs strict JSON." },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('No plan generated');

            const plan = JSON.parse(content);
            console.log("Generated Plan:", plan);

            return plan;

        } catch (error) {
            console.error('Error generating fitness plan:', error);
            // Fallback plan if AI fails
            return {
                dailyCalories: 2000,
                dailyProtein: 150,
                dailyCarbs: 200,
                dailyFat: 65,
                dailyWater: 3
            };
        }
    },

    async generateWeeklyInsight(userId: string, logs: DailyLog[]): Promise<WeeklyInsight> {
        try {
            // 1. Check for cached insight
            const insightRef = doc(db, "users", userId, "insights", "latestWeekly");
            const insightSnap = await getDoc(insightRef);

            if (insightSnap.exists()) {
                const data = insightSnap.data();
                const generatedAt = new Date(data.generatedAt);
                const now = new Date();
                const diffHours = (now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60);

                // Check if strict 6 hours AND if the data structure is up to date (has weeklyWin)
                if (diffHours < 6 && data.insight?.aiProgress?.weeklyWin) {
                    console.log("Returning cached AI insight");
                    return data.insight as WeeklyInsight;
                }
            }

            // 2. Generate new insight if no cache or expired
            console.log("Generating new AI insight...");

            // Prepare data for AI with calculated totals
            const logsData = logs.map(log => {
                const activities = log.activities || [];
                const foodCals = activities
                    .filter(a => a.type === 'meal' || a.type === 'food')
                    .reduce((sum, a) => sum + (a.calories || 0), 0);
                const exerciseCals = activities
                    .filter(a => a.type === 'exercise')
                    .reduce((sum, a) => sum + (a.calories || 0), 0);

                return {
                    date: log.date,
                    foodCals: foodCals || log.calories, // Fallback to total if detailed not avail
                    protein: log.protein,
                    water: log.water,
                    exerciseCals,
                    activityNames: activities.map(a => a.name).join(', ') || 'None'
                };
            });

            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert fitness coach.
                        Analyze the user's daily data and provided a structured JSON response.
                        
                        For each day, provide:
                        - foodSummary: Very short (max 4 words) summary of food (e.g. "Oats, Chicken Salad").
                        - foodCals: The calorie intake.
                        - waterVol: Water formatted (e.g. "2.5L" or "500ml").
                        - exerciseSummary: Very short (max 3 words) exercise (e.g. "Running 5km") or "Rest".
                        - exerciseCals: Calories burned.
                        - dailySummary: Brief summary (max 6 words).
                        - dailySuggestion: Short tip (max 6 words).

                        Also include "bento" grid summaries:
                        - insightTag: 2-3 word overall status (e.g. "Crushing It", "Needs Consistency").
                        - hydrationStatus: 1-2 word water status (e.g. "Well Hydrated", "Drink More").
                        - bestWorkout: The single best workout name of the week (max 3 words).
                        - nutritionGrade: A single letter grade (A, B, C, D) based on food quality/macros.

                        Also include "aiProgress" for the new dashboard section:
                        - healthScore: 0-100 score based on consistency and macros.
                        - analysis: 2-3 sentences motivational analysis of weight/calories.
                        - tags: Exactly 3 short, DATA-DRIVEN tags based on the week's logs (e.g., "High Protein", "Hydrated", "Deficit Hit", "7-Day Streak", "Beast Mode"). AVOID generic terms like "Newbie Gains" or "Foodie".
                        - weeklyWin: { 
                            "title": "This Week's Win", 
                            "description": "A specific, data-driven sentence about their consistency or best stat. Example: 'You tracked your meals for 5 days straight and hit your protein goal 3 times.' or 'Your consistency is improving with 4 logged workouts this week.'" 
                        }.

                        Return ONLY valid JSON:
                        {
                            "summary": "Monday: Good run. Tuesday: High protein...",
                            "highlights": ["..."],
                            "bento": {
                                "insightTag": "On Track",
                                "hydrationStatus": "Good",
                                "bestWorkout": "5km Run",
                                "nutritionGrade": "B"
                            },
                            "aiProgress": {
                                "healthScore": 85,
                                "analysis": "You've maintained a steady deficit...",
                                "tags": ["Protein King", "Hydrator", "Steady"],
                                "weeklyWin": {
                                    "title": "Consistency Champ",
                                    "description": "You logged for 5 days straight!"
                                }
                            },
                            "stats": [
                                { 
                                    "date": "YYYY-MM-DD", 
                                    "foodCals": 2000,
                                    "foodSummary": "Pizza, Salad",
                                    "waterVol": "2L",
                                    "exerciseCals": 300,
                                    "exerciseSummary": "Running",
                                    "dailySummary": "Great balance",
                                    "dailySuggestion": "Keep hydrating"
                                }
                            ]
                        }`
                    },
                    {
                        role: 'user',
                        content: JSON.stringify(logsData)
                    }
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('No analysis generated');

            const parsedInsight = JSON.parse(content);

            // 3. Save to cache
            await setDoc(insightRef, {
                insight: parsedInsight,
                generatedAt: new Date().toISOString()
            });

            return parsedInsight;
        } catch (error) {
            console.error('Error generating insight:', error);
            throw error;
        }
    }
};
