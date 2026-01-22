// SV03 Target: TaskFlow (навчальний сайт з дефектами)
// Студенти НЕ пишуть код — лише тестують і документують.

const els = {
  taskTitle: document.getElementById("taskTitle"),
  priority: document.getElementById("priority"),
  filter: document.getElementById("filter"),
  addBtn: document.getElementById("addBtn"),
  search: document.getElementById("search"),
  syncBtn: document.getElementById("syncBtn"),
  clearBtn: document.getElementById("clearBtn"),
  list: document.getElementById("list"),
  status: document.getElementById("status"),
  totalCount: document.getElementById("totalCount"),
  activeCount: document.getElementById("activeCount"),
  doneCount: document.getElementById("doneCount"),
};

let tasks = [
  { id: 1, title: "Перевірити додавання задачі", priority: "normal", done: false },
  { id: 2, title: "Перевірити фільтр Готові", priority: "high", done: true },
  { id: 3, title: "Перевірити Network під час синхронізації", priority: "low", done: false },
];

function render() {
  const filter = els.filter.value;
  const q = els.search.value.trim().toLowerCase();

  // ❗ Дефект 1: фільтр done працює навпаки (показує active)
  let filtered = tasks.filter(t => {
    if (filter === "all") return true;
    if (filter === "active") return t.done === false;
    if (filter === "done") return t.done === false; // <- має бути true, але навмисно помилка
    return true;
  });

  // Пошук
  if (q.length > 0) {
    filtered = filtered.filter(t => t.title.toLowerCase().includes(q));
  }

  els.list.innerHTML = "";

  filtered.forEach(t => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="left">
        <input type="checkbox" class="toggle" data-id="${t.id}" ${t.done ? "checked" : ""} />
        <div style="min-width:0;">
          <div class="title">${t.title}</div>
          <div class="muted" style="font-size:12px;">
            Пріоритет: <span class="tag">${t.priority}</span>
            <span style="margin-left:8px;">Статус: ${t.done ? "Готово" : "Активна"}</span>
          </div>
        </div>
      </div>
      <div class="actions">
        <button class="mini secondary rename" data-id="${t.id}">Перейменувати</button>
        <button class="mini delete" data-id="${t.id}">Видалити</button>
      </div>
    `;
    els.list.appendChild(div);
  });

  updateCounters();
}

function updateCounters() {
  els.totalCount.textContent = String(tasks.length);
  const active = tasks.filter(t => !t.done).length;
  const done = tasks.filter(t => t.done).length;

  // ❗ Дефект 2: лічильники active/done переплутані місцями
  els.activeCount.textContent = String(done);
  els.doneCount.textContent = String(active);
}

// -------------------------
// Додати задачу
// -------------------------
els.addBtn.addEventListener("click", () => {
  const title = els.taskTitle.value; // ❗ Дефект 3: немає trim/валідації → можна додати порожню задачу
  const priority = els.priority.value;

  const newTask = {
    id: Date.now(),
    title: title,
    priority,
    done: false
  };

  tasks.unshift(newTask);
  els.taskTitle.value = "";
  els.status.textContent = "Статус: задачу додано";

  render();
});

// -------------------------
// Дії у списку
// -------------------------
els.list.addEventListener("click", (e) => {
  const toggle = e.target.closest(".toggle");
  const delBtn = e.target.closest(".delete");
  const renameBtn = e.target.closest(".rename");

  if (toggle) {
    const id = Number(toggle.dataset.id);
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.done = toggle.checked;

    // ❗ Дефект 4: викликаємо неіснуючу функцію → Console error після зміни статусу
    refreshStatistics(); // ReferenceError

    els.status.textContent = "Статус: статус оновлено";
    render();
    return;
  }

  if (renameBtn) {
    const id = Number(renameBtn.dataset.id);
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newTitle = prompt("Нова назва задачі:", task.title);
    if (newTitle !== null) {
      task.title = newTitle; // ❗ немає валідації довжини/порожнього значення (додатковий простий дефект)
      els.status.textContent = "Статус: задачу перейменовано";
      render();
    }
    return;
  }

  if (delBtn) {
    const id = Number(delBtn.dataset.id);

    // ❗ Дефект 5: видалення “наче працює”, але насправді масив не змінюється (логічна помилка)
    tasks.filter(t => t.id !== id); // <- результат не присвоєно

    els.status.textContent = "Статус: задачу видалено";
    render();
    return;
  }
});

// -------------------------
// Пошук/фільтр
// -------------------------
els.search.addEventListener("input", () => render());
els.filter.addEventListener("change", () => render());

// -------------------------
// Очистити всі
// -------------------------
els.clearBtn.addEventListener("click", () => {
  tasks = [];
  els.status.textContent = "Статус: список очищено";
  render();
});

// -------------------------
// Синхронізація (імітація API)
// -------------------------
els.syncBtn.addEventListener("click", async () => {
  els.status.textContent = "Статус: синхронізація...";

  try {
    // ❗ Дефект 6: endpoint не існує → Network 404
    const res = await fetch("/api/tasks/sync", { method: "POST" });

    // ❗ додатково: неправильна логіка інтерпретації відповіді (навіть при !ok намагається парсити json)
    const data = await res.json();

    els.status.innerHTML = `<span class="ok">Статус: синхронізацію виконано</span> (отримано ${data.count})`;
  } catch (err) {
    console.error("Sync error:", err);
    els.status.innerHTML = `<span class="danger">Статус: помилка синхронізації</span>`;
  }
});

// Перший рендер
render();
