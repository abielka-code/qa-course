// L06 Target: AuthBox (навчальний сайт з дефектами)
// Студенти НЕ пишуть код — лише тестують та документують.

const els = {
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  loginBtn: document.getElementById("loginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  profileBtn: document.getElementById("profileBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  copyBtn: document.getElementById("copyBtn"),
  tokenView: document.getElementById("tokenView"),
  status: document.getElementById("status"),
  output: document.getElementById("output"),
};

let token = null;

function setStatus(text, type = "muted") {
  els.status.className = type;
  els.status.textContent = text;
}

function print(data) {
  els.output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

function renderToken() {
  els.tokenView.textContent = token ? token : "—";
}

// ------------------------
// Login (імітація API)
// ------------------------
// ❗ ДЕФЕКТ 1: відсутня валідація пароля (порожній пароль проходить)
// ❗ ДЕФЕКТ 2: навіть при помилці у Network інколи показує "Успіх" (логіка повідомлення)
els.loginBtn.addEventListener("click", async () => {
  setStatus("Статус: логін...", "muted");
  print("");

  const email = els.email.value;
  const password = els.password.value; // може бути порожнім

  try {
    // ❗ ДЕФЕКТ 3: неправильний endpoint (404) для логіна
    const res = await fetch("./mock-login.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    // ❗ Помилка інтерпретації: не перевіряється res.ok
    const data = await res.json();

    token = data.token; // якщо даних нема — token стане undefined
    renderToken();

    // ❗ Невірний статус: пише успіх навіть якщо token відсутній
    setStatus("Статус: успішний вхід ✅", "ok");
    print({ message: "Login OK", token: token });
  } catch (err) {
    console.error("Login error:", err);

    // ❗ ДЕФЕКТ 2: повідомлення некоректне (має бути error, але залишає success-подібний текст)
    setStatus("Статус: вхід виконано", "ok");
    print("Помилка логіну. Перевірте Network/Console.");
  }
});

// ------------------------
// Logout
// ------------------------
// ❗ ДЕФЕКТ 4: logout очищає token, але не очищає output/status коректно (UX)
els.logoutBtn.addEventListener("click", () => {
  token = null;
  renderToken();
  // Навмисно: output не очищаємо
  setStatus("Статус: виконано вихід", "muted");
});

// ------------------------
// Copy token
// ------------------------
els.copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(token || "");
    setStatus("Статус: token скопійовано", "muted");
  } catch (err) {
    console.error("Clipboard error:", err);
    setStatus("Статус: не вдалося скопіювати token", "danger");
  }
});

// ------------------------
// Profile
// ------------------------
// ❗ ДЕФЕКТ 5: Authorization header НЕ додається → 401 (навчальна помилка API сценарію)
els.profileBtn.addEventListener("click", async () => {
  setStatus("Статус: отримання профілю...", "muted");
  print("");

  try {
    const res = await fetch("./mock-profile-ok.json", {
      method: "GET",
      headers: {
        // "Authorization": `Bearer ${token}` // <- навмисно відсутній
      }
    });

    // ❗ ДЕФЕКТ 6: некоректна обробка статусу — на 401 намагається парсити як ok
    const data = await res.json();

    setStatus(`Статус: профіль отримано (HTTP ${res.status})`, res.ok ? "ok" : "danger");
    print(data);

    // ❗ ДЕФЕКТ 7: виклик неіснуючої функції після успіху/фейлу → Console error
    highlightProfileCard(); // ReferenceError
  } catch (err) {
    console.error("Profile error:", err);
    setStatus("Статус: помилка профілю", "danger");
    print("Помилка: перевірте Console та Network.");
  }
});

// ------------------------
// Refresh button
// ------------------------
els.refreshBtn.addEventListener("click", () => {
  location.reload();
});

// init
renderToken();
