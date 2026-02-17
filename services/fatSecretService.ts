// FatSecret API Service for OAuth 1.0 authentication and food search
import CryptoJS from 'crypto-js';

const FATSECRET_API_URL = 'https://platform.fatsecret.com/rest/server.api';

// Get credentials from environment variables
const CONSUMER_KEY = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_ID || '';
const CONSUMER_SECRET = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_SECRET || '';

export interface FoodSearchResult {
    food_id: string;
    food_name: string;
    food_description: string;
    brand_name?: string;
}

interface FoodSearchResponse {
    foods?: {
        food: FoodSearchResult[] | FoodSearchResult;
        max_results?: string;
        page_number?: string;
        total_results?: string;
    };
}

class FatSecretService {
    /**
     * Generate OAuth 1.0 signature for API request
     */
    private generateOAuthSignature(method: string, url: string, params: Record<string, string>): string {
        // Sort parameters alphabetically
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');

        // Create signature base string
        const signatureBaseString = [
            method.toUpperCase(),
            encodeURIComponent(url),
            encodeURIComponent(sortedParams)
        ].join('&');

        // Create signing key
        const signingKey = `${encodeURIComponent(CONSUMER_SECRET)}&`;

        // Generate HMAC-SHA1 signature
        const signature = CryptoJS.HmacSHA1(signatureBaseString, signingKey);
        return CryptoJS.enc.Base64.stringify(signature);
    }

    /**
     * Generate OAuth 1.0 parameters
     */
    private generateOAuthParams(): Record<string, string> {
        return {
            oauth_consumer_key: CONSUMER_KEY,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
            oauth_nonce: Math.random().toString(36).substring(2),
            oauth_version: '1.0',
        };
    }

    /**
     * Search for foods using the FatSecret API with OAuth 1.0
     */
    async searchFoods(query: string, maxResults: number = 5): Promise<FoodSearchResult[]> {
        if (!query || query.length < 3) {
            console.log('⚠️ Search query too short:', query);
            return [];
        }

        if (!CONSUMER_KEY || !CONSUMER_SECRET) {
            throw new Error('FatSecret API credentials not configured. Please add EXPO_PUBLIC_FATSECRET_CLIENT_ID and EXPO_PUBLIC_FATSECRET_CLIENT_SECRET to your .env file.');
        }

        console.log('🔍 Searching for:', query);

        try {
            // Create OAuth parameters
            const oauthParams = this.generateOAuthParams();

            // Create all request parameters
            const allParams: Record<string, string> = {
                ...oauthParams,
                method: 'foods.search',
                search_expression: query,
                format: 'json',
                max_results: maxResults.toString(),
            };

            // Generate signature
            const signature = this.generateOAuthSignature('GET', FATSECRET_API_URL, allParams);
            allParams.oauth_signature = signature;

            // Build URL with all parameters
            const params = new URLSearchParams(allParams);
            const url = `${FATSECRET_API_URL}?${params.toString()}`;

            console.log('📡 Sending OAuth 1.0 request...');
            console.log('🔑 Consumer Key:', CONSUMER_KEY.substring(0, 10) + '...');

            const response = await fetch(url, {
                method: 'GET',
            });

            console.log('📥 Search response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Search request failed:', errorText);
                throw new Error(`Food search failed: ${response.status} - ${errorText}`);
            }

            const data: FoodSearchResponse = await response.json();
            console.log('📦 Raw API response:', JSON.stringify(data, null, 2));

            // Handle both array and single object response
            if (data.foods?.food) {
                const results = Array.isArray(data.foods.food)
                    ? data.foods.food
                    : [data.foods.food];
                console.log('✅ Found', results.length, 'foods');
                return results;
            }

            console.log('⚠️ No foods found in response');
            return [];
        } catch (error) {
            console.error('❌ Error searching foods:', error);
            throw error;
        }
    }

    /**
     * Parse nutrition info from food description
     * FatSecret format: "Per 100g - Calories: 165kcal | Fat: 3.57g | Carbs: 0.00g | Protein: 31.02g"
     */
    parseNutrition(description: string): {
        servingSize: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    } {
        console.log('🔍 Parsing description:', description);

        let servingSize = 'Per serving';
        let calories = 0;
        let protein = 0;
        let carbs = 0;
        let fat = 0;

        // Extract serving size - look for natural portions first
        // Examples: "Per 1 large egg", "Per 1 serving", "Per 100g"
        const naturalServingMatch = description.match(/Per\s+(\d+\s+(?:large|medium|small|whole)?\s*\w+?)(?:\s*-|\s*\()/i);
        if (naturalServingMatch) {
            servingSize = naturalServingMatch[1].trim();
        } else {
            // Try to extract just the portion without "Per"
            const portionMatch = description.match(/Per\s+([^-|(]+)/i);
            if (portionMatch) {
                let portion = portionMatch[1].trim();

                // Convert common patterns to user-friendly format
                if (/100\s*g/i.test(portion)) {
                    // Check if it's likely to be countable (egg, apple, etc.)
                    const foodLower = description.toLowerCase();
                    if (foodLower.includes('egg')) {
                        servingSize = '1 egg';
                    } else if (foodLower.includes('apple')) {
                        servingSize = '1 apple';
                    } else if (foodLower.includes('banana')) {
                        servingSize = '1 banana';
                    } else if (foodLower.includes('chicken breast')) {
                        servingSize = '1 breast';
                    } else if (foodLower.includes('serving')) {
                        servingSize = '1 serving';
                    } else {
                        servingSize = portion; // Keep as-is if we can't convert
                    }
                } else if (/1\s+serving/i.test(portion)) {
                    servingSize = '1 serving';
                } else {
                    servingSize = portion;
                }
            }
        }

        // Extract calories (look for patterns like "165kcal" or "Calories: 165kcal")
        const caloriesMatch = description.match(/(\d+\.?\d*)\s*kcal/i);
        if (caloriesMatch) {
            calories = parseFloat(caloriesMatch[1]);
        }

        // Extract protein (look for "Protein: 31.02g")
        const proteinMatch = description.match(/Protein:\s*(\d+\.?\d*)/i);
        if (proteinMatch) {
            protein = parseFloat(proteinMatch[1]);
        }

        // Extract carbs (look for "Carbs: 0.00g")
        const carbsMatch = description.match(/Carbs?:\s*(\d+\.?\d*)/i);
        if (carbsMatch) {
            carbs = parseFloat(carbsMatch[1]);
        }

        // Extract fat (look for "Fat: 3.57g")
        const fatMatch = description.match(/Fat:\s*(\d+\.?\d*)/i);
        if (fatMatch) {
            fat = parseFloat(fatMatch[1]);
        }

        console.log('✅ Parsed:', { servingSize, calories, protein, carbs, fat });

        return { servingSize, calories, protein, carbs, fat };
    }
}

export const fatSecretService = new FatSecretService();
