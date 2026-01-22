(function () {
  const btnLoad = document.getElementById("btnLoad");
  const btnReload = document.getElementById("btnReload");
  const btnClear = document.getElementById("btnClear");

  const statusText = document.getElementById("statusText");
  const statusDot = document.getElementById("statusDot");

  const usersList = document.getElementById("usersList");
  const countTag = document.getElementById("countTag");

  const debugBox = document.getElementById("debugBox");
  const srMessage = document.getElementById("srMessage");

  const toast = document.getElementById("toast");
  const toastTitle = document.getElementById("toastTitle");
  const toastMsg = document.getElementById("toastMsg");

  let lastRequestId = 0;
  let isLoading = false;

  function showToast(title, msg) {
    toastTitle.textContent = title;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function setStatus(kind) {
    // kind: idle | loading | success | error
    if (kind === "idle") {
      statusText.textContent = "Idle";
      statusDot.style.background = "rgba(255,255,255,0.35)";
      srMessage.textContent = "Idle";
      return;
    }
    if (kind === "loading") {
      statusText.textContent = "Loading...";
      statusDot.style.background = "rgba(255,255,255,0.85)";
      srMessage.textContent = "Loading";
      return;
    }
    if (kind === "success") {
      statusText.textContent = "Loaded";
      statusDot.style.background = "rgba(255,255,255,0.65)";
      srMessage.textContent = "Loaded";
      return;
    }
    if (kind === "error") {
      statusText.textContent = "Error";
      statusDot.style.background = "rgba(255,255,255,0.25)";
      srMessage.textContent = "Error";
    }
  }

  function setCount(n) {
    countTag.textContent = `Count: ${n}`;
  }

  function clearList() {
    usersList.innerHTML = "";
    setCount(0);
  }

  function appendLog(line) {
    const now = new Date();
    const t = now.toLocaleTimeString();
    const current = debugBox.textContent.trimEnd();
    debugBox.textContent = `${current}\n[${t}] ${line}`;
  }

  function renderUsers(users) {
    clearList();
    users.forEach((u) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div>
          <p class="name">${u.name}</p>
          <div class="meta">Email: ${u.email}<br/>Role: ${u.role}</div>
        </div>
        <span class="tag">id: ${u.id}</span>
      `;
      usersList.appendChild(div);
    });
    setCount(users.length);
  }

  async function loadUsers() {
    lastRequestId++;

    // BUG #1 (UX/State): кнопка не блокується під час loading (можна створити багато запитів)
    // Очікування: під час loading кнопка має бути disabled.
    // btnLoad.disabled = true; // (навмисно НЕ робимо)

    isLoading = true;
    setStatus("loading");

    const requestId = lastRequestId;
    appendLog(`REQUEST #${requestId}: GET ./users.json`);

    try {
      // BUG #2 (Network evidence): fetch виконується успішно (200),
      // але далі буде логічна помилка парсингу структури.
      const res = await fetch("./users.json", { cache: "no-store" });

      appendLog(`RESPONSE #${requestId}: status=${res.status}`);

      // BUG #3 (Logic): очікуємо res.json() як { users: [...] },
      // але фактично файл повертає масив [...]. Це створює runtime-ошибку в renderUsers.
      const data = await res.json();

      // BUG #4 (Console): спеціально створюємо помилку доступу до поля
      // "users" якщо data — масив.
      renderUsers(data.users);

      setStatus("success");
      showToast("Success", "Users loaded.");
    } catch (err) {
      // BUG #5 (State): при помилці статус залишається Loading... (не переводиться в Error)
      // Очікування: setStatus("error")
      // setStatus("error"); // (навмисно НЕ робимо)

      showToast("Error", "Failed to load users. Check DevTools.");
      appendLog(`ERROR #${requestId}: ${String(err)}`);

      // BUG #6 (Console): виводимо зайвий error у консоль для навчального аналізу
      console.error("UsersLoader error:", err);
    } finally {
      isLoading = false;

      // BUG #7: кнопка не повертається в нормальний стан, бо вона і так не блокувалась
      // btnLoad.disabled = false;
    }
  }

  btnLoad.addEventListener("click", () => {
    // BUG: дозволяємо стартувати load навіть коли isLoading=true
    loadUsers();
  });

  btnReload.addEventListener("click", () => {
    // Reload має ініціювати повторне завантаження
    loadUsers();
  });

  btnClear.addEventListener("click", () => {
    clearList();
    setStatus("idle");
    appendLog("LIST CLEARED");
    showToast("Info", "List cleared.");
  });

  setStatus("idle");
  setCount(0);
})();
