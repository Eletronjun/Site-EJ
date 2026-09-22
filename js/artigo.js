document.addEventListener("DOMContentLoaded", () => {

    const progressBar = document.getElementById("readingProgress");

    if (progressBar) {
        window.addEventListener("scroll", () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

            progressBar.style.width = scrollPercent + "%";
        });
    }

    const sections = document.querySelectorAll(".article-content h2[id]");
    const indexLinks = document.querySelectorAll(".index-nav a");

    if (sections.length === 0 || indexLinks.length === 0) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute("id");

                    indexLinks.forEach((link) => link.classList.remove("active-index-link"));

                    const activeLink = document.querySelector(`.index-nav a[href="#${id}"]`);
                    activeLink?.classList.add("active-index-link");
                }
            });
        },
        {
            rootMargin: "-100px 0px -70% 0px",
        }
    );

    sections.forEach((section) => observer.observe(section));
});