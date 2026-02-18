const { GoogleGenerativeAI } = require("@google/generative-ai");

// This script needs to be run with the API key in the environment
// Usage: EXPO_PUBLIC_GEMINI_API_KEY=your_key node scripts/test-gemini.js

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Please provide EXPO_PUBLIC_GEMINI_API_KEY environment variable");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        // Note: older versions of the SDK might not expose listModels directly on the main class
        // We might need to use the generative model directly or check the docs
        // However, let's try a simple generation first to see if the key works with *any* model

        const potentialModels = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-pro",
            "gemini-1.0-pro"
        ];

        console.log("Testing models...");

        for (const modelName of potentialModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello, are you there?");
                const response = await result.response;
                console.log(`✅ Model '${modelName}' is working. Response: ${response.text()}`);
                return; // Found a working model!
            } catch (error) {
                console.log(`❌ Model '${modelName}' failed: ${error.message} (Status: ${error.status})`);
            }
        }

        console.log("No working models found in the list.");

    } catch (error) {
        console.error("Global Error:", error);
    }
}

listModels();
