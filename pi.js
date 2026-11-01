(function () {
  const state = {
    lang: localStorage.getItem("innocore-lang") === "en" ? "en" : "ko",
  };

  const labels = {
    ko: {
      navApply: "펠로우 채용 공고",
      navOpenings: "Fellow 연구지원",
      navDirectory: "Fellow 소개",
      navMentors: "멘토",
      headerCta: "펠로우 채용 공고",
      back: "멘토 목록으로 돌아가기",
      openingTitle: "PI별 모집 안내",
      openingBody: "현재 이 PI의 개별 채용 공고는 아직 등록되지 않았습니다. 세부 프로젝트와 선호 역량이 확정되면 이 페이지에 표시됩니다.",
      area: "연구영역",
      timeline: "모집 시점",
      affiliation: "소속",
      department: "학과/부서",
      lab: "연구실",
      contact: "문의",
      website: "연구실 웹사이트",
      missingTitle: "PI 정보를 찾을 수 없습니다",
      missingBody: "주소의 PI 식별자를 확인하거나 멘토 목록에서 다시 선택해주세요.",
      openingRequest: "Fellow 채용 수요 등록 요청",
      kicker: "Fellow 모집 안내",
      titleSuffix: "E-MatAX Fellow 모집 안내",
      visualAltSuffix: "연구 안내 이미지",
    },
    en: {
      navApply: "Fellow Notice",
      navOpenings: "Fellow Support",
      navDirectory: "Fellow Directory",
      navMentors: "Mentors",
      headerCta: "Fellow Notice",
      back: "Back to mentor list",
      openingTitle: "PI opening information",
      openingBody: "This PI-specific opening has not been registered yet. Project details and preferred expertise will appear here when confirmed.",
      area: "Research Area",
      timeline: "Timeline",
      affiliation: "Affiliation",
      department: "Department",
      lab: "Lab",
      contact: "Contact",
      website: "Lab website",
      missingTitle: "PI not found",
      missingBody: "Check the PI identifier in the URL or choose again from the mentor list.",
      openingRequest: "Submit PI opening update",
      kicker: "Fellow Opening",
      titleSuffix: "E-MatAX Fellow Opening",
      visualAltSuffix: "visual header",
    },
  };

  const content = () => window.INNOCORE_CONTENT[state.lang] || window.INNOCORE_CONTENT.ko;
  const label = () => labels[state.lang] || labels.ko;

  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function linkElement(labelText, href, className) {
    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.textContent = labelText;
    if (/^https?:\/\//.test(href)) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    return link;
  }

  function renderMeta(labelText, value) {
    const item = document.createElement("article");
    const labelNode = document.createElement("span");
    const valueNode = document.createElement("strong");
    labelNode.textContent = labelText;
    valueNode.textContent = value || "-";
    item.append(labelNode, valueNode);
    return item;
  }

  function currentId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || "";
  }

  function findMentor(id) {
    return content().mentors.find((mentor) => slugify(mentor.nameEn) === id);
  }

  function findOpening(id) {
    return (content().piOpenings || []).find((opening) => opening.id === id);
  }

  function renderOpeningMeta(labelText, value) {
    const item = document.createElement("div");
    const key = document.createElement("span");
    const val = document.createElement("strong");
    key.textContent = labelText;
    val.textContent = value || "-";
    item.append(key, val);
    return item;
  }

  function render() {
    document.documentElement.lang = state.lang;
    window.INNOCORE_I18N.apply(state.lang);
    document.querySelector('a[href="https://www.innocore.or.kr/dgist/notice/sub01"]').textContent = label().navApply;
    document.querySelector('a[href="./index.html#fellows"]').textContent = label().navOpenings;
    document.querySelector('a[href="./fellows.html"]').textContent = label().navDirectory;
    document.querySelector('a[href="./index.html#mentors"]').textContent = label().navMentors;
    document.querySelector(".header-cta").textContent = label().headerCta;

    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === state.lang));
    });

    const root = document.querySelector(".pi-detail");
    const id = currentId();
    const mentor = findMentor(id);
    const openingData = findOpening(id);
    document.title = mentor
      ? `${mentor.nameEn || mentor.name} | ${label().titleSuffix}`
      : id
        ? `${id} | ${label().missingTitle}`
        : label().missingTitle;
    root.replaceChildren();

    const back = linkElement(label().back, "./index.html#mentors", "related-link");

    if (!mentor) {
      const missing = document.createElement("div");
      missing.className = "pi-hero";
      const title = document.createElement("h1");
      const body = document.createElement("p");
      title.id = "pi-title";
      title.textContent = label().missingTitle;
      body.textContent = label().missingBody;
      missing.append(back, title, body);
      root.append(missing);
      return;
    }

    const hero = document.createElement("div");
    hero.className = "pi-hero";
    const kicker = document.createElement("p");
    const title = document.createElement("h1");
    const subtitle = document.createElement("p");
    kicker.className = "eyebrow";
    kicker.textContent = label().kicker;
    title.id = "pi-title";
    title.textContent = state.lang === "ko" ? mentor.name : mentor.nameEn || mentor.name;
    subtitle.textContent = state.lang === "ko" ? mentor.nameEn || "" : "";
    subtitle.hidden = state.lang === "en" || !subtitle.textContent || subtitle.textContent === title.textContent;
    hero.append(back, kicker, title, subtitle);

    let visualHeader = null;
    if (openingData?.heroImage) {
      visualHeader = document.createElement("figure");
      const visual = document.createElement("img");
      visualHeader.className = "pi-visual-header";
      visual.src = openingData.heroImage;
      visual.alt = `${openingData.pi} ${openingData.lab} ${openingData.area} ${label().visualAltSuffix}`;
      visualHeader.append(visual);
      if (openingData.heroCaption) {
        const caption = document.createElement("figcaption");
        caption.textContent = openingData.heroCaption;
        visualHeader.append(caption);
      }
    }

    const meta = document.createElement("div");
    meta.className = "pi-meta-grid";
    meta.append(
      renderMeta(label().affiliation, mentor.affiliation),
      renderMeta(label().department, mentor.department),
      renderMeta(label().lab, mentor.url ? mentor.url.replace(/^https?:\/\//, "") : "-"),
      renderMeta(label().contact, "e-matax@dgist.ac.kr")
    );

    const opening = document.createElement("article");
    opening.className = "pi-opening-panel";
    const openingTitle = document.createElement("h2");
    const openingBody = document.createElement("p");
    const openingMeta = document.createElement("div");
    const actions = document.createElement("div");
    openingTitle.textContent = openingData ? openingData.title : label().openingTitle;
    openingBody.textContent = openingData ? openingData.fit : label().openingBody;
    openingMeta.className = "pi-opening-meta";
    if (openingData) {
      openingMeta.append(
        renderOpeningMeta(label().area, openingData.area),
        renderOpeningMeta(label().timeline, openingData.timeline),
        renderOpeningMeta(label().contact, openingData.contactLabel.replace(/^문의: |^Contact: /, ""))
      );
    }
    actions.className = "pi-actions";
    if (openingData?.contactHref) {
      actions.append(linkElement(openingData.contactLabel, openingData.contactHref, "primary-action"));
    }
    if (mentor.url) {
      actions.append(linkElement(label().website, mentor.url, openingData ? "secondary-action dark" : "primary-action"));
    }
    if (!openingData) {
      actions.append(
        linkElement(
          label().openingRequest,
          "https://github.com/EMDPLab/InnoCORE_EMatAX/issues/new?template=pi-opening.yml",
          mentor.url ? "secondary-action dark" : "primary-action"
        )
      );
    }
    opening.append(openingTitle, openingBody);
    if (openingData) opening.append(openingMeta);
    opening.append(actions);

    root.append(hero);
    if (visualHeader) root.append(visualHeader);
    root.append(meta, opening);
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
