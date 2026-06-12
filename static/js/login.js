console.log("login.js loaded");

async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

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

        if (!response.ok) {
            alert("Login failed ❌");
            console.log(data);
            return;
        }

        // ✅ store tokens
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        alert("Login successful ✅");

        // 🔥 redirect to chat page
        window.location.href = "/chat.html";

    } catch (error) {
        console.log("Login Error:", error);
        alert("Something went wrong ❌");
    }
}