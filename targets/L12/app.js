(function () {
  const form = document.getElementById("ticketForm");

  const fullNameEl = document.getElementById("fullName");
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");
  const topicEl = document.getElementById("topic");
  const messageEl = document.getElementById("message");
  const agreeEl = document.getElementById("agree");

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

  btnReset.addEventListener("click", () => {
    form.reset();
    output.style.display = "none";
    outputText.textContent = "";
    showToast("Reset", "Form cleared.");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = String(fullNameEl.value ?? "").trim();
    const email = String(emailEl.value ?? "").trim();
    const phone = String(phoneEl.value ?? "").trim();
    const topic = String(topicEl.value ?? "");
    const message = String(messageEl.value ?? ""); // BUG: не trim
    const agree = !!agreeEl.checked;

    // Базова перевірка обов'язковості
    if (!fullName) {
      showToast("Validation error", "Full Name is required.");
      return;
    }
    if (!email) {
      showToast("Validation error", "Email is required.");
      return;
    }
    if (!phone) {
      showToast("Validation error", "Phone is required.");
      return;
    }

    // BUG #1: topic має бути обов'язковим, але тут НЕ перевіряється (можна submit без topic)
    // if (!topic) { ... }

    // BUG #2: email regex занадто слабкий (приймає abc@ або abc.com)
    // Очікування: user@mail.com
    const weakEmailRegex = /^.+@.*$/; // <- навмисно неправильна валідація
    if (!weakEmailRegex.test(email)) {
      showToast("Validation error", "Email format is invalid.");
      return;
    }

    // BUG #3: phone повинен бути лише цифри, але тут дозволені букви та символи
    // Очікування: 10-12 цифр
    const weakPhoneRegex = /^.{10,12}$/; // <- навмисно неправильна валідація
    if (!weakPhoneRegex.test(phone)) {
      showToast("Validation error", "Phone must be 10–12 digits.");
      return;
    }

    // BUG #4: message не trim-иться, тому "          " проходить як валідний текст
    if (message.length < 10) {
      // BUG #5: некоректний текст помилки (плутає поле)
      showToast("Validation error", "Phone must be 10–12 digits."); // <- навмисно неправильний текст
      return;
    }

    // BUG #6: agree має бути обов'язковим, але логіка ігнорується
    // Очікування: без agree submit заборонений
    // if (!agree) { ... }

    // Успіх
    output.style.display = "block";
    outputText.textContent =
      `Ticket created.\n\n` +
      `Full Name: ${fullName}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `Topic: ${topic ? topic : "(empty)"}\n` +
      `Agree: ${agree ? "true" : "false"}\n` +
      `Message length: ${message.length}`;

    showToast("Success", "Ticket submitted successfully.");
  });
})();
