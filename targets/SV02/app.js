// SV02 Target: ShopLite (навчальний сайт з дефектами)
// Студенти НЕ пишуть код — лише тестують, фіксують дефекти, збирають докази.

const products = [
  { id: 1, name: "Ноутбук Acer 15", category: "electronics", price: 23999, popular: 8 },
  { id: 2, name: "Кабель USB-C 1м", category: "electronics", price: 199, popular: 10 },
  { id: 3, name: "Кава мелена 250г", category: "food", price: 165, popular: 7 },
  { id: 4, name: "Плед теплий", category: "home", price: 499, popular: 6 },
  { id: 5, name: "Лампа настільна", category: "home", price: 799, popular: 9 },
  // ❗ Навчальний дефект даних: некоректна ціна (рядок замість числа)
  { id: 6, name: "Мед 0.5л", category: "food", price: "250", popular: 5 }
];

const rowsEl = document.getElementById("rows");
const resultsMetaEl = document.getElementById("resultsMeta");

const qEl = document.getElementById("q");
const categoryEl = document.getElementById("category");
const sortEl = document.getElementById("sort");
const applyBtn = document.getElementById("applyBtn");

const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const resetBtn = document.getElementById("resetBtn");

const checkoutForm = document.getElementById("checkoutForm");
const statusEl = document.getElementById("status");

let cart = [];

// -------------------------
// Рендер каталогу
// -------------------------
function render(list) {
  rowsEl.innerHTML = "";

  list.forEach((p) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.price} ₴</td>
      <td>
        <button data-id="${p.id}" class="addBtn" style="padding:8px 10px; border-radius:10px;">
          Додати
        </button>
      </td>
    `;

    rowsEl.appendChild(tr);
  });

  resultsMetaEl.textContent = `Знайдено: ${list.length}`;
}

// -------------------------
// Фільтрація/пошук/сортування
// -------------------------
function applyFilters() {
  const q = qEl.value.trim();
  const category = categoryEl.value;
  const sort = sortEl.value;

  let list = [...products];

  // ❗ Дефект 1: пошук чутливий до регістру (не має .toLowerCase())
  if (q.length > 0) {
    list = list.filter(p => p.name.includes(q));
  }

  // Категорія
  if (category !== "all") {
    list = list.filter(p => p.category === category);
  }

  // ❗ Дефект 2: сортування по ціні може працювати некоректно через "250" (рядок)
  if (sort === "priceAsc") {
    list.sort((a, b) => a.price - b.price);
  }
  if (sort === "priceDesc") {
    list.sort((a, b) => b.price - a.price);
  }
  if (sort === "popular") {
    list.sort((a, b) => b.popular - a.popular);
  }

  render(list);
}

// -------------------------
// Кошик
// -------------------------
function calcTotals() {
  let count = cart.length;
  let total = cart.reduce((sum, item) => sum + item.price, 0);

  cartCountEl.textContent = String(count);
  cartTotalEl.textContent = String(total);
}

// ❗ Дефект 3: при додаванні товару виникає Console error (функція не існує)
function addToCart(productId) {
  const p = products.find(x => x.id === productId);
  if (!p) return;

  cart.push(p);

  // очікувано: оновити лічильник
  updateCartCounter(); // <- ❗ReferenceError: updateCartCounter is not defined
}

// Очистити кошик
resetBtn.addEventListener("click", () => {
  cart = [];
  calcTotals();
  statusEl.textContent = "Статус: кошик очищено";
});

// Делегування кліків по кнопках
rowsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".addBtn");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  addToCart(id);

  // навіть якщо addToCart впаде — нижче може не виконатися (це теж корисно для тесту)
  calcTotals();
});

// -------------------------
// Оформлення (імітація API)
// -------------------------
checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // ❗ Дефект 4: відсутня нормальна валідація полів (можна відправити порожнє)
  const payload = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    comment: document.getElementById("comment").value,
    items: cart
  };

  statusEl.textContent = "Статус: відправка замовлення...";

  try {
    // ❗ Дефект 5: запит на неіснуючий endpoint → 404 у Network
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // ❗ Дефект 6: некоректна обробка відповіді (навіть при 404 показує “успіх”)
    const data = await res.json(); // може впасти на 404/HTML
    statusEl.innerHTML = `<span class="ok">Статус: успішно оформлено ✅</span> (OrderId: ${data.id})`;
  } catch (err) {
    console.error("Checkout error:", err);
    statusEl.innerHTML = `<span class="danger">Статус: помилка оформлення</span>`;
  }
});

// Перший рендер
applyBtn.addEventListener("click", applyFilters);
applyFilters();
