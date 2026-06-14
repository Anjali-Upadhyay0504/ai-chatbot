console.log("login.js loaded");

// ==========================
// 🔐 ENTER KEY SUPPORT
// ==========================
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        login();
    }
});

// ==========================
// 🔐 LOGIN BUTTON EVENT
// ==========================
document.getElementById("loginBtn").addEventListener("click", login);

// ==========================
// 🔐 LOGIN FUNCTION
// ==========================
async function login() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // ✅ FRONTEND VALIDATION
    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    try {

        const response = await fetch("/api/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        // ❌ LOGIN FAILED
        if (!response.ok) {
            console.log("Login Error:", data);
            alert("Invalid username or password ❌");
            return;
        }

        // ✅ SAVE TOKENS
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        alert("Login successful ✅");

        // 🚀 REDIRECT TO CHAT
        window.location.href = "/chat/";

    } catch (error) {
        console.log("Network Error:", error);
        alert("Something went wrong ❌");
    }
}