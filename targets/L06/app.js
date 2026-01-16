// Test Target L06 — API Console Demo
// Симулятор API для навчання HTTP запитам (GET/POST/PUT/DELETE).
// Містить деякі навмисні "особливості", щоб студенти могли зафіксувати Observation.

const methodEl = document.getElementById("method");
const urlEl = document.getElementById("url");
const bodyEl = document.getElementById("body");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");

const metaEl = document.getElementById("meta");
const respEl = document.getElementById("response");

// In-memory "database"
let products = [
  { id: 1, name: "Wireless Mouse", price: 15 },
  { id: 2, name: "USB Keyboard", price: 20 },
  { id: 3, name: "HDMI Cable", price: 8 }
];
let nextId = 4;

function now() {
  return new Date().toISOString();
}

function makeResponse(status, data, headers = {}) {
  return {
    status,
    headers: {
      "content-type": "application/json",
      "x-mock-api": "L06",
      "x-time": now(),
      ...headers
    },
    data
  };
}

function parseJsonBody(text) {
  if (!text || text.trim().length === 0) return { ok: true, value: null };
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, value: null };
  }
}

function matchProductsId(path) {
  // підтримка /api/products/123
  const m = path.match(/^\/api\/products\/(\d+)$/);
  if (!m) return null;
  return Number(m[1]);
}

function handleGet(path) {
  if (path === "/api/products") {
    return makeResponse(200, products);
  }

  const id = matchProductsId(path);
  if (id !== null) {
    const found = products.find(p => p.id === id);
    if (!found) return makeResponse(404, { error: "Product not found" });
    return makeResponse(200, found);
  }

  return makeResponse(404, { error: "Endpoint not found" });
}

function handlePost(path, body) {
  if (path === "/api/login") {
    const u = body?.username;
    const p = body?.password;

    if (u === "admin" && p === "1234") {
      return makeResponse(200, { token: "demo-token-123", user: "admin" });
    }
    return makeResponse(401, { error: "Unauthorized" });
  }

  if (path === "/api/products") {
    // валідація
    if (!body || typeof body !== "object") {
      return makeResponse(400, { error: "Invalid JSON body" });
    }

    const name = body.name;
    const price = body.price;

    if (!name || String(name).trim().length === 0) {
      return makeResponse(400, { error: "Field 'name' is required" });
    }
    if (price === undefined || price === null || Number.isNaN(Number(price))) {
      return makeResponse(400, { error: "Field 'price' must be a number" });
    }
    if (Number(price) < 0) {
      return makeResponse(400, { error: "Field 'price' must be >= 0" });
    }

    const item = { id: nextId++, name: String(name), price: Number(price) };
    products.push(item);

    // НАВМИСНА "ОСОБЛИВІСТЬ" #1: відсутній Location header (Observation)
    return makeResponse(201, item);
  }

  return makeResponse(404, { error: "Endpoint not found" });
}

function handlePut(path, body) {
  const id = matchProductsId(path);
  if (id === null) return makeResponse(404, { error: "Endpoint not found" });

  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return makeResponse(404, { error: "Product not found" });

  if (!body || typeof body !== "object") {
    return makeResponse(400, { error: "Invalid JSON body" });
  }

  // часткове оновлення дозволене (це можна описати як Observation)
  const name = body.name;
  const price = body.price;

  if (name !== undefined) {
    products[idx].name = String(name);
  }
  if (price !== undefined) {
    if (Number.isNaN(Number(price))) {
      return makeResponse(400, { error: "Field 'price' must be a number" });
    }
    if (Number(price) < 0) {
      return makeResponse(400, { error: "Field 'price' must be >= 0" });
    }
    products[idx].price = Number(price);
  }

  // НАВМИСНА "ОСОБЛИВІСТЬ" #2: повертаємо 200 OK з повним об'єктом (нормально),
  // але в реальних API інколи повертають 204 No Content. Тут не помилка.
  return makeResponse(200, products[idx]);
}

function handleDelete(path) {
  const id = matchProductsId(path);
  if (id === null) return makeResponse(404, { error: "Endpoint not found" });

  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return makeResponse(404, { error: "Product not found" });

  products.splice(idx, 1);

  // НАВМИСНА "ОСОБЛИВІСТЬ" #3: DELETE повертає JSON тіло при 204 (це некоректно)
  // 204 не має містити body. Студенти можуть зафіксувати як Observation.
  return makeResponse(204, { message: "Deleted" });
}

function dispatch(method, path, bodyText) {
  // Нормалізація: залишаємо тільки path без домену
  const cleanPath = path.trim();

  // JSON parse
  const parsed = parseJsonBody(bodyText);
  if (!parsed.ok) {
    return makeResponse(400, { error: "Invalid JSON format" });
  }

  if (method === "GET") return handleGet(cleanPath);
  if (method === "POST") return handlePost(cleanPath, parsed.value);
  if (method === "PUT") return handlePut(cleanPath, parsed.value);
  if (method === "DELETE") return handleDelete(cleanPath);

  return makeResponse(405, { error: "Method not allowed" });
}

function renderResponse(res) {
  metaEl.textContent = `Status: ${res.status}`;
  const view = {
    status: res.status,
    headers: res.headers,
    data: res.data
  };
  respEl.textContent = JSON.stringify(view, null, 2);
}

sendBtn.addEventListener("click", () => {
  const method = methodEl.value;
  const path = urlEl.value;
  const body = bodyEl.value;

  const res = dispatch(method, path, body);
  renderResponse(res);
});

clearBtn.addEventListener("click", () => {
  methodEl.value = "GET";
  urlEl.value = "/api/products";
  bodyEl.value = "";
  metaEl.textContent = "";
  respEl.textContent = "";
});

// Default
urlEl.value = "/api/products";
