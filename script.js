document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // Function to add a message to the chat interface
    function addMessage(text, sender) {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message', sender);

        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.textContent = sender === 'user' ? 'U' : 'A'; // U for User, A for Assistant

        const textContent = document.createElement('div');
        textContent.classList.add('text-content');
        textContent.textContent = text;

        if (sender === 'user') {
            messageWrapper.appendChild(textContent);
            messageWrapper.appendChild(avatar);
        } else {
            messageWrapper.appendChild(avatar);
            messageWrapper.appendChild(textContent);
        }
        
        chatBox.appendChild(messageWrapper);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Function to show a temporary "thinking" message
    function showThinkingIndicator() {
        const existingIndicator = document.getElementById('thinking-indicator');
        if (existingIndicator) return; // Don't add more than one

        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message', 'assistant');
        messageWrapper.id = 'thinking-indicator';

        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.textContent = 'A';

        const textContent = document.createElement('div');
        textContent.classList.add('text-content');
        textContent.innerHTML = `<span class="thinking-dot"></span><span class="thinking-dot"></span><span class="thinking-dot"></span>`;
        
        messageWrapper.appendChild(avatar);
        messageWrapper.appendChild(textContent);
        chatBox.appendChild(messageWrapper);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Function to remove the "thinking" message
    function removeThinkingIndicator() {
        const indicator = document.getElementById('thinking-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Function to get AI response from the backend
    async function getAiResponse(prompt) {
        showThinkingIndicator();
        const apiUrl = '/api/chat'; // The API route on Vercel

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            removeThinkingIndicator();

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            addMessage(data.reply, 'assistant');

        } catch (error) {
            console.error("API Error:", error);
            removeThinkingIndicator();
            addMessage(`Error: ${error.message}. Please check the connection and try again.`, "assistant");
        }
    }

    // Function to handle sending a message
    function handleSend() {
        const userText = userInput.value.trim();
        if (userText) {
            addMessage(userText, 'user');
            getAiResponse(userText);
            userInput.value = '';
            userInput.focus();
        }
    }

    // Event Listeners
    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSend();
        }
    });
});
