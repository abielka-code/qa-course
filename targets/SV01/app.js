(function () {
  const searchEl = document.getElementById("search");
  const btnClear = document.getElementById("btnClear");
  const btnAddOpen = document.getElementById("btnAddOpen");
  const btnExport = document.getElementById("btnExport");

  const termsList = document.getElementById("termsList");
  const countTag = document.getElementById("countTag");
  const filterTag = document.getElementById("filterTag");

  const btnQuizStart = document.getElementById("btnQuizStart");
  const btnQuizReset = document.getElementById("btnQuizReset");
  const quizTag = document.getElementById("quizTag");
  const scoreTag = document.getElementById("scoreTag");
  const questionText = document.getElementById("questionText");
  const answersBox = document.getElementById("answersBox");

  const debugBox = document.getElementById("debugBox");

  const toast = document.getElementById("toast");
  const toastTitle = document.getElementById("toastTitle");
  const toastMsg = document.getElementById("toastMsg");

  let score = 0;
  let currentQ = null;

  const terms = [
    { term: "Bug", def: "Дефект: відхилення фактичного результату від очікуваного." },
    { term: "Severity", def: "Критичність дефекту: наскільки сильно він впливає." },
    { term: "Priority", def: "Пріоритет виправлення: наскільки терміново виправляти." },
    { term: "Regression", def: "Перевірка, що старий функціонал не зламався після змін." },
    { term: "Smoke", def: "Швидка перевірка базової працездатності ключових функцій." },
    { term: "Test case", def: "Формалізований сценарій перевірки з кроками, даними та очікуванням." }
  ];

  function showToast(t, m) {
    toastTitle.textContent = t;
    toastMsg.textContent = m;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function appendLog(line) {
    const now = new Date();
    const t = now.toLocaleTimeString();
    const curr = debugBox.textContent.trimEnd();
    debugBox.textContent = `${curr}\n[${t}] ${line}`;
  }

  function renderList(list) {
    termsList.innerHTML = "";
    list.forEach((x) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div>
          <p class="title">${x.term}</p>
          <div class="meta">${x.def}</div>
        </div>
        <span class="tag">QA</span>
      `;
      termsList.appendChild(div);
    });
    countTag.textContent = `Terms: ${list.length}`;
  }

  function applySearch() {
    const q = String(searchEl.value || "");

    // BUG #1 (Logic): пошук case-sensitive (залежить від регістру)
    // Очікування: має бути case-insensitive
    const filtered = terms.filter((x) => x.term.includes(q));

    filterTag.textContent = `Filter: ${q ? q : "—"}`;
    renderList(filtered);
  }

  function openAddDialog() {
    const t = prompt("Enter new term title:");
    const d = prompt("Enter definition:");

    // BUG #2 (Validation): можна додати порожню назву або порожній опис
    // Очікування: обидва поля обов’язкові
    terms.unshift({ term: String(t || ""), def: String(d || "") });

    showToast("Saved", "Term added.");
    applySearch();
  }

  function resetQuiz() {
    score = 0;
    currentQ = null;
    scoreTag.textContent = "Score: 0";
    quizTag.textContent = "Quiz: Ready";
    questionText.textContent = "Натисніть “Start quiz” для початку.";
    answersBox.innerHTML = "";

    // BUG #3 (Console): після Reset — помилка в консолі (для навчання пошуку доказів)
    console.error("Quiz reset error: state was not cleared properly (demo)");
  }

  function pickQuestion() {
    const defs = terms.map((x) => x.def);
    const correctIndex = Math.floor(Math.random() * terms.length);
    const correct = terms[correctIndex];

    // 4 варіанти відповіді (1 правильний + 3 випадкові)
    const options = [correct.def];
    while (options.length < 4) {
      const cand = defs[Math.floor(Math.random() * defs.length)];
      if (!options.includes(cand)) options.push(cand);
    }
    options.sort(() => Math.random() - 0.5);

    return { term: correct.term, correct: correct.def, options };
  }

  function startQuiz() {
    quizTag.textContent = "Quiz: Active";
    currentQ = pickQuestion();
    questionText.textContent = `Що означає термін: "${currentQ.term}"?`;

    answersBox.innerHTML = "";
    currentQ.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btnMini";
      btn.textContent = opt;

      btn.addEventListener("click", () => {
        // BUG #4 (Logic): правильна відповідь збільшує Score на 2 замість 1
        // Очікування: +1
        if (opt === currentQ.correct) {
          score += 2; // навмисна помилка
          scoreTag.textContent = `Score: ${score}`;
          showToast("Correct", "Score increased.");
        } else {
          showToast("Wrong", "Try again.");
        }
      });

      answersBox.appendChild(btn);
    });

    // BUG #5 (Network): старт квізу робить зайвий запит на неіснуючий endpoint (404 у Network)
    // Очікування: або не робити запит, або мати 200
    fetch("./api/quiz/start", { method: "POST" })
      .then((r) => {
        appendLog(`POST ./api/quiz/start -> status=${r.status}`);
      })
      .catch((e) => {
        appendLog(`POST ./api/quiz/start -> ERROR: ${String(e)}`);
      });
  }

  async function exportCSV() {
    // BUG #6 (Network/UX): експорт робить GET на неіснуючий endpoint -> 404
    // Очікування: успішний експорт або чітке повідомлення
    const url = "./api/export/csv";
    appendLog(`GET ${url} (export)`);

    try {
      const res = await fetch(url);
      appendLog(`RESPONSE export -> status=${res.status}`);

      if (!res.ok) {
        showToast("Export failed", "Check Network for details.");
        return;
      }

      showToast("Export", "File downloaded.");
    } catch (err) {
      console.error("Export error:", err);
      showToast("Export crashed", "Check Console.");
    }
  }

  // Init
  renderList(terms);
  filterTag.textContent = "Filter: —";

  searchEl.addEventListener("input", applySearch);
  btnClear.addEventListener("click", () => {
    searchEl.value = "";
    applySearch();
  });

  btnAddOpen.addEventListener("click", openAddDialog);
  btnQuizStart.addEventListener("click", startQuiz);
  btnQuizReset.addEventListener("click", resetQuiz);
  btnExport.addEventListener("click", exportCSV);

  // BUG (Network): фоновий запит метрик (404 у Network при відкритті сторінки)
  fetch("./api/metrics/ping")
    .then((r) => appendLog(`GET ./api/metrics/ping -> status=${r.status}`))
    .catch((e) => appendLog(`GET ./api/metrics/ping -> ERROR: ${String(e)}`));
})();
