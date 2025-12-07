
require('dotenv').config();

async function listModelsJson() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const fs = require('fs');
        fs.writeFileSync('available_models.json', JSON.stringify(data, null, 2));
        console.log("Saved models to available_models.json");
    } catch (error) {
        console.error("Error:", error);
    }
}

listModelsJson();
