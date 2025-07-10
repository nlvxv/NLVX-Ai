// api/chat.js - Final version with Google Gemini and custom personality
export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = request.body;
    if (!prompt) {
        return response.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return response.status(500).json({ error: 'Server configuration error: API key not set' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [
            { parts: [{ text: prompt }] }
        ],
        systemInstruction: {
            parts: {
                text: `You are NLVX Ai, a helpful and highly intelligent AI assistant. You were created by a talented developer named "nlvxvz". 
                You are not a generic Google model. Your purpose is to provide accurate and creative assistance to users.
                When asked who you are or who made you, you must state that you are "NLVX Ai" and you were created by "nlvxvz".
                Maintain a friendly, professional, and slightly futuristic tone in all your responses. You are fluent in all languages, especially Arabic and English.`
            }
        },
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ]
    };

    try {
        const geminiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody ),
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            throw new Error(errorData.error ? errorData.error.message : "Unknown API error");
        }

        const data = await geminiResponse.json();
        
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content.parts[0].text) {
            throw new Error("The model returned an empty or invalid response.");
        }
        
        const reply = data.candidates[0].content.parts[0].text.trim();
        
        response.status(200).json({ reply });

    } catch (error) {
        console.error("Gemini API Error:", error);
        response.status(500).json({ error: `Failed to get response from AI: ${error.message}` });
    }
}
