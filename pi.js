(function () {
  const state = {
    lang: localStorage.getItem("innocore-lang") || "ko",
  };

  const labels = {
    ko: {
      navApply: "지원",
      navOpenings: "PI 채용",
      navMentors: "멘토",
      headerCta: "지원 안내",
      back: "멘토 목록으로 돌아가기",
      status: "채용정보",
      statusBody: "현재 이 PI의 개별 채용 공고는 아직 등록되지 않았습니다. 모집상태, 세부 프로젝트, 선호 역량이 확정되면 이 페이지에 표시됩니다.",
      area: "연구영역",
      timeline: "모집 시점",
      affiliation: "소속",
      department: "학과/부서",
      lab: "연구실",
      contact: "문의",
      website: "연구실 웹사이트",
      missingTitle: "PI 정보를 찾을 수 없습니다",
      missingBody: "주소의 PI 식별자를 확인하거나 멘토 목록에서 다시 선택해주세요.",
      openingRequest: "PI 채용 수요 등록 요청",
    },
    en: {
      navApply: "Apply",
      navOpenings: "PI Openings",
      navMentors: "Mentors",
      headerCta: "Apply",
      back: "Back to mentor list",
      status: "Opening Status",
      statusBody: "This PI-specific opening has not been registered yet. Hiring status, project details, and preferred expertise will appear here when confirmed.",
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
    document.querySelector('a[href="./index.html#how-apply"]').textContent = label().navApply;
    document.querySelector('a[href="./index.html#openings"]').textContent = label().navOpenings;
    document.querySelector('a[href="./index.html#mentors"]').textContent = label().navMentors;
    document.querySelector(".header-cta").textContent = label().headerCta;

    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === state.lang));
    });

    const root = document.querySelector(".pi-detail");
    const id = currentId();
    const mentor = findMentor(id);
    const openingData = findOpening(id);
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

    document.title = `${mentor.nameEn} | E-MatAX PI Opening`;

    const hero = document.createElement("div");
    hero.className = "pi-hero";
    const kicker = document.createElement("p");
    const title = document.createElement("h1");
    const subtitle = document.createElement("p");
    kicker.className = "eyebrow";
    kicker.textContent = "PI Opening";
    title.id = "pi-title";
    title.textContent = state.lang === "ko" ? mentor.name : mentor.nameEn;
    subtitle.textContent = state.lang === "ko" ? mentor.nameEn : mentor.name;
    hero.append(back, kicker, title, subtitle);

    const meta = document.createElement("div");
    meta.className = "pi-meta-grid";
    meta.append(
      renderMeta(label().affiliation, mentor.affiliation),
      renderMeta(label().department, mentor.department),
      renderMeta(label().lab, mentor.url ? mentor.url.replace(/^https?:\/\//, "") : "-"),
      renderMeta(label().contact, "innocore@dgist.ac.kr")
    );

    const opening = document.createElement("article");
    opening.className = "pi-opening-panel";
    const status = document.createElement("span");
    const openingTitle = document.createElement("h2");
    const openingBody = document.createElement("p");
    const openingMeta = document.createElement("div");
    const actions = document.createElement("div");
    status.className = "opening-status";
    status.textContent = openingData ? openingData.status : state.lang === "ko" ? "등록 예정" : "Coming soon";
    openingTitle.textContent = openingData ? openingData.title : label().status;
    openingBody.textContent = openingData ? openingData.fit : label().statusBody;
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
    opening.append(status, openingTitle, openingBody);
    if (openingData) opening.append(openingMeta);
    opening.append(actions);
    if (openingData?.flyer) {
      const figure = document.createElement("figure");
      const image = document.createElement("img");
      figure.className = "pi-flyer";
      image.src = openingData.flyer;
      image.alt = `${openingData.pi} ${openingData.lab} ${openingData.area} flyer`;
      figure.append(image);
      opening.append(figure);
    }

    root.append(hero, meta, opening);
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
