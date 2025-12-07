
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}...`);
    const key = process.env.GEMINI_API_KEY;
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`Success with ${modelName}! Response:`, response.text());
        return true;
    } catch (error) {
        console.log(`Failed with ${modelName}. Error: ${error.message}`);
        if (error.response) {
            console.log("Error status:", error.response.status);
            console.log("Error statusText:", error.response.statusText);
        }
        return false;
    }
}

async function main() {
    await testModel("gemini-pro");
    await testModel("gemini-1.5-flash");
}

main();
