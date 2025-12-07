
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Using Key:", key.substring(0, 8) + "...");
    const genAI = new GoogleGenerativeAI(key);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy model just to get client? 
        // Actually checking logic usually requires the generativeModel instance or just genAI.
        // There isn't a direct listModels on the client in some versions, but let's try standard fetch if needed.
        // Wait, the SDK doesn't always expose listModels easily in the simplified client.

        // Let's just try to hit the API manually to list models if SDK fails, but let's try SDK first if possible?
        // No, standard SDK usage doesn't emphasize listModels.

        // Let's try to just run a simple generate with 'gemini-1.5-flash-latest' and 'gemini-1.0-pro'

        const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro"];

        for (const m of modelsToTest) {
            console.log(`Testing ${m}...`);
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("Hi");
                await result.response;
                console.log(`✅ SUCCESS: ${m} works!`);
                return; // Found one!
            } catch (e) {
                console.log(`❌ FAILED: ${m} - ${e.message.split('[')[0]}`); // Print short error
            }
        }

    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

listModels();
