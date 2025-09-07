const API_URL = "http://localhost:3000";

document.getElementById("loginBtn").addEventListener("click", async () => {
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        document.getElementById("errorMessage").innerText = "Please enter both fields!";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = "dup.html"; // Redirect to dashboard
        } else {
            document.getElementById("errorMessage").innerText = data.error;
        }
    } catch (error) {
        console.error("Login failed:", error);
    }
});
