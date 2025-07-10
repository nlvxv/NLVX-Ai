// api/chat.js - Final version with Google Gemini and custom personality

export default async function handler(request, response) {
    // 1. We only allow POST requests for security
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Get the user's message from the incoming request
    const { prompt } = request.body;
    if (!prompt) {
        return response.status(400).json({ error: 'Prompt is required' });
    }

    // 3. Get the secret Google Gemini API key from Vercel's environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return response.status(500).json({ error: 'Server configuration error: API key not set' });
    }

    // 4. Prepare the request URL for the Gemini API
    // We are using gemini-1.5-flash, which is fast and great for chat.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // 5. Define the data payload, including the new System Instruction
    const requestBody = {
        contents: [
            // The user's current message
            { parts: [{ text: prompt }] }
        ],
        // *** THIS IS THE NEW, IMPORTANT PART FOR CUSTOMIZATION ***
        systemInstruction: {
            parts: {
                // Define the AI's personality and identity here
                text: `You are NLVX Ai, a helpful and highly intelligent AI assistant. You were created by a talented developer named "nlvxvz". 
                You are not a generic Google model. Your purpose is to provide accurate and creative assistance to users.
                When asked who you are or who made you, you must state that you are "NLVX Ai" and you were created by "nlvxvz".
                Maintain a friendly, professional, and slightly futuristic tone in all your responses.`
            }
        },
        // Optional: Safety settings to control the model's output
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ]
    };

    try {
        // 6. Send the request to the Google Gemini API
        const geminiResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody ),
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            throw new Error(errorData.error ? errorData.error.message : "Unknown API error");
        }

        // 7. Extract the text reply and send it back to your website
        const data = await geminiResponse.json();
        
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content.parts[0].text) {
            // Handle cases where the model returns an empty or invalid response
            throw new Error("The model returned an empty or invalid response.");
        }
        
        const reply = data.candidates[0].content.parts[0].text.trim();
        
        response.status(200).json({ reply });

    } catch (error) {
        console.error("Gemini API Error:", error);
        response.status(500).json({ error: `Failed to get response from AI: ${error.message}` });
    }
}
