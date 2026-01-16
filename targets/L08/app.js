// Test Target L08 — Test Run Analyzer
// Студенти аналізують готові результати тестового прогону.

const totalEl = document.getElementById("total");
const passedEl = document.getElementById("passed");
const failedEl = document.getElementById("failed");
const blockedEl = document.getElementById("blocked");
const skippedEl = document.getElementById("skipped");
const ratesEl = document.getElementById("rates");

const showBtn = document.getElementById("showBtn");
const copyBtn = document.getElementById("copyBtn");
const tableWrap = document.getElementById("tableWrap");
const defectsWrap = document.getElementById("defectsWrap");

const testCases = [
  { id: "TC-001", module: "Login", title: "Valid login", status: "Passed" },
  { id: "TC-002", module: "Login", title: "Invalid password", status: "Passed" },
  { id: "TC-003", module: "Login", title: "Locked account message", status: "Failed" },

  { id: "TC-010", module: "Registration", title: "Register with valid data", status: "Passed" },
  { id: "TC-011", module: "Registration", title: "Email validation", status: "Failed" },
  { id: "TC-012", module: "Registration", title: "Password min length", status: "Passed" },
  { id: "TC-013", module: "Registration", title: "Confirm password mismatch", status: "Passed" },

  { id: "TC-020", module: "Products", title: "List products", status: "Passed" },
  { id: "TC-021", module: "Products", title: "Open product details", status: "Passed" },
  { id: "TC-022", module: "Products", title: "Add product", status: "Failed" },
  { id: "TC-023", module: "Products", title: "Delete product", status: "Blocked" },

  { id: "TC-030", module: "Cart", title: "Add to cart", status: "Failed" },
  { id: "TC-031", module: "Cart", title: "Remove from cart", status: "Skipped" },
  { id: "TC-032", module: "Cart", title: "Cart total calculation", status: "Failed" },

  { id: "TC-040", module: "Payments", title: "Open payment page", status: "Passed" },
  { id: "TC-041", module: "Payments", title: "Pay with card", status: "Failed" },
  { id: "TC-042", module: "Payments", title: "Pay with invalid card", status: "Passed" }
];

const defects = [
  {
    id: "BUG-101",
    title: "Login: locked account message is missing",
    module: "Login",
    severity: "Major",
    priority: "High"
  },
  {
    id: "BUG-102",
    title: "Registration: email validation allows invalid format",
    module: "Registration",
    severity: "Major",
    priority: "High"
  },
  {
    id: "BUG-103",
    title: "Products: add product returns error 500",
    module: "Products",
    severity: "Critical",
    priority: "High"
  },
  {
    id: "BUG-104",
    title: "Cart: cannot add item to cart",
    module: "Cart",
    severity: "Critical",
    priority: "High"
  },
  {
    id: "BUG-105",
    title: "Cart: total calculation is incorrect",
    module: "Cart",
    severity: "Major",
    priority: "Medium"
  },
  {
    id: "BUG-106",
    title: "Payments: card payment fails for valid cards",
    module: "Payments",
    severity: "Critical",
    priority: "High"
  }
];

function calcSummary() {
  const total = testCases.length;
  const passed = testCases.filter(t => t.status === "Passed").length;
  const failed = testCases.filter(t => t.status === "Failed").length;
  const blocked = testCases.filter(t => t.status === "Blocked").length;
  const skipped = testCases.filter(t => t.status === "Skipped").length;

  return { total, passed, failed, blocked, skipped };
}

function calcRates(summary) {
  const passRate = (summary.passed / summary.total) * 100;
  const failRate = (summary.failed / summary.total) * 100;
  return { passRate, failRate };
}

function renderTable() {
  let html = `
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">ID</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Module</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Title</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  testCases.forEach(t => {
    html += `
      <tr>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${t.id}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${t.module}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${t.title}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${t.status}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  tableWrap.innerHTML = html;
}

function renderDefects() {
  let html = `
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Bug ID</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Module</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Title</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Severity</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Priority</th>
        </tr>
      </thead>
      <tbody>
  `;

  defects.forEach(d => {
    html += `
      <tr>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${d.id}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${d.module}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${d.title}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${d.severity}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${d.priority}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  defectsWrap.innerHTML = html;
}

function updateTop(summary, rates) {
  totalEl.textContent = summary.total;
  passedEl.textContent = summary.passed;
  failedEl.textContent = summary.failed;
  blockedEl.textContent = summary.blocked;
  skippedEl.textContent = summary.skipped;

  ratesEl.textContent =
    `Pass rate: ${rates.passRate.toFixed(2)}% | Fail rate: ${rates.failRate.toFixed(2)}%`;
}

function rawData() {
  return {
    run: "Release 1.0.3",
    summary: calcSummary(),
    testCases,
    defects
  };
}

showBtn.addEventListener("click", () => {
  renderTable();
  renderDefects();
});

copyBtn.addEventListener("click", async () => {
  const text = JSON.stringify(rawData(), null, 2);
  try {
    await navigator.clipboard.writeText(text);
    alert("Raw data copied to clipboard.");
  } catch {
    alert("Clipboard доступний не у всіх браузерах. Скопіюйте вручну з таблиці.");
  }
});

// Init
const summary = calcSummary();
const rates = calcRates(summary);
updateTop(summary, rates);
