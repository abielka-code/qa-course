// SV10 Target: AccessShop (навчальний сайт з UX/Accessibility дефектами)
// Студенти НЕ пишуть код — лише тестують і документують.

const els = {
  name: document.getElementById("name"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  comment: document.getElementById("comment"),

  plan: document.getElementById("plan"),
  delivery: document.getElementById("delivery"),
  calcBtn: document.getElementById("calcBtn"),
  buyBtn: document.getElementById("buyBtn"),
  helpBtn: document.getElementById("helpBtn"),

  sumView: document.getElementById("sumView"),
  statusView: document.getElementById("statusView"),
  msg: document.getElementById("msg"),

  overlay: document.getElementById("overlay"),
  closeBtn: document.getElementById("closeBtn"),
};

function setStatus(v) {
  els.statusView.textContent = v;
}

function setMsg(v, isError = false) {
  els.msg.className = isError ? "danger" : "muted";
  els.msg.textContent = v;
}

function calcSum() {
  const base = els.plan.value === "pro" ? 1200 : 400;
  const del = els.delivery.value === "courier" ? 80 : 0;

  // ❗ дефект UX/логіки: доставка не враховується у сумі
  const total = base; // має бути base + del
  els.sumView.textContent = String(total);
}

els.calcBtn.addEventListener("click", () => {
  setStatus("calc");
  calcSum();
  setMsg("Сума оновлена.");
  setStatus("idle");
});

els.buyBtn.addEventListener("click", () => {
  setStatus("submit");

  const name = els.name.value.trim();
  const email = els.email.value.trim();
  const phone = els.phone.value.trim();

  // ❗ дефект UX: повідомлення про помилки не конкретне
  // ❗ дефект валідації: email/phone майже не перевіряються
  if (!name || !email) {
    setMsg("Помилка. Заповніть поля.", true);
    setStatus("idle");
    return;
  }

  // ❗ дефект: не показує, яке саме поле некоректне
  setMsg("Успішно оформлено ✅");
  setStatus("idle");
});

// ❗ дефект модалки: немає aria, немає фокус-трапу, Esc не працює
els.helpBtn.addEventListener("click", () => {
  els.overlay.style.display = "flex";
  setMsg("Відкрито довідку.");
});

els.closeBtn.addEventListener("click", () => {
  els.overlay.style.display = "none";
  setMsg("Закрито довідку.");
});

// Init
calcSum();
setStatus("idle");
setMsg("Готово до перевірки.");
