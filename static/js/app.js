console.log("app.js loaded");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

recognition.lang = "en-US";

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
// 📜 LOAD CHAT HISTORY
// ==========================
async function loadHistory() {

    console.log("Loading history...");

    try {

        const response = await fetch("/api/history/");

        console.log("Response Status:", response.status);

        const data = await response.json();

        console.log("History Data:", data);

        const chatBox = document.getElementById("chat-box");

        chatBox.innerHTML = "";

        data.forEach(chat => {

            // User Message
            chatBox.innerHTML += `
                <div class="user">
                    ${chat.user_message}
                </div>
            `;

            // Image (if exists)
            if (chat.image) {
                chatBox.innerHTML += `
                    <img src="${chat.image}" width="200">
                `;
            }

            // Bot Response
            chatBox.innerHTML += `
                <div class="bot">
                    ${chat.bot_response}
                </div>
            `;
        });

        // Wait for DOM render then scroll
        setTimeout(() => {
            scrollToBottom();
        }, 100);

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

    const message = document.getElementById("message").value;
    const image = document.getElementById("imageInput").files[0];

    // Validation
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
            body: formData
        });

        if (!response.ok) {
            console.error("Server Error:", response.status);
            alert("Server error occurred");
            return;
        }

        const data = await response.json();

        // Speak bot response
        speak(data.bot_response);

        const chatBox = document.getElementById("chat-box");

        // User Message
        chatBox.innerHTML += `
            <div class="user">
                ${data.user_message}
            </div>
        `;

        // Image
        if (data.image) {
            chatBox.innerHTML += `
                <img src="${data.image}" width="200">
            `;
        }

        // Bot Response
        chatBox.innerHTML += `
            <div class="bot">
                ${data.bot_response}
            </div>
        `;

        // Clear inputs
        document.getElementById("message").value = "";
        document.getElementById("imageInput").value = "";

        // Auto Scroll
        scrollToBottom();

    } catch (error) {

        console.error("Send Message Error:", error);
        alert("Failed to send message");
    }
}

// ==========================
// 🎤 VOICE INPUT
// ==========================
document
    .getElementById("mic-btn")
    .addEventListener("click", () => {

        recognition.start();

    });

recognition.onresult = function (event) {

    const text =
        event.results[0][0].transcript;

    document.getElementById("message").value = text;
};

// ==========================
// 🔊 TEXT TO SPEECH
// ==========================
function speak(text) {

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";

    speechSynthesis.speak(utterance);
}

// ==========================
// 🚀 INIT
// ==========================
window.addEventListener("load", () => {

    console.log("Window Loaded");

    loadHistory();

});