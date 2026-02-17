import OpenAI from "openai";

const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

if (!API_KEY) {
    console.warn("Missing EXPO_PUBLIC_GROQ_API_KEY. AI features will not work.");
}

export const groq = new OpenAI({
    apiKey: API_KEY || "",
    baseURL: "https://api.groq.com/openai/v1",
    dangerouslyAllowBrowser: true, // Required for Expo/React Native client-side usage
});
