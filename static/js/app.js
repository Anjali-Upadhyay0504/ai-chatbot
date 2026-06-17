console.log("app.js loaded");

// ==========================
// 🔐 INIT
// ==========================
window.addEventListener("load", () => {

    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "/";
        return;
    }

    loadHistory();
    initVoice();

    document.getElementById("message").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });
});


// ==========================
// 📜 SCROLL
// ==========================
function scrollToBottom() {
    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: "smooth"
    });
}


// ==========================
// 🎤 VOICE (FIXED - IMPORTANT)
// ==========================
function initVoice() {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.log("Speech not supported");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";

    const micBtn = document.getElementById("mic-btn");

    micBtn.addEventListener("click", () => {
        recognition.start();
    });

    recognition.onresult = (event) => {
        document.getElementById("message").value =
            event.results[0][0].transcript;
    };
}


// ==========================
// 📜 HISTORY
// ==========================
async function loadHistory() {

    const token = localStorage.getItem("access_token");

    const res = await fetch("/api/history/", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";

    data.forEach(chat => {

    if(chat.user_message){
        chatBox.innerHTML += `
            <div class="user">
                ${chat.user_message}
            </div>
        `;
    }

    if(chat.image){
        chatBox.innerHTML += `
            <img src="${chat.image}" width="200">
        `;
    }

    if(chat.pdf){

        const fileName = chat.pdf.split('/').pop();

        chatBox.innerHTML += `
            <div class="pdf-container">
                <a href="${chat.pdf}" target="_blank" class="pdf-card">
                    📄 ${fileName}
                </a>
            </div>
        `;
    }

    if(chat.bot_response){
        chatBox.innerHTML += `
            <div class="bot">
                ${chat.bot_response}
            </div>
        `;
    }
});

    scrollToBottom();
}


// ==========================
// 💬 SEND MESSAGE
// ==========================
async function sendMessage() {

    const token = localStorage.getItem("access_token");

    const message = document.getElementById("message").value.trim();
    const image = document.getElementById("imageInput").files[0];

    if (!message && !image) {
        alert("Enter message or image");
        return;
    }

    const formData = new FormData();

    if (message) formData.append("message", message);
    if (image) formData.append("image", image);

    const res = await fetch("/api/chat/", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    const data = await res.json();

    const chatBox = document.getElementById("chat-box");

    chatBox.innerHTML += `<div class="user">${data.user_message || message}</div>`;

    if (data.image) {
        chatBox.innerHTML += `<img src="${data.image}" width="200">`;
    }

    chatBox.innerHTML += `<div class="bot">${data.bot_response}</div>`;

    document.getElementById("message").value = "";
    document.getElementById("imageInput").value = "";

    scrollToBottom();
}


// ==========================
// 📄 PDF UPLOAD (FIXED)
// ==========================
async function uploadPDF() {
    const token = localStorage.getItem("access_token");
    const input = document.getElementById("pdfInput");
    const pdf = input.files[0];
    console.log("UPLOAD FUNCTION CALLED");

    if (!pdf) {
        alert("Select PDF first");
        return;
    }

    const formData = new FormData();
    formData.append("pdf", pdf);

    const res = await fetch("/api/upload-pdf/", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

const data = await res.json();

const chatBox = document.getElementById("chat-box");

const fileName = data.pdf.split('/').pop();

chatBox.innerHTML += `
    <div class="pdf-container">
        <a href="${data.pdf}" target="_blank" class="pdf-card">
            📄 ${fileName}
        </a>
    </div>
`;

alert(data.message || data.error);

scrollToBottom();
}
// ==========================
// 🔊 SPEAK
// ==========================
function speak(text) {
    if (!text) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
}