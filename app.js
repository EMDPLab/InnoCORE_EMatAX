(function () {
  const MENTOR_STATUS_STORAGE_KEY = "innocore-mentor-recruiting-statuses";
  const NEWS_STORAGE_KEY = "innocore-news-items";

  const state = {
    lang: localStorage.getItem("innocore-lang") || "ko",
  };

  const content = () => window.INNOCORE_CONTENT[state.lang] || window.INNOCORE_CONTENT.ko;

  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

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
    if (/^https?:\/\//.test(item.href) && !item.sameTab) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    return link;
  }

  function readMentorStatusOverrides() {
    try {
      const stored = JSON.parse(localStorage.getItem(MENTOR_STATUS_STORAGE_KEY) || "{}");
      return stored && typeof stored === "object" ? stored : {};
    } catch {
      return {};
    }
  }

  function imageListFor(item) {
    if (Array.isArray(item?.images)) return item.images.filter(Boolean);
    return item?.image ? [item.image] : [];
  }

  function readNewsItems() {
    try {
      const stored = JSON.parse(localStorage.getItem(NEWS_STORAGE_KEY) || "null");
      return Array.isArray(stored) ? stored : content().news;
    } catch {
      return content().news;
    }
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

    const mentorFields = [
      { key: "recruiting", col: "recruiting" },
      { key: "area", col: "area" },
      { key: "role", col: "role" },
      { key: "name", col: "name" },
      { key: "nameEn", col: "name-en" },
      { key: "affiliation", col: "affiliation" },
      { key: "department", col: "department" },
      { key: "website", col: "website" },
    ];
    const columns = content().mentorColumns;
    const mentorAreas = content().mentorAreas || {};
    const mentorStatuses = content().mentorRecruitingStatuses || {};
    const mentorStatusOverrides = readMentorStatusOverrides();
    const mentorStatusLabels = content().mentorRecruitingStatusLabels || {};
    const defaultRecruitingStatusCode = content().mentorDefaultRecruitingStatus || "";
    const defaultRecruitingStatus = content().mentorRecruitingStatus || "";

    const colGroup = document.createElement("colgroup");
    mentorFields.forEach((field) => {
      const col = document.createElement("col");
      col.className = `mentor-col-${field.col}`;
      colGroup.append(col);
    });
    table.prepend(colGroup);

    const headRow = document.createElement("tr");
    columns.forEach((label) => {
      const th = document.createElement("th");
      th.textContent = label;
      headRow.append(th);
    });
    document.querySelector(".mentor-table thead").replaceChildren(headRow);

    const rows = content().mentors.map((mentor) => {
      const row = document.createElement("tr");
      mentorFields.slice(0, -1).forEach((field, index) => {
        const cell = document.createElement("td");
        let value = "";
        if (field.key === "area") {
          value = mentor.area || mentorAreas[mentor.name] || "";
          cell.classList.add("mentor-area-cell");
        } else if (field.key === "recruiting") {
          const statusCode =
            mentorStatusOverrides[mentor.name] ||
            mentor.recruitingStatus ||
            mentorStatuses[mentor.name] ||
            defaultRecruitingStatusCode;
          value = mentorStatusLabels[statusCode] || mentor.recruiting || defaultRecruitingStatus;
          cell.classList.add("mentor-recruiting-cell");
          if (statusCode) cell.dataset.status = statusCode;
        } else {
          value = mentor[field.key] || "";
        }
        cell.dataset.label = columns[index] || "";
        cell.textContent = value || "";
        row.append(cell);
      });
      const linkCell = document.createElement("td");
      linkCell.dataset.label = columns[mentorFields.length - 1] || "";
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
    const items = readNewsItems().map((item) => {
      const article = document.createElement("article");
      const images = imageListFor(item);
      const body = document.createElement("div");
      const date = document.createElement("span");
      const title = item.href ? linkElement(item, "news-link") : document.createElement("strong");

      article.className = "news-item";
      body.className = "news-item-body";
      date.textContent = item.date;
      title.textContent = item.title;

      if (images.length) {
        let currentIndex = 0;
        const media = document.createElement("figure");
        const image = document.createElement("img");
        media.className = "news-media";
        image.src = images[currentIndex];
        image.alt = item.title || "";
        media.append(image);

        if (images.length > 1) {
          const controls = document.createElement("div");
          const prev = document.createElement("button");
          const next = document.createElement("button");
          const counter = document.createElement("span");
          const updateImage = (nextIndex) => {
            currentIndex = (nextIndex + images.length) % images.length;
            image.src = images[currentIndex];
            counter.textContent = `${currentIndex + 1}/${images.length}`;
          };

          controls.className = "news-carousel-controls";
          prev.className = "news-carousel-button";
          next.className = "news-carousel-button";
          counter.className = "news-carousel-counter";
          prev.type = "button";
          next.type = "button";
          prev.setAttribute("aria-label", "이전 사진");
          next.setAttribute("aria-label", "다음 사진");
          prev.textContent = "‹";
          next.textContent = "›";
          counter.textContent = `1/${images.length}`;
          prev.addEventListener("click", () => updateImage(currentIndex - 1));
          next.addEventListener("click", () => updateImage(currentIndex + 1));
          controls.append(prev, counter, next);
          media.append(controls);
        }

        article.append(media);
      }

      body.append(date, title);
      article.append(body);
      return article;
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

  function renderOpenings() {
    const openings = content().piOpenings.map((opening) => {
      const article = document.createElement("article");
      const status = document.createElement("span");
      const title = document.createElement("h3");
      const meta = document.createElement("dl");
      const fit = document.createElement("p");
      const actions = document.createElement("div");
      const contact = linkElement(
        { label: opening.contactLabel, href: opening.contactHref },
        "opening-link"
      );
      const detail = linkElement(
        {
          label: state.lang === "ko" ? "PI 페이지 보기" : "View PI page",
          href: opening.id ? `./pi.html?id=${opening.id}` : "./index.html#mentors"
        },
        "opening-link"
      );

      status.className = "opening-status";
      status.textContent = opening.status;
      title.textContent = opening.title;
      fit.textContent = opening.fit;

      [
        [state.lang === "ko" ? "PI" : "PI", opening.pi],
        [state.lang === "ko" ? "연구실" : "Lab", opening.lab],
        [state.lang === "ko" ? "연구영역" : "Area", opening.area],
        [state.lang === "ko" ? "일정" : "Timeline", opening.timeline],
      ].forEach(([label, value]) => {
        const term = document.createElement("dt");
        const description = document.createElement("dd");
        term.textContent = label;
        description.textContent = value;
        meta.append(term, description);
      });

      actions.className = "opening-actions";
      actions.append(contact, detail);

      article.append(status, title, meta, fit, actions);
      return article;
    });

    document.querySelector(".openings-grid").replaceChildren(...openings);
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
