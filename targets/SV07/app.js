// SV07 Target: OrderLite (навчальний сайт з дефектами)
// Студенти НЕ пишуть код — лише тестують і аналізують дефекти.

const els = {
  catalog: document.getElementById("catalog"),
  countView: document.getElementById("countView"),
  sumView: document.getElementById("sumView"),
  delivery: document.getElementById("delivery"),
  promo: document.getElementById("promo"),
  promoBtn: document.getElementById("promoBtn"),
  clearBtn: document.getElementById("clearBtn"),
  address: document.getElementById("address"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  debugBtn: document.getElementById("debugBtn"),
  status: document.getElementById("status"),
  out: document.getElementById("out"),
};

const products = [
  { id: 1, name: "USB кабель 1м", price: 99 },
  { id: 2, name: "Флешка 32GB", price: 249 },
  { id: 3, name: "Навушники Bluetooth", price: 1500 },
  { id: 4, name: "SSD 256GB", price: 1200 }
];

let cart = [];
let promoDiscount = 0;

function setStatus(text, type = "muted") {
  els.status.className = type;
  els.status.textContent = text;
}

function print(data) {
  els.out.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

function deliveryCost(mode) {
  if (mode === "pickup") return 0;
  if (mode === "courier") return 80;
  if (mode === "express") return 150;
  return 0;
}

function sumCart() {
  const base = cart.reduce((s, x) => s + x.price, 0);

  // ❗ ДЕФЕКТ 1: промознижка застосовується неправильно (замість -10% робить -10 грн)
  const afterPromo = Math.max(0, base - promoDiscount);

  // ❗ ДЕФЕКТ 2: доставка не додається до суми (логіка total неправильна)
  const total = afterPromo; // має бути afterPromo + deliveryCost(...)

  return { base, afterPromo, total };
}

function render() {
  els.catalog.innerHTML = "";
  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="title">${p.name}</div>
      <div style="margin-top:6px;">
        <span class="price">${p.price} грн</span>
      </div>
      <div class="row" style="margin-top:10px;">
        <button class="mini" data-add="${p.id}">Додати</button>
      </div>
    `;
    els.catalog.appendChild(div);
  });

  els.catalog.querySelectorAll("button[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-add"));
      const item = products.find(x => x.id === id);
      cart.push(item);

      // ❗ ДЕФЕКТ 3: лічильник товарів показує кількість УНІКАЛЬНИХ, а не загальну (логіка)
      const uniqueCount = new Set(cart.map(x => x.id)).size;
      els.countView.textContent = String(uniqueCount);

      const s = sumCart();
      els.sumView.textContent = String(s.total);

      setStatus("Статус: товар додано", "ok");
      print({ cart, summary: s });
    });
  });

  // init
  els.countView.textContent = "0";
  els.sumView.textContent = "0";
  print("Готово. Додайте товари та перевірте промокод/доставку.");
}

els.promoBtn.addEventListener("click", () => {
  const code = els.promo.value.trim().toUpperCase();

  // ❗ ДЕФЕКТ 4: промокод SAVE10 працює навіть якщо кошик порожній
  if (code === "SAVE10") promoDiscount = 10;
  else promoDiscount = 0;

  const s = sumCart();
  els.sumView.textContent = String(s.total);

  setStatus("Статус: промокод застосовано", "ok");
  print({ promoCode: code, promoDiscount, summary: s });
});

els.clearBtn.addEventListener("click", () => {
  cart = [];
  // ❗ ДЕФЕКТ 5: промо не очищається при очищенні кошика
  // promoDiscount = 0; // навмисно немає

  els.countView.textContent = "0";
  els.sumView.textContent = "0";
  setStatus("Статус: кошик очищено", "muted");
  print({ cart, promoDiscount });
});

els.checkoutBtn.addEventListener("click", async () => {
  setStatus("Статус: оформлення...", "muted");

  const address = els.address.value.trim();
  const mode = els.delivery.value;
  const s = sumCart();

  // ❗ ДЕФЕКТ 6: адреса не перевіряється при доставці courier/express
  // (мала б бути обов'язкова, але можна залишити пустою)

  const payload = {
    items: cart.map(x => ({ id: x.id, name: x.name, price: x.price })),
    promoDiscount,
    delivery: mode,
    address,
    total: s.total
  };

  try {
    // ❗ ДЕФЕКТ 7: Network: endpoint не існує → 404/500
    const res = await fetch("/api/order/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // ❗ ДЕФЕКТ 8: навіть якщо res.ok=false, UI показує "успіх"
    const text = await res.text();
    setStatus("Статус: замовлення оформлено ✅", "ok");
    print({ httpStatus: res.status, response: text, payload });

    // ❗ ДЕФЕКТ 9: кидає помилку у Console (неіснуюча функція)
    openSuccessModal(); // ReferenceError
  } catch (err) {
    console.error("Checkout error:", err);
    setStatus("Статус: помилка оформлення", "danger");
    print("Помилка: дивіться Console та Network для доказів.");
  }
});

els.debugBtn.addEventListener("click", () => {
  const s = sumCart();

  // ❗ ДЕФЕКТ 10: Debug показує неправильний total (бо доставка не додається)
  setStatus("Статус: debug", "muted");
  print({
    cartCount: cart.length,
    uniqueCount: new Set(cart.map(x => x.id)).size,
    promoDiscount,
    delivery: els.delivery.value,
    summary: s
  });
});

// Init
render();
