// Test Target L07 — API Scenario Runner
// Призначення: запуск готових API сценаріїв і аналіз кроків.
// Mock API реалізовано в цьому ж файлі.

const scenarioEl = document.getElementById("scenario");
const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const summaryEl = document.getElementById("summary");
const logEl = document.getElementById("log");

// In-memory products
let products = [
  { id: 1, name: "Mouse", price: 15 },
  { id: 2, name: "Keyboard", price: 20 }
];
let nextId = 3;

function now() {
  return new Date().toISOString();
}

function apiResponse(status, data) {
  return { status, data, time: now() };
}

function findById(id) {
  return products.find(p => p.id === id);
}

function api(method, path, body) {
  // GET /api/products/:id
  const m = path.match(/^\/api\/products\/(\d+)$/);
  const id = m ? Number(m[1]) : null;

  if (method === "GET" && path === "/api/products") {
    return apiResponse(200, products);
  }

  if (method === "GET" && id !== null) {
    const item = findById(id);
    if (!item) return apiResponse(404, { error: "Product not found" });
    return apiResponse(200, item);
  }

  if (method === "POST" && path === "/api/products") {
    // validation
    if (!body || typeof body !== "object") return apiResponse(400, { error: "Invalid JSON body" });
    if (!body.name || String(body.name).trim() === "") return apiResponse(400, { error: "Field 'name' is required" });
    if (body.price === undefined || Number.isNaN(Number(body.price))) return apiResponse(400, { error: "Field 'price' must be a number" });
    if (Number(body.price) < 0) return apiResponse(400, { error: "Field 'price' must be >= 0" });

    const item = { id: nextId++, name: String(body.name), price: Number(body.price) };
    products.push(item);
    return apiResponse(201, item);
  }

  if (method === "PUT" && id !== null) {
    const item = findById(id);
    if (!item) return apiResponse(404, { error: "Product not found" });

    // Навмисна особливість: дозволяємо оновлення тільки price, name ігнорується (Observation)
    if (body && body.price !== undefined) {
      if (Number.isNaN(Number(body.price))) return apiResponse(400, { error: "Field 'price' must be a number" });
      if (Number(body.price) < 0) return apiResponse(400, { error: "Field 'price' must be >= 0" });
      item.price = Number(body.price);
    }
    return apiResponse(200, item);
  }

  if (method === "DELETE" && id !== null) {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return apiResponse(404, { error: "Product not found" });
    products.splice(idx, 1);
    return apiResponse(204, null);
  }

  if (method === "POST" && path === "/api/login") {
    const u = body?.username;
    const p = body?.password;
    if (u === "admin" && p === "1234") return apiResponse(200, { token: "runner-token", user: "admin" });
    return apiResponse(401, { error: "Unauthorized" });
  }

  return apiResponse(404, { error: "Endpoint not found" });
}

function pretty(obj) {
  return JSON.stringify(obj, null, 2);
}

function appendLog(step) {
  logEl.textContent += step + "\n\n";
}

function resetLog() {
  logEl.textContent = "";
  summaryEl.textContent = "";
}

function runScenario(code) {
  resetLog();

  // Кожен сценарій — список кроків
  const steps = [];

  if (code === "S1") {
    // Create → Read → Update → Read → Delete → Read
    steps.push({ method: "POST", url: "/api/products", body: { name: "Stand", price: 25 }, expect: 201 });
    // Read created
    steps.push({ method: "GET", url: "DYNAMIC_ID", body: null, expect: 200 });
    // Update price
    steps.push({ method: "PUT", url: "DYNAMIC_ID", body: { price: 30 }, expect: 200 });
    // Read updated
    steps.push({ method: "GET", url: "DYNAMIC_ID", body: null, expect: 200 });
    // Delete
    steps.push({ method: "DELETE", url: "DYNAMIC_ID", body: null, expect: 204 });
    // Read deleted
    steps.push({ method: "GET", url: "DYNAMIC_ID", body: null, expect: 404 });
  }

  if (code === "S2") {
    // Negative create
    steps.push({ method: "POST", url: "/api/products", body: { price: 10 }, expect: 400 });
    steps.push({ method: "POST", url: "/api/products", body: { name: "", price: 10 }, expect: 400 });
    steps.push({ method: "POST", url: "/api/products", body: { name: "Cable", price: -1 }, expect: 400 });
  }

  if (code === "S3") {
    steps.push({ method: "POST", url: "/api/login", body: { username: "admin", password: "1234" }, expect: 200 });
    steps.push({ method: "POST", url: "/api/login", body: { username: "admin", password: "0000" }, expect: 401 });
  }

  if (code === "S4") {
    steps.push({ method: "PUT", url: "/api/products/999", body: { price: 10 }, expect: 404 });
  }

  if (code === "S5") {
    // Create → Delete → Check 404
    steps.push({ method: "POST", url: "/api/products", body: { name: "Temp", price: 1 }, expect: 201 });
    steps.push({ method: "DELETE", url: "DYNAMIC_ID", body: null, expect: 204 });
    steps.push({ method: "GET", url: "DYNAMIC_ID", body: null, expect: 404 });
  }

  // Виконання
  let dynamicId = null;
  let passed = 0;

  steps.forEach((s, idx) => {
    let url = s.url;

    if (url === "DYNAMIC_ID") {
      url = `/api/products/${dynamicId}`;
    }

    const res = api(s.method, url, s.body);

    // Якщо це Create і повернувся id — зберігаємо його
    if (s.method === "POST" && url === "/api/products" && res.status === 201) {
      dynamicId = res.data.id;
    }

    const ok = res.status === s.expect;
    if (ok) passed++;

    appendLog(
      `Step ${idx + 1}\n` +
      `Request: ${s.method} ${url}\n` +
      `Body: ${s.body ? pretty(s.body) : "null"}\n` +
      `Expected status: ${s.expect}\n` +
      `Actual status: ${res.status}\n` +
      `Response: ${pretty(res.data)}\n` +
      `Result: ${ok ? "PASS" : "FAIL"}`
    );
  });

  summaryEl.textContent = `Scenario ${code} finished. Passed steps: ${passed}/${steps.length}.`;
}

runBtn.addEventListener("click", () => {
  runScenario(scenarioEl.value);
});

resetBtn.addEventListener("click", resetLog);
