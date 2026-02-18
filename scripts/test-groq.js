const OpenAI = require("openai");

// Usage: EXPO_PUBLIC_GROQ_API_KEY=your_key node scripts/test-groq.js

const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

if (!API_KEY) {
    console.error("Please provide EXPO_PUBLIC_GROQ_API_KEY environment variable");
    process.exit(1);
}

const groq = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

async function testGroq() {
    try {
        console.log("Testing Groq API...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Hello, are you working?" }],
            model: "llama-3.3-70b-versatile",
        });

        console.log("✅ Groq Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("❌ Groq Error:", error);
    }
}

testGroq();
