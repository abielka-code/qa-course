// SV12 Target: ReleaseGate (навчальний релізний контроль)
// Студенти НЕ пишуть код — лише тестують smoke/regression і роблять Go/No-Go.

const els = {
  email: document.getElementById("email"),
  pass: document.getElementById("pass"),
  loginBtn: document.getElementById("loginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  tokenView: document.getElementById("tokenView"),
  authStatus: document.getElementById("authStatus"),

  loadOrdersBtn: document.getElementById("loadOrdersBtn"),
  createOrderBtn: document.getElementById("createOrderBtn"),
  orders: document.getElementById("orders"),
  countView: document.getElementById("countView"),
  lastHttp: document.getElementById("lastHttp"),

  smokeBtn: document.getElementById("smokeBtn"),
  regBtn: document.getElementById("regBtn"),
  decisionBtn: document.getElementById("decisionBtn"),
  gateStatus: document.getElementById("gateStatus"),
  out: document.getElementById("out"),
};

let token = null;
let orders = [];
let smokeResult = null;
let regResult = null;

function setAuth(text, type = "muted") {
  els.authStatus.className = type;
  els.authStatus.textContent = text;
}

function setGate(text, type = "muted") {
  els.gateStatus.className = type;
  els.gateStatus.textContent = text;
}

function print(data) {
  els.out.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

function renderToken() {
  els.tokenView.textContent = token ? token : "—";
}

function renderOrders() {
  els.orders.innerHTML = "";
  orders.forEach(o => {
    const div = document.createElement("div");
    div.className = "order";
    div.innerHTML = `
      <div class="orderTitle">Order #${o.id}</div>
      <div class="chips">
        <span class="chip">status: <b>${o.status}</b></span>
        <span class="chip">sum: <b>${o.sum}</b></span>
      </div>
    `;
    els.orders.appendChild(div);
  });
  els.countView.textContent = String(orders.length);
}

// ---------- AUTH ----------
// ❗ дефект: endpoint не існує → 404
els.loginBtn.addEventListener("click", async () => {
  setAuth("Auth status: login...", "muted");

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: els.email.value, pass: els.pass.value })
    });

    els.lastHttp.textContent = String(res.status);

    // ❗ дефект: token береться з неправильного поля
    const data = await res.json();
    token = data.access_token;

    // ❗ дефект: UI показує успіх при будь-якому статусі
    setAuth("Auth status: OK ✅", "ok");
    renderToken();
  } catch (err) {
    console.error("Login error:", err);
    setAuth("Auth status: error (див. Console/Network)", "danger");
  }
});

els.logoutBtn.addEventListener("click", () => {
  token = null;
  renderToken();
  setAuth("Auth status: logout", "muted");
});

// ---------- ORDERS ----------
// ❗ дефект: load orders endpoint → 500/404
els.loadOrdersBtn.addEventListener("click", async () => {
  setGate("Gate: loading orders...", "muted");
  try {
    const res = await fetch("/api/orders");
    els.lastHttp.textContent = String(res.status);
    const data = await res.json();
    orders = data.items;
    renderOrders();
    setGate("Gate: orders loaded", "ok");
  } catch (err) {
    console.error("Orders load error:", err);
    orders = [{ id: 1, status: "new", sum: 100 }];
    renderOrders();
    setGate("Gate: orders loaded (fallback)", "ok");
  }
});

// ❗ дефект: create order працює без token
els.createOrderBtn.addEventListener("click", async () => {
  setGate("Gate: creating order...", "muted");

  const payload = { token, items: ["A"], sum: 100 };

  try {
    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    els.lastHttp.textContent = String(res.status);

    // ❗ дефект: не перевіряє res.ok
    orders.push({ id: Date.now(), status: "created", sum: 100 });
    renderOrders();
    setGate("Gate: order created ✅", "ok");
  } catch (err) {
    console.error("Create order error:", err);
    setGate("Gate: create error", "danger");
  }
});

// ---------- SMOKE / REGRESSION ----------
function evaluateSmoke() {
  // smoke: auth + load + create
  const issues = [];

  if (!token) issues.push("No token after login (Auth unstable)");
  if (orders.length === 0) issues.push("Orders list is empty (Load unstable)");

  // ❗ дефект: smoke “проходить” навіть з проблемами (неправильна логіка)
  return { passed: true, issues };
}

function evaluateRegression() {
  // regression: повторні дії + стабільність
  const issues = [];

  // ❗ дефект: при повторному create може дублюватися
  if (orders.length > 2) issues.push("Possible duplicates after repeated create");

  // ❗ дефект: не перевіряє HTTP статуси
  return { passed: true, issues };
}

els.smokeBtn.addEventListener("click", () => {
  smokeResult = evaluateSmoke();
  setGate("Gate: smoke executed", "muted");
  print({ smoke: smokeResult });
});

els.regBtn.addEventListener("click", () => {
  regResult = evaluateRegression();
  setGate("Gate: regression executed", "muted");
  print({ regression: regResult });
});

els.decisionBtn.addEventListener("click", () => {
  const issues = [
    ...(smokeResult?.issues || []),
    ...(regResult?.issues || [])
  ];

  // ❗ дефект: рішення Go навіть коли є issues
  setGate("Release decision: GO ✅", "ok");
  print({
    decision: "GO",
    issues,
    note: "Перевірте, чи коректно прийняте рішення. QA має блокувати реліз при критичних проблемах."
  });

  // ❗ дефект Console після рішення
  releaseApprovedBanner(); // ReferenceError
});

// init
renderToken();
renderOrders();
setGate("Gate: ready", "muted");
print("Готово. Виконайте smoke/regression та прийміть рішення Go/No-Go.");
