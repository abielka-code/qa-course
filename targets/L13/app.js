(function () {
  const cartCountEl = document.getElementById("cartCount");
  const screenLabelEl = document.getElementById("screenLabel");
  const searchInput = document.getElementById("searchInput");
  const btnClear = document.getElementById("btnClear");
  const cards = Array.from(document.querySelectorAll(".cardItem"));
  const addButtons = Array.from(document.querySelectorAll(".btnAdd"));

  let cart = 0;

  function updateScreenLabel() {
    const w = window.innerWidth;
    // Просто підказка для студента (не тестова вимога)
    if (w <= 420) screenLabelEl.textContent = "360";
    else if (w <= 820) screenLabelEl.textContent = "768";
    else screenLabelEl.textContent = "1280+";
  }

  // BUG (Logic UX): пошук case-sensitive, хоча очікується case-insensitive
  function applySearch() {
    const q = String(searchInput.value || "");
    cards.forEach((card) => {
      const title = card.getAttribute("data-title") || "";
      const match = title.includes(q); // <- навмисно case-sensitive
      card.style.display = match ? "" : "none";
    });
  }

  // BUG (Logic): Cart count інколи не оновлюється після другого кліку (імітація)
  // Для навчальної задачі: студент має перевірити стабільність лічильника
  addButtons.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      cart++;

      // навмисна "нестабільність" на одному з товарів
      if (idx === 2 && cart % 2 === 0) {
        // не оновлюємо лічильник
        return;
      }

      cartCountEl.textContent = String(cart);
    });
  });

  searchInput.addEventListener("input", applySearch);
  btnClear.addEventListener("click", () => {
    searchInput.value = "";
    applySearch();
  });

  window.addEventListener("resize", updateScreenLabel);
  updateScreenLabel();
})();
