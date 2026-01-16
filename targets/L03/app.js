// Test Target L03 — Registration & Profile Demo
// Призначення: складання чек-листа тестування.
// У логіці навмисно є "слабкі місця", щоб студенти могли їх зафіксувати як Fail/Observation.

const fullNameEl = document.getElementById("fullName");
const emailEl = document.getElementById("email");
const phoneEl = document.getElementById("phone");
const ageEl = document.getElementById("age");
const passEl = document.getElementById("password");
const confirmEl = document.getElementById("confirmPassword");

const registerBtn = document.getElementById("registerBtn");
const resetBtn = document.getElementById("resetBtn");

const regStatus = document.getElementById("regStatus");
const profileBox = document.getElementById("profileBox");

const searchEl = document.getElementById("search");
const usersInfo = document.getElementById("usersInfo");
const usersList = document.getElementById("usersList");

let users = [
  { id: 1, fullName: "Test User", email: "test@example.com", phone: "+380501112233", age: 20 }
];
let nextId = 2;

function setStatus(msg) {
  regStatus.textContent = msg;
}

function renderProfile(user) {
  if (!user) {
    profileBox.innerHTML = `<div class="muted">Профіль ще не створено.</div>`;
    return;
  }

  // Навмисно не екрануємо HTML (потенційний ризик, але у навчальних цілях)
  profileBox.innerHTML = `
    <div><strong>Full name:</strong> ${user.fullName}</div>
    <div><strong>Email:</strong> ${user.email}</div>
    <div><strong>Phone:</strong> ${user.phone || "-"}</div>
    <div><strong>Age:</strong> ${user.age || "-"}</div>
  `;
}

function renderUsers() {
  usersList.innerHTML = "";

  const q = searchEl.value; // навмисно без trim()
  const filtered = users.filter(u =>
    // Навмисна особливість: пошук чутливий до регістру (case-sensitive)
    u.fullName.includes(q)
  );

  usersInfo.textContent = `Користувачів: ${filtered.length}`;

  filtered.forEach(u => {
    const li = document.createElement("li");
    li.textContent = `${u.fullName} — ${u.email}`;
    usersList.appendChild(li);
  });
}

function validate() {
  const fullName = fullNameEl.value;
  const email = emailEl.value;
  const phone = phoneEl.value;
  const age = Number(ageEl.value);
  const pass = passEl.value;
  const confirm = confirmEl.value;

  // Мінімальна логіка валідації (навмисно спрощено)
  if (fullName.length === 0 || email.length === 0 || pass.length === 0 || confirm.length === 0) {
    return { ok: false, message: "Error: required fields are empty" }; // англійською — неоднорідність
  }

  // Email: перевіряємо лише наявність "@"
  if (!email.includes("@")) {
    return { ok: false, message: "Помилка: некоректний Email" };
  }

  // Age: якщо не вказано — допускаємо (це слабке місце відносно вимог)
  if (ageEl.value.length > 0) {
    if (age < 16 || age > 120) {
      return { ok: false, message: "Помилка: Age поза межами 16–120" };
    }
  }

  // Password length
  if (pass.length < 6) {
    return { ok: false, message: "Помилка: пароль занадто короткий" };
  }

  // Confirm match
  if (pass !== confirm) {
    return { ok: false, message: "Помилка: паролі не співпадають" };
  }

  // Phone формат: навмисно дуже слабка перевірка — лише довжина
  if (phone.length > 0) {
    if (phone.length < 12) {
      return { ok: false, message: "Помилка: телефон закороткий" };
    }
  }

  return { ok: true, message: "Registered successfully" };
}

registerBtn.addEventListener("click", () => {
  const result = validate();
  setStatus(result.message);

  if (!result.ok) return;

  const user = {
    id: nextId++,
    fullName: fullNameEl.value,        // без trim() — допускає зайві пробіли
    email: emailEl.value,
    phone: phoneEl.value,
    age: ageEl.value
  };

  users.push(user);
  renderProfile(user);
  renderUsers();
});

resetBtn.addEventListener("click", () => {
  fullNameEl.value = "";
  emailEl.value = "";
  phoneEl.value = "";
  ageEl.value = "";
  passEl.value = "";
  confirmEl.value = "";
  setStatus(""); // очищення статусу
  renderProfile(null);
  renderUsers();
});

searchEl.addEventListener("input", () => {
  renderUsers();
});

// Start
setStatus("Ready");
renderProfile(null);
renderUsers();
