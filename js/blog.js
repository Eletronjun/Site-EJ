document.addEventListener("DOMContentLoaded", () => {

    const categoryButtons = document.querySelectorAll(".category-item");
    const searchInput = document.querySelector(".search-bar");
    const postCards = document.querySelectorAll(".post-card");

    let activeCategory = "todos";
    let searchTerm = "";

    function applyFilters() {
        postCards.forEach((card) => {
            const cardCategory = card.dataset.category || "";
            const cardTitle = card.querySelector(".post-title").textContent.toLowerCase();

            const matchesCategory = activeCategory === "todos" || cardCategory === activeCategory;
            const matchesSearch = cardTitle.includes(searchTerm);

            card.style.display = matchesCategory && matchesSearch ? "" : "none";
        });
    }

    categoryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            categoryButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");

            activeCategory = button.dataset.filter;

            applyFilters();
        });
    });

    if(searchInput) { 
        searchInput.addEventListener("input", (event) => {
            searchTerm = event.target.value.trim(). toLowerCase();
            applyFilters();
        });
    }

    const newsletterForm = document.querySelector(".newsletter-form");
    const newsletterButton = newsletterForm?.querySelector("button");
    const newsletterInput = document.getElementById("newsletter-email");

    newsletterButton?.addEventListener("click", () => {
    const email = newsletterInput.value.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
        newsletterInput.focus();
        newsletterInput.setCustomValidity("Digite um e-mail válido.");
        newsletterInput.reportValidity();
        return;
    }

    newsletterInput.setCustomValidity("");
    alert("Inscrição recebida! (isso ainda é só um placeholder)");
    newsletterInput.value = "";
    });

});