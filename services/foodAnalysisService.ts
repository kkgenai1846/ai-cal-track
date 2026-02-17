import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
});

export interface FoodAnalysisResult {
    dishName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: string;
}

export async function analyzeFoodImage(imageUri: string): Promise<FoodAnalysisResult> {
    try {
        // Convert image to base64
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Remove data:image/...;base64, prefix
                const base64Data = base64String.split(',')[1];
                resolve(base64Data);
            };
            reader.readAsDataURL(blob);
        });

        // Call Groq API with vision model
        const completion = await groq.chat.completions.create({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Analyze this food image deeply and carefully. Identify all food items visible in the image, their approximate portions, and provide detailed nutrition information.

Please analyze:
- What food/dish is this?
- Approximate portion size shown
- Estimated nutritional values per serving

Return ONLY valid JSON with no additional text, markdown formatting, or code blocks. The JSON must have this EXACT structure:
{
  "dishName": "name of the food/dish",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "servingSize": "serving size description (e.g., '1 plate', '200g', '1 cup')"
}

Be as accurate as possible with your nutritional estimates based on the visual portion size.`,
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64}`,
                            },
                        },
                    ],
                },
            ],
            temperature: 0.3,
            max_tokens: 500,
        });

        const responseText = completion.choices[0]?.message?.content || '{}';

        // Parse JSON response
        const cleanedResponse = responseText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const result: FoodAnalysisResult = JSON.parse(cleanedResponse);

        return result;
    } catch (error) {
        console.error('Error analyzing food image:', error);
        throw new Error('Failed to analyze food image. Please try again.');
    }
}
