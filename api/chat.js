// api/chat.js - Updated for Google Gemini API
export default async function handler(request, response) {
    // 1. We only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Get the user's message from the request
    const { prompt } = request.body;
    if (!prompt) {
        return response.status(400).json({ error: 'Prompt is required' });
    }

    // 3. Get the Google Gemini API key from Vercel's environment variables
    const apiKey = process.env.GEMINI_API_KEY; // Note the new variable name

    if (!apiKey) {
        return response.status(500).json({ error: 'Server configuration error: API key not set' });
    }

    // 4. Prepare the request to the Gemini API
    // We are using gemini-1.5-flash, which is fast and powerful for chat.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    try {
        // 5. Send the request to Google
        const geminiResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            } ),
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            throw new Error(errorData.error.message);
        }

        // 6. Extract the reply and send it back to our website
        const data = await geminiResponse.json();
        // Add a check in case the model returns no candidates
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("The model did not return a response.");
        }
        const reply = data.candidates[0].content.parts[0].text.trim();
        
        response.status(200).json({ reply });

    } catch (error) {
        console.error("Gemini API Error:", error);
        response.status(500).json({ error: `Failed to get response from AI: ${error.message}` });
    }
}
