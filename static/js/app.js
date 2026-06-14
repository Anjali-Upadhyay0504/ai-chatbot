console.log("app.js loaded");

// ==========================
// 🔐 AUTH CHECK + INIT
// ==========================
window.addEventListener("load", () => {

    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "/";
        return;
    }

    loadHistory();
    initVoice();
});

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

    const micBtn = document.getElementById("mic-btn");

    if (micBtn) {
        micBtn.addEventListener("click", () => {
            recognition.start();
        });
    }
}

// ==========================
// 📜 SCROLL TO BOTTOM
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

    try {
        const response = await fetch("/api/history/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(await response.text());
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
            "<h3>Failed to load history</h3>";
    }
}

// ==========================
// 💬 SEND MESSAGE
// ==========================
async function sendMessage() {

    const token = localStorage.getItem("access_token");

    const message = document.getElementById("message").value.trim();
    const image = document.getElementById("imageInput").files[0];

    if (!message && !image) {
        alert("Please enter message or select image");
        return;
    }

    const formData = new FormData();

    if (message) {
        formData.append("message", message);
    }

    if (image) {
        formData.append("image", image);
    }

    try {

        const response = await fetch("/api/chat/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();

        const chatBox = document.getElementById("chat-box");

        // user message
        if (data.user_message) {
            chatBox.innerHTML += `
                <div class="user">${data.user_message}</div>
            `;
        }

        // image
        if (data.image) {
            chatBox.innerHTML += `
                <img src="${data.image}" width="200">
            `;
        }

        // bot response
        chatBox.innerHTML += `
            <div class="bot">${data.bot_response}</div>
        `;

        // reset inputs
        document.getElementById("message").value = "";
        document.getElementById("imageInput").value = "";

        // speak response
        speak(data.bot_response);

        scrollToBottom();

    } catch (error) {
        console.error("Send Error:", error);
        alert("Failed to send message");
    }
}

// ==========================
// 🔊 TEXT TO SPEECH
// ==========================
function speak(text) {

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    speechSynthesis.speak(utterance);
}