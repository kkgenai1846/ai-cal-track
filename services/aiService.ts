import Groq from 'groq-sdk';
import { DailyLog } from './logService';

const groq = new Groq({
    apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true, // Only for local dev/demo
});

export interface WeeklyInsight {
    summary: string;
    highlights: string[];
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
    async generateWeeklyInsight(logs: DailyLog[]): Promise<WeeklyInsight> {
        try {
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

                        Return ONLY valid JSON:
                        {
                            "summary": "Monday: Good run. Tuesday: High protein...",
                            "highlights": ["..."],
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

            return JSON.parse(content);
        } catch (error) {
            console.error('Error generating insight:', error);
            throw error;
        }
    }
};
