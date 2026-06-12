console.log("app.js loaded");

// ==========================
// 🎤 VOICE SETUP
// ==========================
let recognition = null;

function initVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.log("Voice not supported");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = function (event) {

        const text = event.results[0][0].transcript;
        document.getElementById("message").value = text;
    };

    recognition.onerror = function (event) {
        console.log("Voice Error:", event.error);
    };
}

// ==========================
// 📜 SCROLL
// ==========================
function scrollToBottom() {

    const chatBox = document.getElementById("chat-box");

    if (!chatBox) return;

    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: "smooth"
    });
}

// ==========================
// 📜 LOAD HISTORY
// ==========================
async function loadHistory() {

    const token = localStorage.getItem("access_token");

    if (!token) {
        console.log("No JWT token found");

        document.getElementById("chat-box").innerHTML =
            "<h3>Please Login First</h3>";

        return;
    }

    try {

        const response = await fetch("/api/history/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {

            console.log("History Status:", response.status);
            const err = await response.text();
            console.log("History Error:", err);

            throw new Error("History Failed");
        }

        const data = await response.json();

        const chatBox = document.getElementById("chat-box");
        chatBox.innerHTML = "";

        data.forEach(chat => {

            chatBox.innerHTML += `
                <div class="user">${chat.user_message}</div>
            `;

            if (chat.image) {
                chatBox.innerHTML += `
                    <img src="${chat.image}" width="200">
                `;
            }

            chatBox.innerHTML += `
                <div class="bot">${chat.bot_response}</div>
            `;
        });

        scrollToBottom();

    } catch (error) {

        console.error("History Error:", error);

        document.getElementById("chat-box").innerHTML =
            "<h3>History Load Failed</h3>";
    }
}

// ==========================
// 💬 SEND MESSAGE
// ==========================
async function sendMessage() {

    const token = localStorage.getItem("access_token");

    if (!token) {
        alert("Please Login First");
        return;
    }

    const message = document.getElementById("message").value;
    const image = document.getElementById("imageInput").files[0];

    if (!message.trim()) {
        alert("Please enter a message");
        return;
    }

    const formData = new FormData();
    formData.append("message", message);

    if (image) {
        formData.append("image", image);
    }

    try {

        const response = await fetch("/api/chat/", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {

            console.log("Chat Status:", response.status);

            const errorText = await response.text();
            console.log("Chat Error:", errorText);

            throw new Error("Chat Failed");
        }

        const data = await response.json();

        speak(data.bot_response);

        const chatBox = document.getElementById("chat-box");

        chatBox.innerHTML += `
            <div class="user">${data.user_message}</div>
        `;

        if (data.image) {
            chatBox.innerHTML += `
                <img src="${data.image}" width="200">
            `;
        }

        chatBox.innerHTML += `
            <div class="bot">${data.bot_response}</div>
        `;

        document.getElementById("message").value = "";
        document.getElementById("imageInput").value = "";

        scrollToBottom();

    } catch (error) {

        console.error("Send Message Error:", error);
        alert("Failed to send message");
    }
}

// ==========================
// 🔊 SPEAK
// ==========================
function speak(text) {

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    speechSynthesis.speak(utterance);
}

// ==========================
// 🚀 INIT
// ==========================
window.addEventListener("load", () => {

    loadHistory();
    initVoice();

    const micBtn = document.getElementById("mic-btn");

    if (micBtn) {

        micBtn.addEventListener("click", () => {

            if (recognition) {
                recognition.start();
            }
        });
    }
});