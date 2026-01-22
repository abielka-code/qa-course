(function () {
  const form = document.getElementById("regForm");
  const ageEl = document.getElementById("age");
  const passEl = document.getElementById("password");
  const promoEl = document.getElementById("promo");
  const btnReset = document.getElementById("btnReset");

  const output = document.getElementById("output");
  const outputText = document.getElementById("outputText");

  const toast = document.getElementById("toast");
  const toastTitle = document.getElementById("toastTitle");
  const toastMsg = document.getElementById("toastMsg");

  function showToast(title, msg) {
    toastTitle.textContent = title;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function resetUI() {
    form.reset();
    output.style.display = "none";
    outputText.textContent = "";
    showToast("Reset", "Форма очищена.");
  }

  btnReset.addEventListener("click", resetUI);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const ageRaw = String(ageEl.value ?? "").trim();
    const passRaw = String(passEl.value ?? "");
    const promoRaw = String(promoEl.value ?? "").trim();

    // Базові повідомлення
    if (!ageRaw) {
      showToast("Validation error", "Поле Age є обов’язковим.");
      return;
    }
    if (!passRaw) {
      showToast("Validation error", "Поле Password є обов’язковим.");
      return;
    }

    const age = parseInt(ageRaw, 10);

    // ===============================
    // НАВЧАЛЬНІ (НАВМИСНІ) ДЕФЕКТИ
    // ===============================

    // BUG #1: мінімальна межа 18 працює неправильно (18 буде відхилено)
    // Очікування за вимогами: 18..60 включно
    // Реалізація нижче: age <= 18 -> error (помилка на boundary)
    if (isNaN(age) || age <= 18 || age > 60) {
      showToast("Validation error", "Age має бути цілим числом у діапазоні 18–60.");
      return;
    }

    // BUG #2: негативні та нульові значення частково “проскакують” через parseInt
    // (якщо вводити, наприклад, "-1", парсер дає число, але частина логіки нижче не обробляє коректно)
    // NOTE: цей дефект не завжди проявляється у всіх браузерах однаково.

    // BUG #3: Password мінімальної довжини 8 працює некоректно (8 відхиляє)
    // очікування: 8–16
    // реалізація: <=8 вважаємо помилкою
    if (passRaw.length <= 8 || passRaw.length > 16) {
      showToast("Validation error", "Password має бути довжиною 8–16 символів.");
      return;
    }

    // BUG #4: пароль з пробілами дозволяється (вимога: без пробілів)
    // Тут навмисно НЕ робиться перевірка на пробіли.

    // BUG #5: Promo Code формат перевіряється неправильно (валідний може відхилятись)
    // Очікування: AA-2026 (2 великі літери + "-" + 4 цифри)
    // Реалізація нижче ПОМИЛКОВА: приймає тільки 2 літери + "-" + 3 цифри
    if (promoRaw) {
      const wrongPromoPattern = /^[A-Z]{2}-\d{3}$/; // <- навмисна помилка
      if (!wrongPromoPattern.test(promoRaw)) {
        showToast("Validation error", "Promo Code має формат AA-2026.");
        return;
      }
    }

    // Якщо "успішно"
    output.style.display = "block";
    outputText.textContent =
      `Профіль створено.\n\n` +
      `Age: ${age}\n` +
      `Password length: ${passRaw.length}\n` +
      `Promo: ${promoRaw ? promoRaw : "(не вказано)"}`;

    showToast("Success", "Дані прийнято. Профіль створено.");
  });
})();
