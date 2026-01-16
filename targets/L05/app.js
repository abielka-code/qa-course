// Test Target L05 — Bug Hunt Demo
// Призначення: знайти дефекти та оформити баг-репорти.
// У коді є навмисно додані помилки.

const usernameEl = document.getElementById("username");
const passEl = document.getElementById("pass");
const loginBtn = document.getElementById("loginBtn");
const loginStatus = document.getElementById("loginStatus");

const aEl = document.getElementById("a");
const bEl = document.getElementById("b");
const calcBtn = document.getElementById("calcBtn");
const calcResult = document.getElementById("calcResult");

const openProfileBtn = document.getElementById("openProfileBtn");
const profileBox = document.getElementById("profileBox");

const searchEl = document.getElementById("search");
const searchInfo = document.getElementById("searchInfo");
const usersEl = document.getElementById("users");

let loggedIn = false;

// Список користувачів
const users = ["admin", "manager", "testUser"];

function setLoginStatus(msg) {
  loginStatus.textContent = msg;
}

function renderUsers(list) {
  usersEl.innerHTML = "";
  list.forEach(u => {
    const li = document.createElement("li");
    li.textContent = u;
    usersEl.appendChild(li);
  });
  searchInfo.textContent = `Found: ${list.length}`;
}

loginBtn.addEventListener("click", () => {
  const u = usernameEl.value;
  const p = passEl.value;

  // ДЕФЕКТ #1: логіка авторизації некоректна (помилковий оператор ||)
  // При введенні admin з будь-яким паролем система може вважати вхід успішним.
  if (u === "admin" || p === "1234") {
    loggedIn = true;
    setLoginStatus("Login success");
  } else {
    // ДЕФЕКТ #2: при помилці статус не очищається, а додається текст
    setLoginStatus(loginStatus.textContent + " | Invalid credentials");
  }
});

calcBtn.addEventListener("click", () => {
  const a = Number(aEl.value);
  const b = Number(bEl.value);

  // ДЕФЕКТ #3: замість додавання виконується віднімання
  const res = a - b;

  // ДЕФЕКТ #4: повідомлення не інформативне (немає формату "A+B=...")
  calcResult.textContent = `Result: ${res}`;
});

openProfileBtn.addEventListener("click", () => {
  // ДЕФЕКТ #5: профіль відкривається навіть без логіну
  profileBox.innerHTML = `
    <div><strong>User:</strong> ${usernameEl.value || "Unknown"}</div>
    <div><strong>Role:</strong> demo</div>
    <div><strong>Status:</strong> active</div>
  `;
});

searchEl.addEventListener("input", () => {
  const q = searchEl.value;

  // ДЕФЕКТ #6: пошук чутливий до регістру (вимога — незалежно від регістру)
  const filtered = users.filter(u => u.includes(q));
  renderUsers(filtered);
});

// Start
setLoginStatus("Ready");
renderUsers(users);
