/**
 * EletronJun — Componentes Web Modulares (Web Components Vanilla)
 *
 * Reutiliza Cabeçalho, Rodapé, Botão Flutuante do WhatsApp e
 * Gerenciador de Tema (Dark Mode / Light Mode).
 *
 * Suporte a detecção automática de preferência do dispositivo
 * (prefers-color-scheme) e persistência via localStorage.
 */

(() => {
  "use strict";

  /* ==========================================================================
     Gerenciamento de Tema (Dark Mode / Light Mode)
     ========================================================================== */
  const THEME_STORAGE_KEY = "ej-theme-preference";

  const getSystemTheme = () => {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const getSavedTheme = () => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const getCurrentTheme = () => {
    return document.documentElement.getAttribute("data-theme") || getSavedTheme() || getSystemTheme();
  };

  const applyTheme = (theme, save = true) => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;

    if (save) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        // localStorage indisponível (navegação anônima restrita etc.)
      }
    }

    // Atualiza o estado acessível dos botões de alternância na página
    const isDark = theme === "dark";
    const label = isDark ? "Mudar para modo claro" : "Mudar para modo escuro";
    const title = isDark ? "Ativar modo claro" : "Ativar modo escuro";

    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", title);
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
    });
  };

  const toggleTheme = () => {
    const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
  };

  // Expor helpers globalmente para outros scripts se necessário
  window.__ejToggleTheme = toggleTheme;
  window.__ejApplyTheme = applyTheme;

  // Aplicação IMEDIATA (executa durante o parse do head para evitar FOUC)
  const initialTheme = getSavedTheme() || getSystemTheme();
  applyTheme(initialTheme, false);

  // Escutar mudanças no tema do sistema operacional/dispositivo
  if (window.matchMedia) {
    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemChange = (e) => {
        // Se o usuário NÃO definiu manualmente uma preferência no localStorage, segue o dispositivo
        if (!getSavedTheme()) {
          applyTheme(e.matches ? "dark" : "light", false);
        }
      };
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleSystemChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSystemChange);
      }
    } catch {
      // Ignora navegadores antigos sem suporte
    }
  }

  // Sincronizar tema entre abas abertas
  window.addEventListener("storage", (e) => {
    if (e.key === THEME_STORAGE_KEY) {
      const newTheme = e.newValue || getSystemTheme();
      applyTheme(newTheme, false);
    }
  });

  /* ==========================================================================
     Helpers de Resolução de Caminhos
     ========================================================================== */
  const resolveRoot = (el) => {
    if (el.hasAttribute("data-root")) {
      return el.getAttribute("data-root");
    }
    const path = window.location.pathname;
    return path.includes("/pages/") ? "../" : "./";
  };

  const resolveActive = (el) => {
    if (el.hasAttribute("data-active")) {
      return el.getAttribute("data-active");
    }
    const path = window.location.pathname.toLowerCase();
    if (path.includes("sobre")) return "sobre";
    if (path.includes("servicos")) return "servicos";
    if (path.includes("blog") || path.includes("artigo")) return "blog";
    if (path.includes("projetos")) return "projetos";
    if (path.includes("diagnostico")) return "diagnostico";
    return "inicio";
  };

  /* ==========================================================================
     <site-header>
     ========================================================================== */
  class SiteHeader extends HTMLElement {
    connectedCallback() {
      this.style.display = "contents";

      const root = resolveRoot(this);
      const active = resolveActive(this);
      const isHome = active === "inicio";
      const homeHref = isHome ? "#top" : `${root}index.html`;

      const currentTheme = getCurrentTheme();
      const isDark = currentTheme === "dark";
      const toggleLabel = isDark ? "Mudar para modo claro" : "Mudar para modo escuro";
      const toggleTitle = isDark ? "Ativar modo claro" : "Ativar modo escuro";

      this.innerHTML = `
        <header class="site-header" id="header">
          <div class="container header-inner">
            <a href="${homeHref}" class="logo" aria-label="EletronJun — página inicial">
              <img class="logo-img logo-light" src="${root}assets/logo-full.png" alt="EletronJun" width="1400" height="304">
              <img class="logo-img logo-dark" src="${root}assets/logo-footer.svg" alt="EletronJun" width="338" height="71">
            </a>

            <div class="header-right">
              <nav class="nav" id="primaryNav">
                <ul class="nav-list">
                  <li><a href="${homeHref}" class="nav-link ${active === 'inicio' ? 'active' : ''}">Início</a></li>
                  <li><a href="${root}pages/sobre.html" class="nav-link ${active === 'sobre' ? 'active' : ''}">Sobre Nós</a></li>
                  <li><a href="${root}servicos.html" class="nav-link ${active === 'servicos' ? 'active' : ''}">Serviços</a></li>
                  <li><a href="${root}pages/blog.html" class="nav-link ${active === 'blog' ? 'active' : ''}">Blog</a></li>
                  <li><a href="${root}pages/projetos.html" class="nav-link ${active === 'projetos' ? 'active' : ''}">Projetos</a></li>
                </ul>
                <a href="${root}pages/diagnostico.html" class="btn btn-primary btn-sm nav-cta ${active === 'diagnostico' ? 'active' : ''}">Diagnóstico Gratuito</a>
              </nav>

              <button class="theme-toggle" id="themeToggle" type="button" aria-label="${toggleLabel}" title="${toggleTitle}" aria-pressed="${isDark ? 'true' : 'false'}">
                <svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              </button>

              <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="primaryNav" aria-label="Abrir menu de navegação">
                <span></span><span></span><span></span>
              </button>
            </div>
          </div>
        </header>
      `;

      const themeBtn = this.querySelector("#themeToggle");
      if (themeBtn) {
        themeBtn.addEventListener("click", () => {
          toggleTheme();
        });
      }
    }
  }

  /* ==========================================================================
     <site-footer>
     ========================================================================== */
  class SiteFooter extends HTMLElement {
    connectedCallback() {
      this.style.display = "contents";

      const root = resolveRoot(this);
      const active = resolveActive(this);
      const isHome = active === "inicio";
      const homeHref = isHome ? "#top" : `${root}index.html`;

      this.innerHTML = `
        <footer class="site-footer">
          <div class="container footer-inner">
            <div class="footer-brand">
              <a href="${homeHref}" class="logo" aria-label="EletronJun — início">
                <img class="logo-img footer-logo" src="${root}assets/logo-footer.svg" alt="EletronJun" width="338" height="71">
              </a>
              <p>Empresa Júnior de Engenharia Eletrônica e de Software da Universidade de Brasília.</p>
            </div>

            <nav class="footer-nav" aria-label="Links do rodapé">
              <a href="${homeHref}">Início</a>
              <a href="${root}pages/sobre.html">Sobre Nós</a>
              <a href="${root}servicos.html">Serviços</a>
              <a href="${root}pages/blog.html">Blog</a>
              <a href="${root}pages/projetos.html">Projetos</a>
              <a href="${root}pages/diagnostico.html">Diagnóstico Gratuito</a>
            </nav>

            <div class="footer-social">
              <a href="https://www.instagram.com/eletronjun/" aria-label="Instagram" class="social-icon" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/eletronjun/" aria-label="LinkedIn" class="social-icon" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="8" y1="11" x2="8" y2="17"/><line x1="8" y1="7.5" x2="8" y2="7.51"/><path d="M12 17v-3.5a2.5 2.5 0 0 1 5 0V17"/></svg>
              </a>
              <a href="https://www.facebook.com/eletronjun" aria-label="Facebook" class="social-icon" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>
          <div class="footer-bottom">
            <div class="container">
              <p>© 2026 EletronJun — Empresa Júnior de Engenharia Eletrônica e de Software. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      `;
    }
  }

  /* ==========================================================================
     <site-whatsapp> (e alias <whatsapp-btn>)
     ========================================================================== */
  class SiteWhatsapp extends HTMLElement {
    connectedCallback() {
      this.style.display = "contents";

      this.innerHTML = `
        <a class="whatsapp-float" href="https://wa.me/5561974027117" target="_blank" rel="noopener" aria-label="Fale conosco pelo WhatsApp">
          <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
            <path d="M16 4C9.4 4 4 9.4 4 16c0 2.4.7 4.6 1.9 6.5L4 28l5.7-1.8C11.5 27.3 13.7 28 16 28c6.6 0 12-5.4 12-12S22.6 4 16 4Zm0 21.8c-2 0-3.9-.6-5.5-1.6l-.4-.2-3.4 1.1 1.1-3.3-.2-.4C6.6 19.9 6 18 6 16c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 9.8-10 9.8Zm5.4-7.3c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3Z"/>
          </svg>
        </a>
      `;
    }
  }

  /* Registro dos elementos personalizados */
  if (!customElements.get("site-header")) {
    customElements.define("site-header", SiteHeader);
  }
  if (!customElements.get("site-footer")) {
    customElements.define("site-footer", SiteFooter);
  }
  if (!customElements.get("site-whatsapp")) {
    customElements.define("site-whatsapp", SiteWhatsapp);
  }
  if (!customElements.get("whatsapp-btn")) {
    customElements.define("whatsapp-btn", SiteWhatsapp);
  }
})();
