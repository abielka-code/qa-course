// Test Target L02 — Mini Shop Demo
// Цей застосунок призначений для планування тестування (Test Plan).
// Логіка спрощена навмисно: немає сервера, немає БД, немає реальної авторизації.

const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginStatus = document.getElementById("loginStatus");

const searchEl = document.getElementById("search");
const catalogEl = document.getElementById("catalog");
const catalogInfo = document.getElementById("catalogInfo");

const cartEl = document.getElementById("cart");
const totalEl = document.getElementById("total");
const checkoutBtn = document.getElementById("checkoutBtn");
const clearCartBtn = document.getElementById("clearCartBtn");
const cartStatus = document.getElementById("cartStatus");

let isLoggedIn = false;

const products = [
  { id: 1, name: "Wireless Mouse", price: 15 },
  { id: 2, name: "USB Keyboard", price: 20 },
  { id: 3, name: "HDMI Cable", price: 8 },
  { id: 4, name: "Laptop Stand", price: 25 },
  { id: 5, name: "Webcam 1080p", price: 30 }
];

let cart = [];

function setLoginStatus(msg) {
  loginStatus.textContent = msg;
}

function setCartStatus(msg) {
  cartStatus.textContent = msg;
}

function renderCatalog() {
  const q = searchEl.value.toLowerCase(); // спрощено: без trim()
  catalogEl.innerHTML = "";

  const filtered = products.filter(p => p.name.toLowerCase().includes(q));
  catalogInfo.textContent = `Товарів знайдено: ${filtered.length}`;

  filtered.forEach(p => {
    const li = document.createElement("li");

    const title = document.createElement("span");
    title.textContent = `${p.name} — $${p.price}`;

    const btn = document.createElement("button");
    btn.className = "btn";
    btn.style.marginLeft = "10px";
    btn.textContent = "Add to cart";

    btn.addEventListener("click", () => {
      // В реальній системі може бути обмеження доступу, але тут додавання дозволене завжди.
      cart.push({ productId: p.id, name: p.name, price: p.price });
      setCartStatus("Товар додано у кошик");
      renderCart();
    });

    li.appendChild(title);
    li.appendChild(btn);
    catalogEl.appendChild(li);
  });
}

function renderCart() {
  cartEl.innerHTML = "";
  let total = 0;

  cart.forEach((item, idx) => {
    total += item.price;
    const li = document.createElement("li");
    li.textContent = `${idx + 1}. ${item.name} — $${item.price}`;
    cartEl.appendChild(li);
  });

  totalEl.textContent = `Сума: $${total}`;
}

loginBtn.addEventListener("click", () => {
  const email = emailEl.value;
  const pass = passEl.value;

  // Демо-логіка: умовний “успішний логін” без реальної перевірки.
  // Це важливий момент для Test Plan: треба описати обмеження.
  if (email.length === 0 || pass.length === 0) {
    setLoginStatus("Помилка: заповніть Email і Password");
    return;
  }

  isLoggedIn = true;
  setLoginStatus(`Вхід виконано: ${email}`);
  loginBtn.style.display = "none";
  logoutBtn.style.display = "inline-block";
});

logoutBtn.addEventListener("click", () => {
  isLoggedIn = false;
  setLoginStatus("Вихід виконано");
  loginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";
});

checkoutBtn.addEventListener("click", () => {
  // Спрощення: Checkout доступний навіть без логіну.
  // Це може бути ризиком/дефектом у реальному продукті.
  if (cart.length === 0) {
    setCartStatus("Неможливо оформити: кошик порожній");
    return;
  }
  setCartStatus("Checkout виконано (демо). Замовлення не зберігається.");
  cart = [];
  renderCart();
});

clearCartBtn.addEventListener("click", () => {
  cart = [];
  setCartStatus("Кошик очищено");
  renderCart();
});

searchEl.addEventListener("input", () => {
  renderCatalog();
});

// Start
setLoginStatus("Стан: не виконано вхід");
setCartStatus("Готово до тестування");
renderCatalog();
renderCart();
