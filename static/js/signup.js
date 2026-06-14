async function signup() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Fill all fields");
        return;
    }

    const res = await fetch("/api/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {

        alert("Signup successful ✅");

        // 👉 auto redirect to login page
        window.location.href = "/login/";

    } else {
        alert(data.error || "Signup failed");
    }
}