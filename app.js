(function () {
  const state = {
    lang: localStorage.getItem("innocore-lang") || "ko",
  };

  const content = () => window.INNOCORE_CONTENT[state.lang] || window.INNOCORE_CONTENT.ko;

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value || "";
  }

  function populateFields() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-field]").forEach((element) => {
      const key = element.getAttribute("data-field");
      element.textContent = content()[key] || "";
    });
  }

  function linkElement(item, className) {
    const link = document.createElement("a");
    link.className = className;
    link.href = item.href;
    link.textContent = item.label;
    if (/^https?:\/\//.test(item.href)) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    return link;
  }

  function renderNav() {
    const nav = document.querySelector(".site-nav");
    nav.replaceChildren(...content().nav.map((item) => linkElement(item, "nav-link")));
  }

  function renderFacts() {
    const facts = content().facts.map((item) => {
      const article = document.createElement("article");
      const value = document.createElement("strong");
      const label = document.createElement("span");
      value.textContent = item.value;
      label.textContent = item.label;
      article.append(value, label);
      return article;
    });
    document.querySelector(".quick-facts").replaceChildren(...facts);
  }

  function renderResearch() {
    const cards = content().research.map((item, index) => {
      const article = document.createElement("article");
      const number = document.createElement("span");
      const title = document.createElement("h3");
      const problem = document.createElement("p");
      const solution = document.createElement("p");
      number.className = "item-number";
      number.textContent = String(index + 1).padStart(2, "0");
      title.textContent = item.title;
      problem.textContent = item.problem;
      solution.textContent = item.solution;
      solution.className = "solution";
      article.append(number, title, problem, solution);
      return article;
    });
    document.querySelector(".research-grid").replaceChildren(...cards);
  }

  function renderHowApply() {
    const steps = content().howApply.map((item) => {
      const article = document.createElement("article");
      const title = document.createElement("h3");
      const body = document.createElement("p");
      title.textContent = item.title;
      body.textContent = item.body;
      article.append(title, body);
      return article;
    });
    document.querySelector(".how-steps").replaceChildren(...steps);

    const requirements = content().requirements.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    });
    document.querySelector(".requirements-list").replaceChildren(...requirements);
  }

  function renderCenter() {
    const director = content().director;
    const directorCard = document.querySelector(".director-card");
    const directorKicker = document.createElement("span");
    const directorName = document.createElement("h3");
    const directorTitle = document.createElement("strong");
    const directorBody = document.createElement("p");
    directorKicker.textContent = director.kicker;
    directorName.textContent = director.name;
    directorTitle.textContent = director.title;
    directorBody.textContent = director.body;
    directorCard.replaceChildren(directorKicker, directorName, directorTitle, directorBody);

    const details = content().centerDetails.map((item) => {
      const article = document.createElement("article");
      const label = document.createElement("span");
      const value = document.createElement("strong");
      label.textContent = item.label;
      value.textContent = item.value;
      article.append(label, value);
      return article;
    });
    document.querySelector(".detail-grid").replaceChildren(...details);

    const teamTitle = document.createElement("h3");
    teamTitle.textContent = content().teamsTitle;
    const teams = content().teams.map((item) => {
      const article = document.createElement("article");
      const title = document.createElement("strong");
      const body = document.createElement("span");
      title.textContent = item.title;
      body.textContent = item.body;
      article.append(title, body);
      return article;
    });
    document.querySelector(".team-grid").replaceChildren(teamTitle, ...teams);

    const linksTitle = document.createElement("h3");
    linksTitle.textContent = content().relatedLinksTitle;
    const links = content().relatedLinks.map((item) => linkElement(item, "related-link"));
    document.querySelector(".related-links").replaceChildren(linksTitle, ...links);
  }

  function renderMentors() {
    const table = document.querySelector(".mentor-table");
    const existingColGroup = table.querySelector("colgroup");
    if (existingColGroup) existingColGroup.remove();

    const colGroup = document.createElement("colgroup");
    ["role", "name", "name-en", "affiliation", "department", "website"].forEach((name) => {
      const col = document.createElement("col");
      col.className = `mentor-col-${name}`;
      colGroup.append(col);
    });
    table.prepend(colGroup);

    const headRow = document.createElement("tr");
    content().mentorColumns.forEach((label) => {
      const th = document.createElement("th");
      th.textContent = label;
      headRow.append(th);
    });
    document.querySelector(".mentor-table thead").replaceChildren(headRow);

    const rows = content().mentors.map((mentor) => {
      const row = document.createElement("tr");
      ["role", "name", "nameEn", "affiliation", "department"].forEach((key) => {
        const cell = document.createElement("td");
        cell.textContent = mentor[key] || "";
        row.append(cell);
      });
      const linkCell = document.createElement("td");
      if (mentor.url) {
        const link = linkElement(
          { label: state.lang === "ko" ? "웹사이트" : "Website", href: mentor.url },
          "table-link"
        );
        linkCell.append(link);
      } else {
        linkCell.textContent = "-";
      }
      row.append(linkCell);
      return row;
    });
    document.querySelector(".mentor-table tbody").replaceChildren(...rows);
  }

  function renderNews() {
    const items = content().news.map((item) => {
      const link = linkElement(item, "news-item");
      const date = document.createElement("span");
      const title = document.createElement("strong");
      date.textContent = item.date;
      title.textContent = item.title;
      link.replaceChildren(date, title);
      return link;
    });
    document.querySelector(".news-list").replaceChildren(...items);
  }

  function renderProcess() {
    const steps = content().process.map((label, index) => {
      const item = document.createElement("article");
      const marker = document.createElement("span");
      const text = document.createElement("strong");
      marker.textContent = String(index + 1).padStart(2, "0");
      text.textContent = label;
      item.append(marker, text);
      return item;
    });
    document.querySelector(".process-steps").replaceChildren(...steps);
  }

  function renderSimpleGrid(selector, key) {
    const cards = content()[key].map((item) => {
      const article = document.createElement("article");
      const title = document.createElement("h3");
      const body = document.createElement("p");
      title.textContent = item.title;
      body.textContent = item.body;
      article.append(title, body);
      return article;
    });
    document.querySelector(selector).replaceChildren(...cards);
  }

  function renderApplyActions() {
    const actions = content().applyActions.map((item, index) =>
      linkElement(item, index === 0 ? "primary-action" : "secondary-action")
    );
    document.querySelector(".apply-actions").replaceChildren(...actions);
  }

  function syncButtons() {
    document.querySelectorAll("[data-lang]").forEach((button) => {
      const active = button.dataset.lang === state.lang;
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function render() {
    populateFields();
    renderNav();
    renderFacts();
    renderHowApply();
    renderCenter();
    renderResearch();
    renderProcess();
    renderSimpleGrid(".support-grid", "support");
    renderMentors();
    renderNews();
    renderApplyActions();
    setText(".header-cta", content().headerCta);
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
