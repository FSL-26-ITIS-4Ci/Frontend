let ws = new WebSocket("ws://localhost:8080");
let token = localStorage.getItem("authToken");

function safeSend(payload) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(payload);
  } else {
    ws.addEventListener("open", () => ws.send(payload), { once: true });
  }
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case "login_response":
      if (data.success) {
        localStorage.setItem("authToken", data.token);
        location.href = "admin.html";
      } else {
        const err = document.getElementById("error");
        if (err) err.textContent = data.message;
      }
      break;
    case "logout_response":
      clearSession();
      location.href = "index.html";
      break;
    case "protected_response":
      console.log("Protected response:", data.message);
      break;
    case "error":
      if (data.message.includes("Unauthorized")) {
        clearSession();
        location.href = "login.html";
      }
      break;
  }
};

function clearSession() {
  localStorage.removeItem("authToken");
  token = null;
}

const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const pass = document.getElementById("password").value;
    safeSend(JSON.stringify({ type: "login", password: pass }));
  });
}

const logoutBtn = document.getElementById("logoutBtn");
const protectedBtn = document.getElementById("protectedBtn");
if (logoutBtn && protectedBtn) {
  if (!token) {
    location.href = "login.html";
  }
  logoutBtn.addEventListener("click", () => {
    safeSend(JSON.stringify({ type: "logout", token: token }));
  });
  protectedBtn.addEventListener("click", () => {
    safeSend(
      JSON.stringify({
        type: "protected_action",
        token: token,
        data: "Admin action",
      }),
    );
  });
}

function checkLogin() {
  if (token) {
    location.href = "admin.html";
  }
}
