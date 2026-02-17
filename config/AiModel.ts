import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("Missing EXPO_PUBLIC_GEMINI_API_KEY. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
