(function () {
  // UI refs
  const authTag = document.getElementById("authTag");
  const cartTag = document.getElementById("cartTag");

  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const btnLogin = document.getElementById("btnLogin");
  const btnLogout = document.getElementById("btnLogout");
  const loginState = document.getElementById("loginState");

  const productsList = document.getElementById("productsList");

  const deliveryEl = document.getElementById("delivery");
  const addressEl = document.getElementById("address");

  const promoEl = document.getElementById("promo");
  const btnApplyPromo = document.getElementById("btnApplyPromo");
  const btnSubmitOrder = document.getElementById("btnSubmitOrder");
  const orderState = document.getElementById("orderState");

  const subtotalEl = document.getElementById("subtotal");
  const discountEl = document.getElementById("discount");
  const totalEl = document.getElementById("total");

  const btnClearCart = document.getElementById("btnClearCart");
  const debugBox = document.getElementById("debugBox");

  const toast = document.getElementById("toast");
  const toastTitle = document.getElementById("toastTitle");
  const toastMsg = document.getElementById("toastMsg");

  // Data
  const products = [
    { id: 1, title: "USB-C Cable", price: 9 },
    { id: 2, title: "Wireless Mouse", price: 24 },
    { id: 3, title: "Notebook Stand", price: 19 }
  ];

  let isAuth = false;
  let cart = []; // {id, qty}
  let promoApplied = false;

  function showToast(title, msg) {
    toastTitle.textContent = title;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function appendNetLog(line) {
    const now = new Date();
    const t = now.toLocaleTimeString();
    const current = debugBox.textContent.trimEnd();
    debugBox.textContent = `${current}\n[${t}] ${line}`;
  }

  function renderProducts() {
    productsList.innerHTML = "";
    products.forEach((p) => {
      const item = document.createElement("div");
      item.className = "item";
      item.innerHTML = `
        <div>
          <p class="title">${p.title}</p>
          <div class="meta">Price: $${p.price}</div>
        </div>
        <div class="qtyRow">
          <button class="qtyBtn btnMinus" data-id="${p.id}" type="button">-</button>
          <div class="qtyVal" id="qty-${p.id}">0</div>
          <button class="qtyBtn btnPlus" data-id="${p.id}" type="button">+</button>
        </div>
      `;
      productsList.appendChild(item);
    });
  }

  function getQty(id) {
    const row = cart.find((x) => x.id === id);
    return row ? row.qty : 0;
  }

  function setQty(id, qty) {
    const row = cart.find((x) => x.id === id);
    if (!row) {
      cart.push({ id, qty });
    } else {
      row.qty = qty;
    }
    document.getElementById(`qty-${id}`).textContent = String(qty);
    updateSummary();
  }

  function updateCartTag() {
    const items = cart.reduce((acc, it) => acc + it.qty, 0);
    cartTag.textContent = `Cart items: ${items}`;
  }

  function calcSubtotal() {
    // BUG #1 (Logic): помилка в підрахунку, qty не множиться на price
    // Очікування: sum += price * qty
    let sum = 0;
    cart.forEach((it) => {
      const p = products.find((x) => x.id === it.id);
      if (p) sum += p.price; // <- навмисна помилка
    });
    return sum;
  }

  function calcDiscount(subtotal) {
    // BUG #2 (Validation/Logic): промокод застосовується тільки у верхньому регістрі
    // Очікування: без залежності від регістру
    if (promoApplied) return Math.round(subtotal * 0.1);
    return 0;
  }

  function updateSummary() {
    const subtotal = calcSubtotal();
    const discount = calcDiscount(subtotal);
    const total = subtotal - discount;

    subtotalEl.textContent = `$${subtotal}`;
    discountEl.textContent = `$${discount}`;
    totalEl.textContent = `$${total}`;

    updateCartTag();
  }

  function setAuthState(state) {
    isAuth = state;
    authTag.textContent = `Auth: ${state ? "User" : "Guest"}`;
  }

  function logout() {
    setAuthState(false);
    loginState.textContent = "Status: Logged out";
    showToast("Info", "Logged out.");
  }

  btnLogout.addEventListener("click", logout);

  btnLogin.addEventListener("click", () => {
    const email = String(emailEl.value ?? "").trim();
    const pass = String(passEl.value ?? "");

    // BUG #3 (Validation): password може бути порожнім, але login проходить
    // Очікування: password мінімум 6 символів, обов'язковий
    const weakEmail = /^.+@.+\..+$/; // умовний формат
    if (!email) {
      loginState.textContent = "Status: Error";
      showToast("Validation", "Email is required.");
      return;
    }
    if (!weakEmail.test(email)) {
      loginState.textContent = "Status: Error";
      showToast("Validation", "Email format is invalid.");
      return;
    }

    // Тут навмисно відсутня перевірка pass.length >= 6
    setAuthState(true);
    loginState.textContent = "Status: Logged in";
    showToast("Success", "Login success.");
  });

  // Products interactions
  productsList.addEventListener("click", (e) => {
    const btn = e.target;
    if (!(btn instanceof HTMLElement)) return;

    const id = Number(btn.getAttribute("data-id"));
    if (!id) return;

    if (btn.classList.contains("btnPlus")) {
      const q = getQty(id);
      setQty(id, q + 1);
      return;
    }

    if (btn.classList.contains("btnMinus")) {
      const q = getQty(id);

      // BUG #4 (Validation/State): qty може стати 0 або -1
      // Очікування: мінімум 1, або видалити item з cart
      setQty(id, q - 1);

      // BUG #5 (Console): якщо кількість стала від'ємною — кидаємо помилку (для навчання DevTools)
      if (q - 1 < 0) {
        console.error("Cart qty below zero for id=", id);
      }
      return;
    }
  });

  btnClearCart.addEventListener("click", () => {
    cart = [];
    promoApplied = false;

    // BUG #6 (Console/Logic): після очищення пробуємо оновити DOM елемент, якого може не бути
    // (імітація помилки при очищенні та перерахунку)
    const ghost = document.getElementById("qty-999");
    ghost.textContent = "0"; // <- навмисна помилка, ghost === null

    renderProducts();
    updateSummary();
    showToast("Info", "Cart cleared.");
  });

  btnApplyPromo.addEventListener("click", () => {
    const code = String(promoEl.value ?? "").trim();

    // BUG #2: залежність від регістру
    if (code === "PROMO10") {
      promoApplied = true;
      showToast("Success", "Promo applied: 10% discount.");
      updateSummary();
      return;
    }

    promoApplied = false;
    showToast("Error", "Promo code invalid.");
    updateSummary();
  });

  btnSubmitOrder.addEventListener("click", async () => {
    // Очікування: без auth/без delivery/без address - блокувати
    const delivery = String(deliveryEl.value ?? "");
    const address = String(addressEl.value ?? "").trim();

    // BUG #7 (Validation): замовлення можна відправити без address
    // Очікування: address обов'язкова
    if (!delivery) {
      orderState.textContent = "Order: Error";
      showToast("Validation", "Delivery is required.");
      return;
    }

    // BUG #8 (Validation): дозволяється submit без логіну
    // Очікування: потрібно бути залогіненим
    // if (!isAuth) { ... } // навмисно пропущено

    // BUG #9 (Network): неправильний URL -> 404 у Network
    // Очікування: статус 200
    const url = "./api/order"; // <- навмисно неправильна адреса (файл не існує)

    orderState.textContent = "Order: Sending...";
    appendNetLog(`REQUEST: POST ${url}`);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          delivery,
          address,
          promo: promoApplied ? "PROMO10" : ""
        })
      });

      appendNetLog(`RESPONSE: status=${res.status}`);

      if (!res.ok) {
        orderState.textContent = "Order: Error";
        showToast("Error", "Order failed. Check Network.");
        return;
      }

      orderState.textContent = "Order: Success";
      showToast("Success", "Order submitted.");
    } catch (err) {
      orderState.textContent = "Order: Error";
      appendNetLog(`ERROR: ${String(err)}`);
      console.error("Order error:", err);
      showToast("Error", "Order request crashed. Check Console/Network.");
    }
  });

  // Init
  setAuthState(false);
  renderProducts();
  updateSummary();
})();
