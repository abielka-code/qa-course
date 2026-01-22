// SV08 Target: ReleaseReady (навчальний сайт з дефектами)
// Студенти НЕ пишуть код — лише тестують та формують підсумковий звіт.

const els = {
  email: document.getElementById("email"),
  pass: document.getElementById("pass"),
  loginBtn: document.getElementById("loginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  tokenView: document.getElementById("tokenView"),
  loginStatus: document.getElementById("loginStatus"),

  loadBtn: document.getElementById("loadBtn"),
  sort: document.getElementById("sort"),
  applySortBtn: document.getElementById("applySortBtn"),
  catalog: document.getElementById("catalog"),

  countView: document.getElementById("countView"),
  sumView: document.getElementById("sumView"),
  promo: document.getElementById("promo"),
  delivery: document.getElementById("delivery"),
  address: document.getElementById("address"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  clearBtn: document.getElementById("clearBtn"),
  debugBtn: document.getElementById("debugBtn"),
  orderStatus: document.getElementById("orderStatus"),
  out: document.getElementById("out"),
};

let token = null;
let items = [];
let cart = [];
let deliveryCost = 0;
let promoFreeDelivery = false;

const seed = [
  { id: 1, name: "USB кабель 1м", price: 99, popularity: 50 },
  { id: 2, name: "SSD 256GB", price: 1200, popularity: 70 },
  { id: 3, name: "Навушники дротові", price: 299, popularity: 55 },
  { id: 4, name: "Флешка 128GB", price: 999, popularity: 52 }
];

function setLoginStatus(text, type = "muted") {
  els.loginStatus.className = type;
  els.loginStatus.textContent = text;
}

function setOrderStatus(text, type = "muted") {
  els.orderStatus.className = type;
  els.orderStatus.textContent = text;
}

function print(data) {
  els.out.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

function renderToken() {
  els.tokenView.textContent = token ? token : "—";
}

function recalc() {
  const sum = cart.reduce((s, x) => s + x.price, 0);

  // ❗ ДЕФЕКТ 1: доставка інколи не додається (помилка state)
  const total = sum + (promoFreeDelivery ? 0 : 0); // має бути sum + deliveryCost
  els.sumView.textContent = String(total);

  els.countView.textContent = String(cart.length);
}

function renderCatalog() {
  els.catalog.innerHTML = "";
  items.forEach(p => {
    const div = document.createElement("div");
    div.className = "cardItem";
    div.innerHTML = `
      <div class="title">${p.name}</div>
      <div class="row" style="margin-top:6px;">
        <span class="price">${p.price} грн</span>
        <span class="pill">pop: ${p.popularity}</span>
        <button class="mini" data-add="${p.id}" style="margin-left:auto;">Додати</button>
      </div>
    `;
    els.catalog.appendChild(div);
  });

  els.catalog.querySelectorAll("button[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-add"));
      const product = items.find(x => x.id === id);
      cart.push(product);

      // ❗ ДЕФЕКТ 2: після додавання не викликається recalc() (сума/кількість не оновиться)
      // recalc(); // навмисно немає

      setOrderStatus("Статус: товар додано (але перевірте суму/кількість)", "muted");
      print({ cart });
    });
  });
}

// --------------------
// LOGIN
// --------------------
// ❗ ДЕФЕКТ 3: login endpoint не існує → 404
els.loginBtn.addEventListener("click", async () => {
  setLoginStatus("Статус: логін...", "muted");

  const payload = { email: els.email.value, pass: els.pass.value };

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    // ❗ ДЕФЕКТ 4: token береться з неправильного поля (data.access_token vs data.token)
    token = data.access_token;

    renderToken();

    // ❗ ДЕФЕКТ 5: UI показує успіх навіть якщо res.ok=false
    setLoginStatus("Статус: успішний вхід ✅", "ok");
  } catch (err) {
    console.error("Login error:", err);
    setLoginStatus("Статус: помилка логіну (див. Console/Network)", "danger");
  }
});

els.logoutBtn.addEventListener("click", () => {
  token = null;
  renderToken();
  setLoginStatus("Статус: вихід виконано", "muted");
});

// --------------------
// LOAD CATALOG
// --------------------
// ❗ ДЕФЕКТ 6: Network запит до /api/products повертає 404, але є fallback seed
els.loadBtn.addEventListener("click", async () => {
  setOrderStatus("Статус: завантаження каталогу...", "muted");
  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    items = data.items;
    setOrderStatus("Статус: каталог завантажено", "ok");
  } catch (err) {
    console.error("Catalog load error:", err);
    items = [...seed];
    setOrderStatus("Статус: каталог завантажено (fallback)", "ok");
  }
  renderCatalog();
});

// --------------------
// SORT
// --------------------
// ❗ ДЕФЕКТ 7: priceAsc сортується як текст
els.applySortBtn.addEventListener("click", () => {
  const sort = els.sort.value;

  if (sort === "priceAsc") {
    items.sort((a, b) => String(a.price).localeCompare(String(b.price)));
  } else if (sort === "priceDesc") {
    items.sort((a, b) => b.price - a.price);
  } else {
    items.sort((a, b) => b.popularity - a.popularity);
  }

  renderCatalog();
});

// --------------------
// CHECKOUT
// --------------------
els.delivery.addEventListener("change", () => {
  deliveryCost = els.delivery.value === "courier" ? 80 : 0;
  // ❗ ДЕФЕКТ 1 повтор: recalc не додає доставку, навіть якщо courier
  recalc();
});

els.clearBtn.addEventListener("click", () => {
  cart = [];
  promoFreeDelivery = false;
  els.promo.value = "";
  // ❗ ДЕФЕКТ 8: clear не очищає адресу
  // els.address.value = ""; // навмисно немає
  recalc();
  setOrderStatus("Статус: кошик очищено", "muted");
  print({ cart });
});

els.checkoutBtn.addEventListener("click", async () => {
  setOrderStatus("Статус: оформлення...", "muted");

  const promo = els.promo.value.trim().toUpperCase();

  // ❗ ДЕФЕКТ 9: промокод FREEDEL працює з пробілами/порожнім кошиком
  promoFreeDelivery = promo.includes("FREEDEL");

  const payload = {
    token, // може бути null/undefined
    cart,
    delivery: els.delivery.value,
    address: els.address.value.trim(),
    promo,
    totalShown: els.sumView.textContent
  };

  try {
    // ❗ ДЕФЕКТ 10: endpoint не існує → 404/500
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const txt = await res.text();

    // ❗ ДЕФЕКТ 11: показує успіх при будь-якому статусі
    setOrderStatus("Статус: замовлення оформлено ✅", "ok");
    print({ httpStatus: res.status, response: txt, payload });

    // ❗ ДЕФЕКТ 12: Console error після оформлення
    showToastSuccess(); // ReferenceError
  } catch (err) {
    console.error("Checkout error:", err);
    setOrderStatus("Статус: помилка оформлення (див. Console/Network)", "danger");
    print("Помилка оформлення. Зберіть докази у Console/Network.");
  }
});

els.debugBtn.addEventListener("click", () => {
  setOrderStatus("Статус: debug", "muted");
  print({
    token,
    itemsCount: items.length,
    cartCount: cart.length,
    deliveryCost,
    promoFreeDelivery,
    sumView: els.sumView.textContent
  });
});

// init
renderToken();
recalc();
renderCatalog();
