(function () {
  const labels = {
    ko: {
      skip: "본문으로 바로가기",
      navigation: "주요 메뉴",
      language: "언어 선택",
      home: "DGIST InnoCORE E-MatAX 홈",
      brandSubtitle: "E-MatAX 연구단",
      facts: "핵심 정보",
      programVisual: "E-MatAX 연구 플랫폼 개념도",
      contactTitle: "문의",
      telephone: "전화: +82-53-785-7833",
      organization: "에너지 소재 상용화 AX (E-MatAX) 연구단 · 대구경북과학기술원",
      address: "(42988) 대구광역시 달성군 현풍읍 테크노중앙대로 333",
      footerText: "DGIST InnoCORE 에너지 소재 상용화 AX 연구단",
      pageTitle: "DGIST InnoCORE E-MatAX 연구단",
      enlargePhoto: "사진 크게 보기",
      previousPhoto: "이전 사진",
      nextPhoto: "다음 사진",
      newsPhotos: "뉴스 사진 크게 보기",
      close: "닫기",
    },
    en: {
      skip: "Skip to main content",
      navigation: "Main navigation",
      language: "Select language",
      home: "DGIST InnoCORE E-MatAX home",
      brandSubtitle: "E-MatAX Research Center",
      facts: "Key information",
      programVisual: "E-MatAX research platform concept diagram",
      contactTitle: "Contact",
      telephone: "Tel. +82-53-785-7833",
      organization: "E-MatAX Research Center · Daegu Gyeongbuk Institute of Science and Technology (DGIST)",
      address: "333 Techno Jungang-daero, Hyeonpung-eup, Dalseong-gun, Daegu, 42988, Republic of Korea",
      footerText: "DGIST InnoCORE E-MatAX Research Center",
      pageTitle: "DGIST InnoCORE E-MatAX Research Center",
      enlargePhoto: "Enlarge photo",
      previousPhoto: "Previous photo",
      nextPhoto: "Next photo",
      newsPhotos: "News photo viewer",
      close: "Close",
    },
  };

  function apply(lang) {
    const text = labels[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = text[element.dataset.i18n];
    });
    document.querySelector(".skip-link").textContent = text.skip;
    document.querySelector(".brand").setAttribute("aria-label", text.home);
    document.querySelector(".brand em").textContent = text.brandSubtitle;
    document.querySelector(".site-nav").setAttribute("aria-label", text.navigation);
    document.querySelector(".lang-switch").setAttribute("aria-label", text.language);
    const facts = document.querySelector(".quick-facts");
    if (facts) facts.setAttribute("aria-label", text.facts);
    const visual = document.querySelector('.media-panel img');
    if (visual) visual.alt = text.programVisual;
  }

  window.INNOCORE_I18N = { labels, apply };
})();
