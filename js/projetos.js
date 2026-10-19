document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".projeto-card");
  const emptyMessage = document.getElementById("projetosEmpty");

  if (!filterButtons.length || !projectCards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Atualiza estado ativo nos botões
      filterButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");

      const selectedFilter = button.dataset.filter || "todos";
      let visibleCount = 0;

      projectCards.forEach((card) => {
        const category = card.dataset.category || "";
        const matches = selectedFilter === "todos" || category === selectedFilter;

        if (matches) {
          card.style.display = "";
          card.style.opacity = "1";
          visibleCount++;
        } else {
          card.style.display = "none";
          card.style.opacity = "0";
        }
      });

      if (emptyMessage) {
        emptyMessage.style.display = visibleCount === 0 ? "block" : "none";
      }
    });
  });
});
