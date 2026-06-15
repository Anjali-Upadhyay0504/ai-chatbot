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

    const messageInput = document.getElementById("message");

    messageInput.addEventListener("keydown", function (e) {

        if (e.key === "Enter") {

            e.preventDefault();

            sendMessage();
        }
    });
});

// ==========================
// 🎤 VOICE SETUP
// ==========================


let recognition;
let isListening = false;

function initVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Speech Recognition is not supported in this browser.");
        return;
    }

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";      // Hindi ke liye "hi-IN"
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const micBtn = document.getElementById("mic-btn");

recognition.onstart = function () {

    isListening = true;

    console.log("🎤 Listening...");

    micBtn.innerHTML = "🎙️";
};

recognition.onresult = function (event) {

    const text = event.results[0][0].transcript;

    console.log("Recognized:", text);

    document.getElementById("message").value = text;

    // sendMessage();
};

recognition.onerror = function (event) {

    console.log("Voice Error:", event.error);
};

recognition.onend = function () {

    isListening = false;

    micBtn.innerHTML = `<i class="fa-solid fa-microphone-lines"></i>`;

    console.log("Recognition stopped");
};

micBtn.addEventListener("click", function () {

    if (isListening) return;

    speechSynthesis.cancel();

    recognition.start();
});

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
        const pdfUrl = data.pdf || data.file_url || data.file;
        if (pdfUrl) {
            chatBox.innerHTML += `
                <div class="pdf-message">
                    📄 <a href="${pdfUrl}" target="_blank">
                        Open PDF
                    </a>
                </div>
            `;
        }

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

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";     // Hindi: hi-IN
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    speechSynthesis.speak(utterance);

}



// ==========================
// 📄 PDF UPLOAD
// ==========================
async function uploadPDF() {

    const token = localStorage.getItem("access_token");
    const input = document.getElementById("pdfInput");
    const pdf = input.files[0];

    console.log("FILE:", pdf);

    const formData = new FormData();
    formData.append("pdf", pdf, pdf.name);

    for (let pair of formData.entries()) {
        console.log("FORMDATA:", pair[0], pair[1]);
    }

    const response = await fetch("/api/upload-pdf/", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    const data = await response.json();
    console.log("SERVER:", data);

    alert(data.message || data.error);
}