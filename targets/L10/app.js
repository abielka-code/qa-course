// Test Target L10 — Release Candidate Test Center
// Призначення: навчальний фінальний тест-прохід (smoke + regression) і підрахунок summary.

const smokeWrap = document.getElementById("smokeWrap");
const regWrap = document.getElementById("regWrap");
const summaryBox = document.getElementById("summaryBox");

const fillSmokeBtn = document.getElementById("fillSmokeBtn");
const fillRegBtn = document.getElementById("fillRegBtn");
const resetBtn = document.getElementById("resetBtn");
const summaryBtn = document.getElementById("summaryBtn");

const knownWrap = document.getElementById("knownWrap");

const smokeTests = [
  { id: "SMK-01", title: "Login with valid credentials", module: "Login", status: "" },
  { id: "SMK-02", title: "Login with invalid password shows error", module: "Login", status: "" },
  { id: "SMK-03", title: "Registration email validation", module: "Registration", status: "" },
  { id: "SMK-04", title: "Open products list", module: "Products", status: "" },
  { id: "SMK-05", title: "Open product details", module: "Products", status: "" },
  { id: "SMK-06", title: "Add item to cart", module: "Cart", status: "" },
  { id: "SMK-07", title: "Cart total calculation", module: "Cart", status: "" },
  { id: "SMK-08", title: "Open payment page", module: "Payments", status: "" }
];

const regTests = [
  { id: "REG-01", title: "Create product via API (POST)", module: "Products API", status: "" },
  { id: "REG-02", title: "Get products via API (GET)", module: "Products API", status: "" },
  { id: "REG-03", title: "Update product price via API (PUT)", module: "Products API", status: "" },
  { id: "REG-04", title: "Delete product via API (DELETE)", module: "Products API", status: "" },
  { id: "REG-05", title: "Cart remove item", module: "Cart", status: "" },
  { id: "REG-06", title: "Pay with invalid card validation", module: "Payments", status: "" }
];

const knownIssues = [
  { id: "BUG-201", severity: "Critical", title: "Payments: card payment unstable for some cards", note: "Workaround: use 'invalid card' validation only." },
  { id: "BUG-202", severity: "Major", title: "Cart: remove item иногда не обновляет UI", note: "Need refresh in some cases." },
  { id: "BUG-203", severity: "Major", title: "Products API: DELETE returns 204 but sends body", note: "Contract inconsistency." }
];

const statuses = ["Pass", "Fail", "Blocked", "Skipped"];

function statusBadge(status) {
  if (!status) return `<span class="muted">Not set</span>`;
  return `<strong>${status}</strong>`;
}

function renderList(container, list) {
  let html = `
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">ID</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Module</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Test</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Status</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  list.forEach((t, idx) => {
    const actions = statuses.map(s =>
      `<button data-idx="${idx}" data-status="${s}" class="btn" style="padding:6px 10px;margin-right:6px;margin-bottom:6px;">${s}</button>`
    ).join("");

    html += `
      <tr>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${t.id}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${t.module}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${t.title}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${statusBadge(t.status)}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${actions}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function attachHandlers(container, list) {
  container.querySelectorAll("button[data-idx]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-idx"));
      const st = btn.getAttribute("data-status");
      list[idx].status = st;
      renderAll();
    });
  });
}

function computeSummary() {
  const all = [...smokeTests, ...regTests];
  const total = all.length;
  const pass = all.filter(t => t.status === "Pass").length;
  const fail = all.filter(t => t.status === "Fail").length;
  const blocked = all.filter(t => t.status === "Blocked").length;
  const skipped = all.filter(t => t.status === "Skipped").length;
  const notSet = all.filter(t => !t.status).length;

  const passRate = total ? (pass / total) * 100 : 0;

  return { total, pass, fail, blocked, skipped, notSet, passRate };
}

function renderKnown() {
  let html = `
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Bug</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Severity</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Title</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.12);">Note</th>
        </tr>
      </thead>
      <tbody>
  `;

  knownIssues.forEach(b => {
    html += `
      <tr>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${b.id}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${b.severity}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${b.title}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">${b.note}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  knownWrap.innerHTML = html;
}

function renderAll() {
  renderList(smokeWrap, smokeTests);
  attachHandlers(smokeWrap, smokeTests);

  renderList(regWrap, regTests);
  attachHandlers(regWrap, regTests);
}

function resetAll() {
  smokeTests.forEach(t => (t.status = ""));
  regTests.forEach(t => (t.status = ""));
  summaryBox.innerHTML = `<div class="muted">Summary will appear here.</div>`;
  renderAll();
}

fillSmokeBtn.addEventListener("click", () => {
  // Демонстраційне заповнення (для прикладу)
  // Є навмисні Fail, щоб студенти могли оформити баг-репорти.
  smokeTests.forEach(t => (t.status = "Pass"));
  smokeTests.find(t => t.id === "SMK-07").status = "Fail"; // Cart total
  smokeTests.find(t => t.id === "SMK-08").status = "Fail"; // Payment page
  renderAll();
});

fillRegBtn.addEventListener("click", () => {
  regTests.forEach(t => (t.status = "Pass"));
  regTests.find(t => t.id === "REG-04").status = "Fail"; // DELETE contract
  regTests.find(t => t.id === "REG-05").status = "Fail"; // remove item flaky
  renderAll();
});

resetBtn.addEventListener("click", resetAll);

summaryBtn.addEventListener("click", () => {
  const s = computeSummary();
  summaryBox.innerHTML = `
    <div><strong>Total:</strong> ${s.total}</div>
    <div><strong>Pass:</strong> ${s.pass}</div>
    <div><strong>Fail:</strong> ${s.fail}</div>
    <div><strong>Blocked:</strong> ${s.blocked}</div>
    <div><strong>Skipped:</strong> ${s.skipped}</div>
    <div><strong>Not set:</strong> ${s.notSet}</div>
    <div><strong>Pass rate:</strong> ${s.passRate.toFixed(2)}%</div>
  `;
});

renderKnown();
renderAll();
