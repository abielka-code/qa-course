// SV04 Target: QuickApply (навчальний сайт з дефектами)
// Студенти НЕ пишуть код — лише тестують.

const els = {
  form: document.getElementById("applyForm"),
  fullName: document.getElementById("fullName"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  age: document.getElementById("age"),
  role: document.getElementById("role"),
  topic: document.getElementById("topic"),
  comment: document.getElementById("comment"),
  status: document.getElementById("status"),
  errorBox: document.getElementById("errorBox"),
  prefillBtn: document.getElementById("prefillBtn"),
  resetBtn: document.getElementById("resetBtn"),
};

// ❗ Дефект 1: неправильний regex email (дозволяє "a@b" без домену)
function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+$/.test(email);
}

// ❗ Дефект 2: телефон перевіряється некоректно (приймає будь-що, якщо є "+")
function isPhoneValid(phone) {
  return phone.includes("+");
}

// ❗ Дефект 3: вік перевіряється з помилкою — дозволяє 0 і негативні числа
function isAgeValid(age) {
  const n = Number(age);
  return !Number.isNaN(n) && n <= 120; // повинно бути n >= 14, але навмисно немає
}

function showError(msg) {
  els.errorBox.style.display = "block";
  els.errorBox.innerHTML = `<b class="danger">Помилка:</b> ${msg}`;
}

function clearError() {
  els.errorBox.style.display = "none";
  els.errorBox.innerHTML = "";
}

// ❗ Дефект 4: очищення форми НЕ очищає errorBox
els.resetBtn.addEventListener("click", () => {
  els.form.reset();
  els.status.textContent = "Статус: форму очищено";
  // clearError(); // навмисно не викликаємо
});

// Prefill (коректні дані)
els.prefillBtn.addEventListener("click", () => {
  els.fullName.value = "Іваненко Іван Іванович";
  els.email.value = "ivanenko@example.com";
  els.phone.value = "+380501234567";
  els.age.value = "18";
  els.role.value = "student";
  els.topic.value = "QA практика";
  els.comment.value = "Хочу навчитись тестувати негативні сценарії.";
  els.status.textContent = "Статус: приклад даних вставлено";
  clearError();
});

els.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const payload = {
    fullName: els.fullName.value,
    email: els.email.value,
    phone: els.phone.value,
    age: els.age.value,
    role: els.role.value,
    topic: els.topic.value,
    comment: els.comment.value
  };

  // ❗ Дефект 5: помилка логіки — якщо роль НЕ обрана, все одно дозволяє відправку
  if (payload.fullName.length === 0) {
    showError("Поле ПІБ обов’язкове.");
    els.status.textContent = "Статус: відхилено";
    return;
  }

  // ❗ Дефект 6: email валідація занадто слабка
  if (!isEmailValid(payload.email)) {
    showError("Email має бути коректним (наприклад name@example.com).");
    els.status.textContent = "Статус: відхилено";
    return;
  }

  // ❗ Дефект 2: слабка перевірка телефону
  if (!isPhoneValid(payload.phone)) {
    showError("Телефон має містити + та цифри.");
    els.status.textContent = "Статус: відхилено";
    return;
  }

  // ❗ Дефект 3: некоректна перевірка віку
  if (!isAgeValid(payload.age)) {
    showError("Вкажіть коректний вік (14–120).");
    els.status.textContent = "Статус: відхилено";
    return;
  }

  els.status.textContent = "Статус: надсилання...";

  try {
    // ❗ Network дефект: endpoint неіснуючий → 500/404
    const res = await fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // ❗ Дефект: навіть при res.ok=false показує успіх (логічна помилка)
    const data = await res.json(); // може впасти, якщо повернеться HTML/порожньо
    els.status.innerHTML = `<span class="ok">Статус: заявку прийнято ✅</span> (id: ${data.id})`;
  } catch (err) {
    console.error("Apply submit error:", err);
    els.status.innerHTML = `<span class="danger">Статус: помилка відправки</span>`;
  }
});
