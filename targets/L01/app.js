// Test Target L01 — Quick Notes
// Навчальна логіка навмисно проста.
// У деяких місцях є спрощення/недоліки, щоб студентам було що перевіряти.

const noteText = document.getElementById("noteText");
const searchText = document.getElementById("searchText");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");
const status = document.getElementById("status");

// Початкові дані
let notes = [
  { id: 1, text: "Ознайомитися з інтерфейсом", important: false },
  { id: 2, text: "Зробити 4 скріншоти", important: true },
];

let nextId = 3;

function setStatus(message) {
  status.textContent = message;
}

function render() {
  const query = searchText.value; // навмисно без trim(), щоб студент міг це помітити
  list.innerHTML = "";

  const filtered = notes.filter(n =>
    n.text.toLowerCase().includes(query.toLowerCase())
  );

  // Якщо нічого немає — поки що просто порожній список (це “потенційний дефект UX”)
  filtered.forEach(n => {
    const li = document.createElement("li");

    const title = document.createElement("span");
    title.textContent = n.text + (n.important ? " (важливо)" : "");
    title.style.cursor = "pointer";

    // Перемикач important при кліку на текст
    title.addEventListener("click", () => {
      n.important = !n.important;
      setStatus("Статус: змінено прапорець важливості");
      render();
    });

    li.appendChild(title);
    list.appendChild(li);
  });
}

addBtn.addEventListener("click", () => {
  const text = noteText.value;

  // Навмисно мінімальна валідація:
  // якщо користувач введе тільки пробіли — нотатка додасться (це дефект для наступних ЛР)
  if (text.length === 0) {
    setStatus("Помилка: порожній текст");
    return;
  }

  notes.push({
    id: nextId++,
    text,
    important: false
  });

  setStatus("Успіх: нотатку додано");
  noteText.value = "";
  render();
});

searchText.addEventListener("input", () => {
  setStatus("Пошук застосовано");
  render();
});

// Старт
setStatus("Готово до тестування");
render();
