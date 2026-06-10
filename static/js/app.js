console.log("app.js loaded");
const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

const recognition =
    new SpeechRecognition();

recognition.lang = "en-US";
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

        let chatBox = document.getElementById("chat-box");

        chatBox.innerHTML = "";

        data.forEach(chat => {

            chatBox.innerHTML += `
                <div class="user">
                    ${chat.user_message}
                </div>
            `;

            if (chat.image) {
                chatBox.innerHTML += `
                    <img src="${chat.image}" width="200">
                `;
            }

            chatBox.innerHTML += `
                <div class="bot">
                    ${chat.bot_response}
                </div>
            `;
        });

        chatBox.scrollTop = chatBox.scrollHeight;

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

    let message = document.getElementById("message").value;
    let image = document.getElementById("imageInput").files[0];

    // 🚨 Validation
    if (!message.trim()) {
        alert("Please enter a message");
        return;
    }

    let formData = new FormData();
    formData.append("message", message);

    if (image) {
        formData.append("image", image);
    }

    try {

        const response = await fetch("/api/chat/", {
            method: "POST",
            body: formData
        });

        // 🚨 If backend error
        if (!response.ok) {
            console.error("Server Error:", response.status);
            alert("Server error occurred");
            return;
        }

        const data = await response.json();

        speak(data.bot_response);


        let chatBox = document.getElementById("chat-box");

        // 👤 User message
        chatBox.innerHTML += `
            <div class="user">
                ${data.user_message}
            </div>
        `;

        // 🖼️ Image
        if (data.image) {
            chatBox.innerHTML += `
                <img src="${data.image}" width="200">
            `;
        }

        // 🤖 Bot response
        chatBox.innerHTML += `
            <div class="bot">
                ${data.bot_response}
            </div>
        `;

        // reset input
        document.getElementById("message").value = "";
        document.getElementById("imageInput").value = "";

        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {

        console.error("Send Message Error:", error);
        alert("Failed to send message");
    }
    
}

document
.getElementById("mic-btn")
.addEventListener("click", () => {

    recognition.start();

});

recognition.onresult = function(event){

    const text =
        event.results[0][0].transcript;

    document.getElementById(
        "message"
    ).value = text;

};
function speak(text){

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";

    speechSynthesis.speak(utterance);
}
// ==========================
// 🚀 INIT
// ==========================
window.addEventListener("load", function () {

    console.log("Window Loaded");

    loadHistory();
});