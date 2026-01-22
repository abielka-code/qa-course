// SV09 Target: ResponsiveHub (навчальний сайт з дефектами)
// Студенти НЕ пишуть код — лише тестують кросбраузерність/адаптивність/доступність.

const els = {
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  sendBtn: document.getElementById("sendBtn"),
  resetBtn: document.getElementById("resetBtn"),
  statusView: document.getElementById("statusView"),
  out: document.getElementById("out"),
};

function setStatus(v) {
  els.statusView.textContent = v;
}

function print(data) {
  els.out.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

// ❗ Дефект DevTools/Network: endpoint не існує → 404
// ❗ Дефект логіки: без валідації телефону відправляє "ніби ок"
els.sendBtn.addEventListener("click", async () => {
  setStatus("sending");
  print("");

  const email = els.email.value.trim();
  const phone = els.phone.value.trim();

  // ❗ дефект валідації: email не перевіряється
  const payload = { email, phone };

  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const txt = await res.text();

    // ❗ дефект обробки: показує успіх незалежно від статусу
    setStatus("success");
    print({ httpStatus: res.status, response: txt, payload });

    // ❗ дефект Console: помилка після відправки
    showSuccessBanner(); // ReferenceError
  } catch (err) {
    console.error("Lead submit error:", err);
    setStatus("error");
    print("Помилка. Дивіться Console та Network для доказів.");
  }
});

els.resetBtn.addEventListener("click", () => {
  els.email.value = "";
  // ❗ дефект: reset не очищає телефон
  // els.phone.value = ""; // навмисно немає
  setStatus("idle");
  print("Очищено (перевірте, чи справді всі поля очистились).");
});
