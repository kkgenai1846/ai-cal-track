import { groq } from "../config/AiModel";
import { UserData } from "./userService";

export interface FitnessPlan {
    dailyCalories: number;
    dailyProtein: number; // grams
    dailyCarbs: number; // grams
    dailyFat: number; // grams
    dailyWater: number; // liters
    aiAdvice: string;
}

export const aiService = {
    async generateFitnessPlan(userData: Partial<UserData>): Promise<FitnessPlan | null> {
        try {
            const prompt = `
        You are an expert nutritionist and fitness coach. Create a personalized daily nutrition plan for a user with the following details:
        
        - Gender: ${userData.gender}
        - Goal: ${userData.goal} (gain/lose/maintain weight)
        - Workout Frequency: ${userData.workoutFrequency}
        - Age: ${userData.birthday ? new Date().getFullYear() - new Date(userData.birthday).getFullYear() : 'Unknown'}
        - Height: ${userData.height} feet
        - Weight: ${userData.weight} kg

        Calculate the optimal daily calories, protein (g), carbs (g), fats (g), and water intake (liters).
        Also provide a short, motivating piece of advice (max 2 sentences).

        Return ONLY a valid JSON object with the following structure:
        {
          "dailyCalories": number,
          "dailyProtein": number,
          "dailyCarbs": number,
          "dailyFat": number,
          "dailyWater": number,
          "aiAdvice": "string"
        }
      `;

            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile", // Updated to supported model
                response_format: { type: "json_object" }, // helpful if supported, otherwise just parse string
            });

            const text = completion.choices[0]?.message?.content || "{}";
            console.log("AI Raw Response:", text);

            const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const plan: FitnessPlan = JSON.parse(jsonString);
            return plan;

        } catch (error: any) {
            console.error("AI Service Error Details:", JSON.stringify(error, null, 2));
            console.error("Original Error:", error);
            throw new Error(error.message || "Failed to generate plan securely.");
        }
    }
};
