// This is our secure, server-side function
export default async function handler(request, response) {
    // We only allow POST requests to this endpoint
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = request.body;

    if (!prompt) {
        return response.status(400).json({ error: 'Prompt is required' });
    }

    // IMPORTANT: We get the API key from environment variables on Vercel
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return response.status(500).json({ error: 'Server configuration error: API key not set' });
    }

    try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o", // You can change to "gpt-3.5-turbo" for a faster/cheaper model
                messages: [{ role: "user", content: prompt }],
                max_tokens: 200,
                temperature: 0.7,
            } )
        });

        const data = await openaiResponse.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const reply = data.choices[0].message.content.trim();
        response.status(200).json({ reply });

    } catch (error) {
        console.error(error);
        response.status(500).json({ error: `Failed to get response from AI: ${error.message}` });
    }
}
