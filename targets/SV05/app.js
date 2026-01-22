// SV05 Target: HTTP Lab (навчальний сайт з дефектами)
// Студенти НЕ пишуть код — лише тестують Network/Console та документують.

const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");

const btnProducts = document.getElementById("btnProducts");
const btnProfile = document.getElementById("btnProfile");
const btnFeedback = document.getElementById("btnFeedback");
const btnPing = document.getElementById("btnPing");
const btnReport = document.getElementById("btnReport");
const feedbackEl = document.getElementById("feedback");

function setStatus(text, type = "muted") {
  statusEl.className = type;
  statusEl.textContent = text;
}

function print(data) {
  outputEl.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

// -------------------------------
// 1) Завантажити товари (GET)
// -------------------------------
// ❗ ДЕФЕКТ 1: неправильний шлях до ресурсу → 404 у Network
btnProducts.addEventListener("click", async () => {
  setStatus("Статус: завантаження товарів...", "muted");
  print("");

  try {
    const res = await fetch("./mock-product.json"); // <- має бути mock-products.json (навмисно помилка)
    setStatus(`Статус: отримано відповідь (HTTP ${res.status})`, res.ok ? "ok" : "danger");

    const data = await res.json();
    print(data);
  } catch (err) {
    console.error("Products load error:", err);
    setStatus("Статус: помилка під час завантаження товарів", "danger");
    print("Помилка: перевірте Console та Network.");
  }
});

// -------------------------------
// 2) Отримати профіль (GET)
// -------------------------------
// ❗ ДЕФЕКТ 2: файл існує, але JSON некоректний → помилка парсингу в Console
btnProfile.addEventListener("click", async () => {
  setStatus("Статус: отримання профілю...", "muted");
  print("");

  try {
    const res = await fetch("./mock-profile.json");
    setStatus(`Статус: відповідь профілю (HTTP ${res.status})`, res.ok ? "ok" : "danger");

    const data = await res.json(); // <- впаде через invalid JSON
    print(data);
  } catch (err) {
    console.error("Profile parse error:", err);
    setStatus("Статус: помилка обробки профілю", "danger");
    print("Помилка: некоректна відповідь сервера. Див. Console.");
  }
});

// -------------------------------
// 3) Відправити фідбек
// -------------------------------
// ❗ ДЕФЕКТ 3: метод GET з body → TypeError у Console (і запит може не піти в Network)
btnFeedback.addEventListener("click", async () => {
  setStatus("Статус: відправка фідбеку...", "muted");
  print("");

  const message = feedbackEl.value;

  try {
    const res = await fetch("/api/feedback", {
      method: "GET", // <- має бути POST (навмисно помилка)
      headers: {
        // ❗ додатковий дефект: немає Content-Type application/json
      },
      body: JSON.stringify({ message }) // <- GET + body = помилка в браузері
    });

    setStatus(`Статус: відповідь фідбеку (HTTP ${res.status})`, res.ok ? "ok" : "danger");

    const data = await res.text();
    print(data);
  } catch (err) {
    console.error("Feedback send error:", err);
    setStatus("Статус: помилка відправки фідбеку", "danger");
    print("Помилка: перевірте Console. Ймовірно, некоректний HTTP метод або body.");
  }
});

// -------------------------------
// 4) Ping API
// -------------------------------
// ❗ ДЕФЕКТ 4: endpoint не існує → 404 у Network
btnPing.addEventListener("click", async () => {
  setStatus("Статус: ping...", "muted");
  print("");

  try {
    const res = await fetch("/api/ping");
    setStatus(`Статус: ping (HTTP ${res.status})`, res.ok ? "ok" : "danger");

    const data = await res.text();
    print(data || "(порожня відповідь)");
  } catch (err) {
    console.error("Ping error:", err);
    setStatus("Статус: помилка ping", "danger");
    print("Помилка: див. Console.");
  }
});

// -------------------------------
// 5) Побудувати звіт
// -------------------------------
// ❗ ДЕФЕКТ 5: логіка UI неправильна — замість завантаження показує сирий текст
btnReport.addEventListener("click", async () => {
  setStatus("Статус: побудова звіту...", "muted");
  print("");

  try {
    const res = await fetch("./mock-report.json");
    setStatus(`Статус: звіт отримано (HTTP ${res.status})`, res.ok ? "ok" : "danger");

    // Навмисно: не парсимо JSON, показуємо як текст
    const raw = await res.text();
    print(raw); // очікування: файл для завантаження або структурований JSON
  } catch (err) {
    console.error("Report error:", err);
    setStatus("Статус: помилка побудови звіту", "danger");
    print("Помилка: див. Console.");
  }
});
