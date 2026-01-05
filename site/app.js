(() => {
  const elEmail = document.getElementById("email");
  const elPassword = document.getElementById("password");
  const btnLogin = document.getElementById("btnLogin");
  const elLoginState = document.getElementById("loginState");

  const elTitle = document.getElementById("taskTitle");
  const btnAdd = document.getElementById("btnAdd");
  const elSearch = document.getElementById("search");

  const elTasks = document.getElementById("tasks");
  const elToast = document.getElementById("toast");

  let isLoggedIn = false;

  /** @type {{id:number,title:string,done:boolean,createdAt:string}[]} */
  let tasks = [
    { id: 1, title: "Приклад задачі 1", done: false, createdAt: new Date().toISOString() },
    { id: 2, title: "Приклад задачі 2", done: true, createdAt: new Date().toISOString() }
  ];

  function showToast(message) {
    elToast.textContent = message;
    elToast.classList.remove("hidden");
    setTimeout(() => elToast.classList.add("hidden"), 1600);
  }

  function render() {
    const q = (elSearch.value || "").trim().toLowerCase();
    elTasks.innerHTML = "";

    const filtered = tasks.filter(t => t.title.toLowerCase().includes(q));

    filtered.forEach(t => {
      const li = document.createElement("li");
      li.className = "task" + (t.done ? " done" : "");

      const left = document.createElement("div");
      left.className = "left";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = t.done;
      cb.addEventListener("change", () => {
        t.done = cb.checked;
        render();
      });

      const title = document.createElement("div");
      title.className = "title";
      title.textContent = t.title;

      left.appendChild(cb);
      left.appendChild(title);

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `created: ${new Date(t.createdAt).toLocaleString()}`;

      li.appendChild(left);
      li.appendChild(meta);

      elTasks.appendChild(li);
    });
  }

  function login() {
    const email = (elEmail.value || "").trim();
    const pwd = (elPassword.value || "").trim();

    if (!email) {
      showToast("Email is required.");
      return;
    }
    if (!pwd) {
      showToast("Password is required.");
      return;
    }

    // ЛР1: демо-логін (просто перевірка, що поля не порожні)
    isLoggedIn = true;
    elLoginState.textContent = `Logged in as ${email}`;
    showToast("Login success");
  }

  function addTask() {
    if (!isLoggedIn) {
      showToast("Please login first.");
      return;
    }

    const title = (elTitle.value || "").trim();
    if (!title) {
      showToast("Title is required.");
      return;
    }

    const newTask = {
      id: Date.now(),
      title,
      done: false,
      createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    elTitle.value = "";
    render();
    showToast("Added");
  }

  btnLogin.addEventListener("click", login);
  btnAdd.addEventListener("click", addTask);
  elSearch.addEventListener("input", render);

  render();
})();
