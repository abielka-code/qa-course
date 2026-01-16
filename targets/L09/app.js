// Test Target L09 — Automation Assessment Board
// Призначення: класифікація тестів за доцільністю автоматизації.
// Студенти не пишуть код: вони аналізують дані та формують Candidate List.

const testSelect = document.getElementById("testSelect");
const decisionEl = document.getElementById("decision");
const prioEl = document.getElementById("prio");
const reasonEl = document.getElementById("reason");

const saveBtn = document.getElementById("saveBtn");
const copyBtn = document.getElementById("copyBtn");
const resetBtn = document.getElementById("resetBtn");

const hintEl = document.getElementById("hint");
const tableWrap = document.getElementById("tableWrap");
const testsList = document.getElementById("testsList");

const tests = [
  // UI tests
  { id: "TC-LOGIN-01", area: "UI", module: "Login", title: "Valid login with admin/1234", freq: "High", stable: "High", note: "Critical flow" },
  { id: "TC-LOGIN-02", area: "UI", module: "Login", title: "Invalid password shows error", freq: "High", stable: "High", note: "Deterministic" },
  { id: "TC-LOGIN-03", area: "UI", module: "Login", title: "Remember me checkbox сохраняє сесію", freq: "Medium", stable: "Medium", note: "Cookies/session can be flaky" },

  { id: "TC-REG-01", area: "UI", module: "Registration", title: "Register with valid data", freq: "Medium", stable: "Medium", note: "Often changes UI" },
  { id: "TC-REG-02", area: "UI", module: "Registration", title: "Email format validation", freq: "High", stable: "High", note: "Pure validation" },
  { id: "TC-REG-03", area: "UI", module: "Registration", title: "Captcha verification on registration", freq: "High", stable: "Low", note: "Hard to automate due to CAPTCHA" },

  { id: "TC-PROD-01", area: "UI", module: "Products", title: "Open product details page", freq: "High", stable: "Medium", note: "Selectors might change" },
  { id: "TC-PROD-02", area: "UI", module: "Products", title: "Add product to catalog via UI form", freq: "Medium", stable: "Medium", note: "Complex setup" },
  { id: "TC-PROD-03", area: "UI", module: "Products", title: "Delete product from catalog", freq: "Low", stable: "Medium", note: "Destructive action" },

  { id: "TC-CART-01", area: "UI", module: "Cart", title: "Add item to cart", freq: "High", stable: "High", note: "Core business flow" },
  { id: "TC-CART-02", area: "UI", module: "Cart", title: "Cart total calculation", freq: "High", stable: "High", note: "Good for regression" },
  { id: "TC-CART-03", area: "UI", module: "Cart", title: "UI animation on cart open", freq: "Low", stable: "Low", note: "Visual/UX, unstable, low value" },

  { id: "TC-PAY-01", area: "UI", module: "Payments", title: "Open payment page", freq: "High", stable: "High", note: "Smoke candidate" },
  { id: "TC-PAY-02", area: "UI", module: "Payments", title: "Pay with real банковською картою (external)", freq: "Medium", stable: "Low", note: "External system, risky automation" },
  { id: "TC-PAY-03", area: "UI", module: "Payments", title: "Pay with invalid card shows validation", freq: "High", stable: "High", note: "Validation only" },

  // API tests (good candidates)
  { id: "API-PROD-GET-01", area: "API", module: "Products API", title: "GET /api/products returns list", freq: "High", stable: "High", note: "Fast, stable" },
  { id: "API-PROD-POST-01", area: "API", module: "Products API", title: "POST /api/products create valid product", freq: "High", stable: "High", note: "Fast regression" },
  { id: "API-PROD-PUT-01", area: "API", module: "Products API", title: "PUT /api/products/:id update price", freq: "High", stable: "High", note: "Deterministic" },
  { id: "API-PROD-DEL-01", area: "API", module: "Products API", title: "DELETE /api/products/:id then GET returns 404", freq: "High", stable: "High", note: "Lifecycle scenario" },

  { id: "API-LOGIN-01", area: "API", module: "Login API", title: "POST /api/login valid credentials returns token", freq: "High", stable: "High", note: "Stable contract" },
  { id: "API-LOGIN-02", area: "API", module: "Login API", title: "POST /api/login invalid returns 401", freq: "High", stable: "High", note: "Negative scenario" },

  // Flaky / not worth
  { id: "TC-UI-01", area: "UI", module: "UI", title: "Перевірка кольору кнопки у темній темі", freq: "Low", stable: "Low", note: "Visual, brittle" },
  { id: "TC-UI-02", area: "UI", module: "UI", title: "Перевірка drag-and-drop reorder списку", freq: "Medium", stable: "Low", note: "Flaky interactions" }
];

let decisions = {}; // id -> {decision, priority, reason}

function fillSelect() {
  testSelect.innerHTML = "";
  tests.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = `${t.id} — [${t.area}] ${t.module}: ${t.title}`;
    testSelect.appendChild(opt);
  });
}

function renderTestsList() {
  testsList.innerHTML = "";
  tests.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.id} | ${t.area} | ${t.module} | Freq=${t.freq} | Stable=${t.stable} | ${t.title}`;
    testsList.appendChild(li);
  });
}

function renderTable() {
  const rows = Object.keys(decisions).map(id => {
    const d = decisions[id];
    const t = tests.find(x => x.id === id);
    return { id, title: t?.title || "", decision: d.decision, priority: d.priority, reason: d.reason };
  });

  if (rows.length === 0) {
    tableWrap.innerHTML = `<div class="muted">No decisions yet. Choose a test and click “Save decision”.</div>`;
    return;
  }

  let html = `
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Test ID</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Decision</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Priority</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Reason</th>
        </tr>
      </thead>
      <tbody>
  `;

  rows.forEach(r => {
    html += `
      <tr>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${r.id}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${r.decision}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${r.priority}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${r.reason}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  tableWrap.innerHTML = html;
}

function currentTest() {
  return tests.find(t => t.id === testSelect.value);
}

function loadDecisionForSelected() {
  const id = testSelect.value;
  const existing = decisions[id];

  if (existing) {
    decisionEl.value = existing.decision;
    prioEl.value = existing.priority;
    reasonEl.value = existing.reason;
    hintEl.textContent = "Decision loaded. You can update it and click Save again.";
    return;
  }

  // default suggestion based on heuristics
  const t = currentTest();
  if (!t) return;

  let suggested = "Manual";
  let prio = "Medium";

  // API tests typically good for automation
  if (t.area === "API" && t.stable === "High") {
    suggested = "Automate";
    prio = "High";
  }

  // Captcha, visual, drag&drop -> manual/partial
  if (t.title.toLowerCase().includes("captcha")) {
    suggested = "Manual";
    prio = "High";
  }
  if (t.title.toLowerCase().includes("кольору") || t.title.toLowerCase().includes("animation")) {
    suggested = "Manual";
    prio = "Low";
  }
  if (t.title.toLowerCase().includes("drag-and-drop")) {
    suggested = "Partial";
    prio = "Medium";
  }

  decisionEl.value = suggested;
  prioEl.value = prio;
  reasonEl.value = "";
  hintEl.textContent = `Suggested: ${suggested} (you can change it).`;
}

function toMarkdownTable() {
  const ids = Object.keys(decisions);
  if (ids.length === 0) return "";

  const rows = ids.map(id => {
    const d = decisions[id];
    const t = tests.find(x => x.id === id);
    const title = (t?.title || "").replaceAll("|", "/");
    const reason = (d.reason || "").replaceAll("|", "/");
    return `| ${id} | ${title} | ${d.decision} | ${d.priority} | ${reason} |`;
  });

  return [
    `| Test ID | Назва тесту | Decision | Priority | Reason |`,
    `|--------|-------------|----------|----------|--------|`,
    ...rows
  ].join("\n");
}

saveBtn.addEventListener("click", () => {
  const id = testSelect.value;
  const reason = reasonEl.value.trim();

  if (reason.length < 8) {
    hintEl.textContent = "Reason має містити коротке пояснення (мінімум 8 символів).";
    return;
  }

  decisions[id] = {
    decision: decisionEl.value,
    priority: prioEl.value,
    reason: reason
  };

  hintEl.textContent = `Saved: ${id} → ${decisionEl.value}`;
  renderTable();
});

copyBtn.addEventListener("click", async () => {
  const md = toMarkdownTable();
  if (!md) {
    hintEl.textContent = "Немає даних для копіювання. Спочатку збережіть рішення.";
    return;
  }

  try {
    await navigator.clipboard.writeText(md);
    hintEl.textContent = "Markdown-таблицю скопійовано. Вставте її у звіт.";
  } catch {
    hintEl.textContent = "Clipboard може бути недоступний. Скопіюйте таблицю вручну зі сторінки.";
  }
});

resetBtn.addEventListener("click", () => {
  decisions = {};
  hintEl.textContent = "Reset done.";
  renderTable();
});

testSelect.addEventListener("change", loadDecisionForSelected);

// Init
fillSelect();
renderTestsList();
renderTable();
loadDecisionForSelected();
