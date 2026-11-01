(function () {
  const params = new URLSearchParams(location.search);
  const categories = ["all", "notice", "seminar", "recruitment"];
  const state = {
    lang: params.get("lang") === "en" || (!params.has("lang") && localStorage.getItem("innocore-lang") === "en") ? "en" : "ko",
    category: categories.includes(params.get("category")) ? params.get("category") : "all",
    query: params.get("q") || "",
    year: params.get("year") || "",
    id: params.get("id") || "",
  };
  const labels = {
    ko: {
      title: "공지·세미나·채용", lead: "연구단의 공지사항, 세미나와 채용 소식을 확인하세요.",
      all: "전체", notice: "공지사항", seminar: "세미나", recruitment: "채용",
      searchLabel: "게시글 검색", yearLabel: "연도", allYears: "전체 연도", search: "검색", reset: "초기화",
      count: (n) => `총 ${n}건`, empty: "조건에 맞는 게시글이 없습니다. 검색어나 연도를 바꿔보세요.",
      back: "목록으로 돌아가기", source: "원문·관련 안내 ↗", photos: "행사 사진", record: "행사 기록",
      officialNote: "최신 모집 일정, 지원 자격과 접수 방법은 DGIST InnoCORE 공식 채용 공고에서 확인해 주세요. 아래 지난 채용 박람회 기록은 현재 모집 여부를 의미하지 않습니다.",
      officialLink: "공식 채용 공고 확인 ↗", ongoing: "상시 안내", missing: "게시글을 찾을 수 없습니다.",
      missingBody: "주소를 확인하거나 게시판 목록에서 다시 선택해 주세요.", direct: "이 글 주소",
      description: "DGIST InnoCORE E-MatAX 연구단의 공지사항, 세미나 기록과 채용 안내입니다.",
    },
    en: {
      title: "News & notices", lead: "Notices, seminars and recruitment updates from E-MatAX.",
      all: "All posts", notice: "Notices", seminar: "Seminars", recruitment: "Recruitment",
      searchLabel: "Search posts", yearLabel: "Year", allYears: "All years", search: "Search", reset: "Reset",
      count: (n) => `${n} post${n === 1 ? "" : "s"}`, empty: "No posts match your search. Try another keyword or year.",
      back: "Back to list", source: "Source / related information ↗", photos: "Event photos", record: "Event archive",
      officialNote: "Check the official DGIST InnoCORE recruitment notices for current deadlines, eligibility and application instructions. Past job fair records below do not indicate an active opening.",
      officialLink: "Official recruitment notices ↗", ongoing: "Standing information", missing: "Post not found.",
      missingBody: "Check the address or choose a post from the list.", direct: "Link to this post",
      description: "Notices, seminar records and recruitment information from DGIST InnoCORE E-MatAX.",
    },
  };
  const text = () => labels[state.lang];
  const catalog = () => window.INNOCORE_CONTENT[state.lang];
  const posts = () => catalog().news;

  function node(tag, value, className) {
    const element = document.createElement(tag);
    if (value) element.textContent = value;
    if (className) element.className = className;
    return element;
  }

  function url(overrides = {}) {
    const next = { ...state, ...overrides };
    const query = new URLSearchParams();
    for (const key of ["category", "q", "year", "id", "lang"]) {
      const value = key === "q" ? next.query : next[key];
      if (value && !(key === "category" && value === "all")) query.set(key, value);
    }
    return `./boards.html?${query}`;
  }

  function anchor(title, href, className) {
    const element = node("a", title, className);
    element.href = href;
    if (/^https:\/\//.test(href)) {
      element.target = "_blank";
      element.rel = "noopener";
    }
    return element;
  }

  function meta(post) {
    const group = node("div", "", "board-meta");
    group.append(node("span", text()[post.category], "board-category"));
    const date = node(post.sortDate ? "time" : "span", post.sortDate ? post.date : text().ongoing);
    if (post.sortDate) date.dateTime = post.sortDate;
    group.append(date);
    if (post.archived) {
      group.append(node("span", text().record, "board-record"));
    }
    return group;
  }

  function renderHeader() {
    window.INNOCORE_I18N.apply(state.lang);
    document.querySelectorAll("[data-board-copy]").forEach((element) => {
      element.textContent = text()[element.dataset.boardCopy];
    });
    document.querySelector('meta[name="description"]').content = text().description;
    document.querySelector(".site-nav").replaceChildren(...catalog().nav.map((item) => {
      const link = anchor(item.label, item.href.startsWith("#") ? `./index.html${item.href}` : item.href, "nav-link");
      if (item.href === "./boards.html") link.setAttribute("aria-current", "page");
      return link;
    }));
    document.querySelector(".header-cta").textContent = catalog().headerCta;
    document.querySelectorAll("[data-lang]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.lang === state.lang)));
    const tabs = document.querySelector(".board-categories");
    tabs.setAttribute("aria-label", text().title);
    const selected = state.id ? posts().find((post) => post.id === state.id)?.category : state.category;
    tabs.replaceChildren(...categories.map((category) => {
      const link = anchor(text()[category], url({ category, id: "", query: "", year: "" }));
      if (selected === category) link.setAttribute("aria-current", "page");
      return link;
    }));
    document.querySelector(".board-official").hidden = selected !== "recruitment";
    document.querySelector(".board-index").setAttribute("aria-label", text().title);
    document.title = `${text().title} | E-MatAX`;
  }

  function renderList() {
    const form = document.querySelector(".board-search");
    form.elements.q.value = state.query;
    const yearSelect = form.elements.year;
    const years = [...new Set(posts().filter((p) => p.sortDate).map((p) => p.sortDate.slice(0, 4)))].sort().reverse();
    yearSelect.replaceChildren(new Option(text().allYears, ""), ...years.map((year) => new Option(year, year)));
    if (state.year && !years.includes(state.year)) yearSelect.add(new Option(state.year, state.year));
    yearSelect.value = state.year;
    document.querySelector(".board-reset").href = url({ query: "", year: "", id: "" });
    const query = state.query.trim().toLocaleLowerCase();
    const filtered = posts().filter((post) =>
      (state.category === "all" || post.category === state.category) &&
      (!state.year || post.sortDate.startsWith(state.year)) &&
      (!query || `${post.title} ${post.description}`.toLocaleLowerCase().includes(query))
    ).sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    document.querySelector(".board-results").textContent = text().count(filtered.length);
    const list = document.querySelector(".board-list");
    list.replaceChildren(...filtered.map((post) => {
      const article = node("article", "", "board-row");
      const title = node("h2");
      title.append(anchor(post.title, url({ id: post.id })));
      article.append(meta(post), title);
      if (post.description) article.append(node("p", post.description, "board-summary"));
      return article;
    }));
    if (!filtered.length) list.append(node("p", text().empty, "board-empty"));
  }

  function renderDetail() {
    const root = document.querySelector(".board-detail");
    root.replaceChildren();
    const post = posts().find((entry) => entry.id === state.id);
    const back = anchor(text().back, url({ id: "" }), "board-back");
    root.append(back);
    const title = node("h2", post?.title || text().missing);
    title.id = "post-title";
    if (!post) {
      root.append(title, node("p", text().missingBody));
      return;
    }
    document.title = `${post.title} | E-MatAX`;
    root.append(meta(post), title);
    if (post.description) root.append(node("p", post.description, "board-body"));
    if (post.href) root.append(anchor(text().source, post.href, "board-source"));
    if (post.images?.length) {
      const gallery = node("div", "", "board-gallery");
      gallery.setAttribute("aria-label", text().photos);
      post.images.forEach((entry, index) => {
        const full = typeof entry === "string" ? entry : entry.full;
        const image = node("img");
        image.src = full;
        image.alt = `${post.title} (${index + 1}/${post.images.length})`;
        image.loading = "lazy";
        const link = anchor("", full);
        link.append(image);
        gallery.append(link);
      });
      root.append(gallery);
    }
    const share = node("div", "", "board-share");
    const label = node("label", text().direct);
    const input = node("input");
    input.type = "url";
    input.readOnly = true;
    input.value = new URL(url({ category: post.category, query: "", year: "" }), location.href).href;
    input.addEventListener("focus", () => input.select());
    label.append(input);
    share.append(label);
    root.append(share, anchor(text().back, url({ id: "" }), "board-back"));
  }

  function render() {
    renderHeader();
    document.querySelector(".board-index").hidden = Boolean(state.id);
    document.querySelector(".board-detail").hidden = !state.id;
    if (state.id) renderDetail(); else renderList();
  }

  document.querySelector(".board-search").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    state.query = form.elements.q.value;
    state.year = form.elements.year.value;
    history.replaceState(null, "", url());
    renderList();
  });
  document.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => {
    state.lang = button.dataset.lang;
    localStorage.setItem("innocore-lang", state.lang);
    history.replaceState(null, "", url());
    render();
  }));
  render();
})();
