(function () {
  const FELLOW_STORAGE_KEY = "innocore-fellow-profiles";

  const state = {
    lang: localStorage.getItem("innocore-lang") || "ko",
  };

  const content = () => window.INNOCORE_CONTENT[state.lang] || window.INNOCORE_CONTENT.ko;

  function readFellowProfiles() {
    try {
      const stored = JSON.parse(localStorage.getItem(FELLOW_STORAGE_KEY) || "null");
      return Array.isArray(stored) ? stored : content().fellowProfiles || [];
    } catch {
      return content().fellowProfiles || [];
    }
  }

  function linkElement(item, className) {
    const link = document.createElement("a");
    link.className = className;
    link.href = item.href;
    link.textContent = item.label;
    if (/^https?:\/\//.test(item.href) && !item.sameTab) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    return link;
  }

  function pageHref(href) {
    return href.startsWith("#") ? `./index.html${href}` : href;
  }

  function populateFields() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-field]").forEach((element) => {
      const key = element.getAttribute("data-field");
      element.textContent = content()[key] || "";
    });
  }

  function renderNav() {
    const navItems = content().nav.map((item) => ({ ...item, href: pageHref(item.href) }));
    document.querySelector(".site-nav").replaceChildren(
      ...navItems.map((item) => linkElement(item, "nav-link"))
    );
    const headerCta = document.querySelector(".header-cta");
    headerCta.textContent = content().headerCta;
  }

  function metaItem(label, value) {
    const item = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value || "-";
    item.append(term, description);
    return item;
  }

  function renderProfiles() {
    const labels = content().fellowProfileLabels || {};
    const cards = readFellowProfiles().map((profile) => {
      const article = document.createElement("article");
      const photo = document.createElement("figure");
      const image = document.createElement("img");
      const body = document.createElement("div");
      const status = document.createElement("span");
      const title = document.createElement("h2");
      const nameEn = document.createElement("p");
      const meta = document.createElement("dl");
      const summary = document.createElement("p");

      article.className = "fellow-card";
      photo.className = "fellow-photo";
      image.src = profile.image || "./assets/fellow-placeholder.svg";
      image.alt = "";
      photo.append(image);

      body.className = "fellow-card-body";
      status.className = "fellow-status";
      status.textContent = profile.status || labels.status || "";
      title.textContent = profile.name || "";
      nameEn.className = "fellow-name-en";
      nameEn.textContent = profile.nameEn || "";
      meta.className = "fellow-meta";
      meta.append(
        metaItem(labels.currentPi || "Current PI", profile.currentPi),
        metaItem(labels.researchArea || "Research Area", profile.researchArea),
        metaItem(labels.affiliation || "Affiliation", profile.affiliation)
      );
      summary.className = "fellow-summary";
      summary.textContent = profile.summary || "";

      body.append(status, title, nameEn, meta, summary);
      article.append(photo, body);
      return article;
    });

    document.querySelector(".fellow-list").replaceChildren(...cards);
  }

  function syncButtons() {
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === state.lang));
    });
  }

  function render() {
    populateFields();
    renderNav();
    renderProfiles();
    document.title = `${content().fellowPageTitle} | DGIST InnoCORE`;
    syncButtons();
  }

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      state.lang = button.dataset.lang;
      localStorage.setItem("innocore-lang", state.lang);
      render();
    });
  });

  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    header.dataset.elevated = String(window.scrollY > 24);
  });

  render();
})();
