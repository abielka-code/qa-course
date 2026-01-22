// SV11 Target: TaskFlow (навчальний сайт з дефектами під трасованість)
// Студенти НЕ пишуть код — лише тестують і прив’язують REQ ↔ TC ↔ BUG.

const els = {
  title: document.getElementById("title"),
  priority: document.getElementById("priority"),
  addBtn: document.getElementById("addBtn"),
  seedBtn: document.getElementById("seedBtn"),
  saveBtn: document.getElementById("saveBtn"),

  filter: document.getElementById("filter"),
  search: document.getElementById("search"),
  applyBtn: document.getElementById("applyBtn"),
  resetBtn: document.getElementById("resetBtn"),
  loadBtn: document.getElementById("loadBtn"),

  status: document.getElementById("status"),
  out: document.getElementById("out"),

  countView: document.getElementById("countView"),
  visibleView: document.getElementById("visibleView"),
  list: document.getElementById("list"),
};

let tasks = [];

function setStatus(text, type = "muted") {
  els.status.className = type;
  els.status.textContent = text;
}

function print(data) {
  els.out.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

function updateCounters(visibleCount) {
  els.countView.textContent = String(tasks.length);
  els.visibleView.textContent = String(visibleCount);
}

function render(list) {
  els.list.innerHTML = "";

  list.forEach(t => {
    const div = document.createElement("div");
    div.className = "task";
    div.innerHTML = `
      <div class="taskTitle">${t.title}</div>
      <div class="meta">
        <span class="chip">status: <b>${t.status}</b></span>
        <span class="chip">priority: <b>${t.priority}</b></span>
      </div>
      <div class="btnLine">
        <button class="secondary" data-done="${t.id}">Done</button>
        <button class="secondary" data-del="${t.id}">Delete</button>
      </div>
    `;
    els.list.appendChild(div);
  });

  // Handlers
  els.list.querySelectorAll("button[data-done]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-done"));
      const task = tasks.find(x => x.id === id);

      // ❗ ДЕФЕКТ 1: Done не змінює статус (логіка не працює)
      // task.status = "done"; // навмисно немає

      setStatus("Статус: Done виконано", "ok");
      print({ action: "done", id, task });
      // ❗ ДЕФЕКТ 2: UI не перерендерюється після зміни (навіть якби була)
    });
  });

  els.list.querySelectorAll("button[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-del"));

      // ❗ ДЕФЕКТ 3: Delete видаляє НЕ той елемент (помилка індексу)
      tasks.splice(0, 1); // має бути фільтрація по id

      setStatus("Статус: Delete виконано", "ok");
      print({ action: "delete", id, tasks });
      render(tasks);
      updateCounters(tasks.length);
    });
  });

  updateCounters(list.length);
}

function applyFilters() {
  const f = els.filter.value;
  const q = els.search.value.trim().toLowerCase();

  let list = [...tasks];

  // ❗ ДЕФЕКТ 4: фільтр done/open переплутаний
  if (f === "open") list = list.filter(x => x.status === "done");
  if (f === "done") list = list.filter(x => x.status === "open");

  // ❗ ДЕФЕКТ 5: пошук чутливий до пробілів (без trim в задачах)
  if (q) list = list.filter(x => x.title.toLowerCase().includes(q));

  render(list);
}

els.addBtn.addEventListener("click", () => {
  const title = els.title.value; // ❗ ДЕФЕКТ 6: title не trim → "   " проходить
  const priority = els.priority.value;

  // ❗ ДЕФЕКТ 7: валідація дозволяє порожню задачу
  const t = {
    id: Date.now(),
    title,
    priority,
    status: "open"
  };

  tasks.push(t);
  setStatus("Статус: задача додана", "ok");
  print({ added: t, tasksCount: tasks.length });

  // ❗ ДЕФЕКТ 8: поле не очищається після додавання
  render(tasks);
});

els.seedBtn.addEventListener("click", () => {
  tasks = [
    { id: 101, title: "Перевірити логін", priority: "P1", status: "open" },
    { id: 102, title: "Перевірити пошук", priority: "P2", status: "open" },
    { id: 103, title: "Перевірити збереження", priority: "P2", status: "done" }
  ];
  setStatus("Статус: seed додано", "muted");
  print(tasks);
  render(tasks);
});

els.saveBtn.addEventListener("click", () => {
  try {
    // ❗ ДЕФЕКТ 9: зберігає у LocalStorage під неправильним ключем
    localStorage.setItem("taskflow_tasks_v2", JSON.stringify(tasks));
    setStatus("Статус: збережено", "ok");
    print({ savedKey: "taskflow_tasks_v2", count: tasks.length });
  } catch (err) {
    console.error("Save error:", err);
    setStatus("Статус: save error", "danger");
  }
});

els.loadBtn.addEventListener("click", () => {
  try {
    // ❗ ДЕФЕКТ 10: намагається завантажити з іншого ключа → не знаходить
    const raw = localStorage.getItem("taskflow_tasks");
    tasks = raw ? JSON.parse(raw) : [];
    setStatus("Статус: завантажено", "ok");
    print({ loadedKey: "taskflow_tasks", count: tasks.length });
    render(tasks);
  } catch (err) {
    console.error("Load error:", err);
    setStatus("Статус: load error", "danger");
  }
});

els.applyBtn.addEventListener("click", () => {
  setStatus("Статус: застосовано фільтри", "muted");
  applyFilters();
});

els.resetBtn.addEventListener("click", () => {
  // ❗ ДЕФЕКТ 11: Reset не скидає фільтр, лише поле пошуку
  els.search.value = "";
  setStatus("Статус: reset виконано", "muted");
  applyFilters();
});

// init
render(tasks);
setStatus("Статус: ready", "muted");
print("Готово. Додайте задачі, перевірте фільтри, Done/Delete, Save/Load (LocalStorage).");
