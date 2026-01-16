// Test Target L04 — Task Board Demo
// Призначення: практика зі створення тест-кейсів.
// Є навмисні "тонкі" місця для негативних сценаріїв.

const titleEl = document.getElementById("title");
const descEl = document.getElementById("desc");
const priorityEl = document.getElementById("priority");
const addBtn = document.getElementById("addBtn");
const statusEl = document.getElementById("status");

const searchEl = document.getElementById("search");
const filterEl = document.getElementById("filter");
const infoEl = document.getElementById("info");

const todoEl = document.getElementById("todo");
const doneEl = document.getElementById("done");

let tasks = [
  { id: 1, title: "Read requirements", desc: "Open About section", priority: "Medium", status: "todo" },
  { id: 2, title: "Create test cases", desc: "At least 10", priority: "High", status: "todo" }
];

let nextId = 3;

function setStatus(msg) {
  statusEl.textContent = msg;
}

function render() {
  todoEl.innerHTML = "";
  doneEl.innerHTML = "";

  const q = searchEl.value.toLowerCase(); // пошук по регістру нормальний
  const filter = filterEl.value;

  let filtered = tasks.filter(t => t.title.toLowerCase().includes(q));

  if (filter !== "all") {
    filtered = filtered.filter(t => t.status === filter);
  }

  infoEl.textContent = `Tasks shown: ${filtered.length}`;

  filtered.forEach(t => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.gap = "10px";

    const text = document.createElement("span");
    text.textContent = `[${t.priority}] ${t.title}`;

    const btn = document.createElement("button");
    btn.className = "btn";
    btn.style.padding = "6px 10px";
    btn.textContent = t.status === "todo" ? "Mark Done" : "Back To Do";

    btn.addEventListener("click", () => {
      // Навмисно: статус змінюється, але повідомлення завжди однакове (UX недолік)
      t.status = t.status === "todo" ? "done" : "todo";
      setStatus("Status updated");
      render();
    });

    li.appendChild(text);
    li.appendChild(btn);

    if (t.status === "todo") todoEl.appendChild(li);
    else doneEl.appendChild(li);
  });
}

addBtn.addEventListener("click", () => {
  const title = titleEl.value;

  // Навмисно слабка перевірка: не використовується trim()
  if (title.length === 0) {
    setStatus("Error: Title is required");
    return;
  }

  tasks.push({
    id: nextId++,
    title: title, // якщо введені пробіли - буде "порожня" задача
    desc: descEl.value,
    priority: priorityEl.value,
    status: "todo"
  });

  setStatus("Task added");
  titleEl.value = "";
  descEl.value = "";
  priorityEl.value = "Medium";
  render();
});

searchEl.addEventListener("input", render);
filterEl.addEventListener("change", render);

// Start
setStatus("Ready");
render();
