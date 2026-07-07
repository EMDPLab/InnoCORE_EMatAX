(function () {
  const MENTOR_STORAGE_KEY = "innocore-mentor-recruiting-statuses";
  const FELLOW_STORAGE_KEY = "innocore-fellow-profiles";
  const NEWS_STORAGE_KEY = "innocore-news-items";
  const content = window.INNOCORE_CONTENT.ko;
  const defaultStatus = content.mentorDefaultRecruitingStatus || "active";
  const options = content.mentorRecruitingStatusOptions || [
    { value: "active", label: "적극 채용중" },
    { value: "inactive", label: "채용중 아님" },
  ];
  const statusLabels = content.mentorRecruitingStatusLabels || {};

  const state = {
    statuses: loadMentorStatuses(),
    fellows: loadFellows(),
    news: loadNews(),
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadJson(key, fallback) {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "null");
      return stored ?? fallback;
    } catch {
      return fallback;
    }
  }

  function loadMentorStatuses() {
    const stored = loadJson(MENTOR_STORAGE_KEY, {});
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  }

  function loadFellows() {
    const stored = loadJson(FELLOW_STORAGE_KEY, null);
    return Array.isArray(stored) ? stored : clone(content.fellowProfiles || []);
  }

  function imageListFor(item) {
    if (Array.isArray(item?.images)) return item.images.filter(Boolean);
    return item?.image ? [item.image] : [];
  }

  function normalizeHref(href) {
    const value = String(href || "").trim();
    if (!value) return "";
    if (/^(https?:\/\/|mailto:|#|\.\/|\/)/i.test(value)) return value;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
    if (/^(www\.|[a-z0-9.-]+\.[a-z]{2,})([/:?#].*)?$/i.test(value)) return `https://${value}`;
    return value;
  }

  function normalizeNewsItem(item = {}) {
    return {
      date: typeof item.date === "string" ? item.date.trim() : "",
      title: typeof item.title === "string" ? item.title.trim() : "",
      href: normalizeHref(item.href),
      images: imageListFor(item),
    };
  }

  function loadNews() {
    const stored = loadJson(NEWS_STORAGE_KEY, null);
    const source = Array.isArray(stored) ? stored : clone(content.news || []);
    return source.map(normalizeNewsItem);
  }

  function statusFor(mentor) {
    return state.statuses[mentor.name] || mentor.recruitingStatus || content.mentorRecruitingStatuses?.[mentor.name] || defaultStatus;
  }

  function fullStatusMap() {
    return Object.fromEntries(content.mentors.map((mentor) => [mentor.name, statusFor(mentor)]));
  }

  function renderStatusControls(mentor) {
    const group = document.createElement("div");
    group.className = "admin-radio-group";
    const current = statusFor(mentor);

    options.forEach((option) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      const text = document.createElement("span");
      input.type = "radio";
      input.name = `status-${mentor.nameEn}`;
      input.value = option.value;
      input.checked = current === option.value;
      input.addEventListener("change", () => {
        state.statuses[mentor.name] = option.value;
        updateMentorSummary();
      });
      text.textContent = option.label;
      label.append(input, text);
      group.append(label);
    });

    return group;
  }

  function renderMentorRows() {
    const rows = content.mentors.map((mentor) => {
      const row = document.createElement("tr");
      const name = document.createElement("td");
      const nameKo = document.createElement("strong");
      const nameEn = document.createElement("span");
      const area = document.createElement("td");
      const affiliation = document.createElement("td");
      const status = document.createElement("td");
      nameKo.textContent = mentor.name;
      nameEn.textContent = mentor.nameEn;
      name.append(nameKo, nameEn);
      area.textContent = mentor.area || content.mentorAreas?.[mentor.name] || "-";
      affiliation.textContent = mentor.affiliation || "-";
      status.append(renderStatusControls(mentor));
      row.append(name, area, affiliation, status);
      return row;
    });

    document.querySelector(".admin-table tbody").replaceChildren(...rows);
  }

  function mentorOutputText() {
    return `mentorRecruitingStatuses: ${JSON.stringify(fullStatusMap(), null, 2)},`;
  }

  function updateMentorSummary() {
    const values = Object.values(fullStatusMap());
    document.querySelector("[data-active-count]").textContent = String(values.filter((value) => value === "active").length);
    document.querySelector("[data-inactive-count]").textContent = String(values.filter((value) => value === "inactive").length);
    document.querySelector("#mentor-output").value = mentorOutputText();
  }

  function setAdminStatus(selector, message, tone = "pending") {
    const element = document.querySelector(selector);
    if (!element) return;
    element.textContent = message;
    element.dataset.tone = tone;
  }

  function directApplyHelp(error) {
    if (error?.serverReachable) {
      return `직접 반영 실패: ${error.message}`;
    }
    const detail = error?.message ? ` (${error.message})` : "";
    return `직접 반영 실패${detail}. 터미널에서 node admin-server.js 실행 후 http://127.0.0.1:8787/admin.html 로 접속해주세요.`;
  }

  async function postAdminData(path, payload) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      const error = new Error(data?.error || `서버 응답 오류 ${response.status}`);
      error.serverReachable = true;
      throw error;
    }

    return data;
  }

  function saveMentors() {
    localStorage.setItem(MENTOR_STORAGE_KEY, JSON.stringify(fullStatusMap()));
    state.statuses = loadMentorStatuses();
    renderMentorRows();
    updateMentorSummary();
  }

  async function applyMentorsToContent(commit = false) {
    setAdminStatus("[data-mentor-status]", commit ? "content.js 반영 및 commit 중..." : "content.js 반영 중...");

    try {
      saveMentors();
      const data = await postAdminData("/api/admin/mentors", {
        mentorRecruitingStatuses: fullStatusMap(),
        commit,
      });
      setAdminStatus("[data-mentor-status]", data.message || "멘토 데이터 반영 완료", "success");
    } catch (error) {
      setAdminStatus("[data-mentor-status]", directApplyHelp(error), "error");
    }
  }

  function resetMentors() {
    localStorage.removeItem(MENTOR_STORAGE_KEY);
    state.statuses = {};
    renderMentorRows();
    updateMentorSummary();
  }

  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function createEmptyFellow() {
    return {
      name: "새 Fellow",
      nameEn: "New Fellow",
      status: "프로필 준비중",
      currentPi: "현재 PI 입력 예정",
      researchArea: "연구 분야 입력 예정",
      affiliation: "소속 입력 예정",
      summary: "Fellow의 연구 주제와 역할을 간단히 입력해주세요.",
      image: "./assets/fellow-placeholder.svg",
    };
  }

  function updateFellow(index, key, value) {
    state.fellows[index] = {
      ...state.fellows[index],
      [key]: value,
    };
    updateFellowSummary();
  }

  function fieldControl(index, key, labelText, value, multiline = false) {
    const label = document.createElement("label");
    const caption = document.createElement("span");
    const field = multiline ? document.createElement("textarea") : document.createElement("input");
    label.className = "admin-field";
    caption.textContent = labelText;
    field.value = value || "";
    field.dataset.fellowIndex = String(index);
    field.dataset.fellowField = key;
    if (multiline) {
      field.rows = 5;
    } else {
      field.type = "text";
    }
    field.addEventListener("input", () => {
      updateFellow(index, key, field.value);
      if (key === "name") {
        const title = field.closest(".fellow-admin-card")?.querySelector("h3");
        if (title) title.textContent = field.value || `Fellow ${index + 1}`;
      }
    });
    label.append(caption, field);
    return label;
  }

  function resizeImage(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("이미지 파일만 업로드할 수 있습니다."));
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("error", () => reject(new Error("이미지를 읽을 수 없습니다.")));
      reader.addEventListener("load", () => {
        const image = new Image();
        image.addEventListener("error", () => reject(new Error("이미지를 처리할 수 없습니다.")));
        image.addEventListener("load", () => {
          const maxWidth = 900;
          const maxHeight = 900;
          const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
          const width = Math.round(image.width * ratio);
          const height = Math.round(image.height * ratio);
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = width;
          canvas.height = height;
          context.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.84));
        });
        image.src = reader.result;
      });
      reader.readAsDataURL(file);
    });
  }

  function renderFellowEditors() {
    const editors = state.fellows.map((profile, index) => {
      const article = document.createElement("article");
      const preview = document.createElement("figure");
      const image = document.createElement("img");
      const body = document.createElement("div");
      const title = document.createElement("h3");
      const photoActions = document.createElement("div");
      const uploadLabel = document.createElement("label");
      const uploadInput = document.createElement("input");
      const uploadText = document.createElement("span");
      const removeImage = document.createElement("button");
      const deleteProfile = document.createElement("button");
      const fields = document.createElement("div");

      article.className = "fellow-admin-card";
      preview.className = "fellow-admin-preview";
      image.src = profile.image || "./assets/fellow-placeholder.svg";
      image.alt = "";
      preview.append(image);

      body.className = "fellow-admin-body";
      title.textContent = profile.name || `Fellow ${index + 1}`;

      photoActions.className = "fellow-photo-actions";
      uploadLabel.className = "admin-button file-button";
      uploadInput.type = "file";
      uploadInput.accept = "image/*";
      uploadInput.dataset.fellowIndex = String(index);
      uploadInput.dataset.fellowField = "image";
      uploadInput.addEventListener("change", async () => {
        const file = uploadInput.files?.[0];
        if (!file) return;
        try {
          state.fellows[index].image = await resizeImage(file);
          renderFellowEditors();
          updateFellowSummary();
        } catch (error) {
          window.alert(error.message);
        }
      });
      uploadText.textContent = "사진 업로드";
      uploadLabel.append(uploadInput, uploadText);

      removeImage.className = "admin-button";
      removeImage.type = "button";
      removeImage.textContent = "사진 제거";
      removeImage.addEventListener("click", () => {
        state.fellows[index].image = "./assets/fellow-placeholder.svg";
        renderFellowEditors();
        updateFellowSummary();
      });

      deleteProfile.className = "admin-button danger";
      deleteProfile.type = "button";
      deleteProfile.textContent = "프로필 삭제";
      deleteProfile.addEventListener("click", () => {
        state.fellows.splice(index, 1);
        renderFellowEditors();
        updateFellowSummary();
      });

      photoActions.append(uploadLabel, removeImage, deleteProfile);

      fields.className = "fellow-admin-fields";
      fields.append(
        fieldControl(index, "name", "이름", profile.name),
        fieldControl(index, "nameEn", "영문 이름", profile.nameEn),
        fieldControl(index, "status", "상태", profile.status),
        fieldControl(index, "currentPi", "현재 PI", profile.currentPi),
        fieldControl(index, "researchArea", "연구 분야", profile.researchArea),
        fieldControl(index, "affiliation", "소속", profile.affiliation),
        fieldControl(index, "summary", "간단한 연구 소개", profile.summary, true)
      );

      body.append(title, fields, photoActions);
      article.append(preview, body);
      return article;
    });

    document.querySelector(".fellow-admin-list").replaceChildren(...editors);
  }

  function fellowOutputText() {
    return `fellowProfiles: ${JSON.stringify(state.fellows, null, 2)},`;
  }

  function updateFellowSummary() {
    document.querySelector("[data-fellow-count]").textContent = String(state.fellows.length);
    document.querySelector("#fellow-output").value = fellowOutputText();
  }

  function saveFellows() {
    localStorage.setItem(FELLOW_STORAGE_KEY, JSON.stringify(state.fellows));
    state.fellows = loadFellows();
    renderFellowEditors();
    updateFellowSummary();
  }

  async function applyFellowsToContent(commit = false) {
    setAdminStatus("[data-fellow-status]", commit ? "content.js 반영 및 commit 중..." : "content.js 반영 중...");

    try {
      saveFellows();
      const data = await postAdminData("/api/admin/fellows", {
        fellowProfiles: state.fellows,
        commit,
      });
      setAdminStatus("[data-fellow-status]", data.message || "Fellow 데이터 반영 완료", "success");
    } catch (error) {
      setAdminStatus("[data-fellow-status]", directApplyHelp(error), "error");
    }
  }

  function resetFellows() {
    localStorage.removeItem(FELLOW_STORAGE_KEY);
    state.fellows = clone(content.fellowProfiles || []);
    renderFellowEditors();
    updateFellowSummary();
  }

  function addFellow() {
    state.fellows.push(createEmptyFellow());
    renderFellowEditors();
    updateFellowSummary();
  }

  function createEmptyNews() {
    return {
      date: "날짜 입력",
      title: "새 뉴스",
      href: "",
      images: [],
    };
  }

  function updateNews(index, key, value) {
    state.news[index] = {
      ...state.news[index],
      [key]: value,
    };
    updateNewsSummary();
  }

  function newsFieldControl(index, key, labelText, value) {
    const label = document.createElement("label");
    const caption = document.createElement("span");
    const field = document.createElement("input");
    label.className = "admin-field";
    caption.textContent = labelText;
    field.type = "text";
    field.value = value || "";
    field.addEventListener("input", () => {
      updateNews(index, key, field.value);
      if (key === "title") {
        const title = field.closest(".news-admin-card")?.querySelector("h3");
        if (title) title.textContent = field.value || `뉴스 ${index + 1}`;
      }
    });
    if (key === "href") {
      field.addEventListener("blur", () => {
        field.value = normalizeHref(field.value);
        updateNews(index, key, field.value);
      });
    }
    label.append(caption, field);
    return label;
  }

  function renderNewsImages(profile, index) {
    const list = document.createElement("div");
    const images = imageListFor(profile);
    list.className = "news-image-list";

    if (!images.length) {
      const empty = document.createElement("p");
      empty.className = "news-image-empty";
      empty.textContent = "등록된 사진 없음";
      list.append(empty);
      return list;
    }

    images.forEach((source, imageIndex) => {
      const item = document.createElement("figure");
      const image = document.createElement("img");
      const remove = document.createElement("button");
      item.className = "news-image-card";
      image.src = source;
      image.alt = "";
      remove.className = "admin-button danger";
      remove.type = "button";
      remove.textContent = "사진 삭제";
      remove.addEventListener("click", () => {
        state.news[index].images.splice(imageIndex, 1);
        renderNewsEditors();
        updateNewsSummary();
      });
      item.append(image, remove);
      list.append(item);
    });

    return list;
  }

  function renderNewsEditors() {
    const editors = state.news.map((profile, index) => {
      const article = document.createElement("article");
      const heading = document.createElement("div");
      const title = document.createElement("h3");
      const deleteNews = document.createElement("button");
      const fields = document.createElement("div");
      const actions = document.createElement("div");
      const uploadLabel = document.createElement("label");
      const uploadInput = document.createElement("input");
      const uploadText = document.createElement("span");

      article.className = "news-admin-card";
      heading.className = "news-admin-card-heading";
      title.textContent = profile.title || `뉴스 ${index + 1}`;
      deleteNews.className = "admin-button danger";
      deleteNews.type = "button";
      deleteNews.textContent = "뉴스 삭제";
      deleteNews.addEventListener("click", () => {
        state.news.splice(index, 1);
        renderNewsEditors();
        updateNewsSummary();
      });
      heading.append(title, deleteNews);

      fields.className = "news-admin-fields";
      fields.append(
        newsFieldControl(index, "date", "날짜", profile.date),
        newsFieldControl(index, "title", "제목", profile.title),
        newsFieldControl(index, "href", "링크", profile.href)
      );

      actions.className = "news-photo-actions";
      uploadLabel.className = "admin-button file-button";
      uploadInput.type = "file";
      uploadInput.accept = "image/*";
      uploadInput.multiple = true;
      uploadInput.addEventListener("change", async () => {
        const files = Array.from(uploadInput.files || []);
        if (!files.length) return;
        try {
          const resizedImages = await Promise.all(files.map((file) => resizeImage(file)));
          state.news[index].images = [...imageListFor(state.news[index]), ...resizedImages];
          renderNewsEditors();
          updateNewsSummary();
        } catch (error) {
          window.alert(error.message);
        }
      });
      uploadText.textContent = "사진 업로드";
      uploadLabel.append(uploadInput, uploadText);
      actions.append(uploadLabel);

      article.append(heading, fields, actions, renderNewsImages(profile, index));
      return article;
    });

    document.querySelector(".news-admin-list").replaceChildren(...editors);
  }

  function newsOutputText() {
    return `news: ${JSON.stringify(state.news, null, 2)},`;
  }

  function updateNewsSummary() {
    document.querySelector("[data-news-count]").textContent = String(state.news.length);
    document.querySelector("#news-output").value = newsOutputText();
  }

  function saveNews() {
    state.news = state.news.map(normalizeNewsItem);
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(state.news));
    state.news = loadNews();
    renderNewsEditors();
    updateNewsSummary();
  }

  async function applyNewsToContent(commit = false) {
    setAdminStatus("[data-news-status]", commit ? "content.js 반영 및 commit 중..." : "content.js 반영 중...");

    try {
      saveNews();
      const data = await postAdminData("/api/admin/news", {
        news: state.news,
        commit,
      });
      setAdminStatus("[data-news-status]", data.message || "뉴스 데이터 반영 완료", "success");
    } catch (error) {
      setAdminStatus("[data-news-status]", directApplyHelp(error), "error");
    }
  }

  function resetNews() {
    localStorage.removeItem(NEWS_STORAGE_KEY);
    state.news = clone(content.news || []).map(normalizeNewsItem);
    renderNewsEditors();
    updateNewsSummary();
  }

  function addNews() {
    state.news.push(createEmptyNews());
    renderNewsEditors();
    updateNewsSummary();
  }

  document.querySelector("[data-save]").addEventListener("click", saveMentors);
  document.querySelector("[data-apply-mentors]").addEventListener("click", () => applyMentorsToContent(false));
  document.querySelector("[data-commit-mentors]").addEventListener("click", () => applyMentorsToContent(true));
  document.querySelector("[data-reset]").addEventListener("click", resetMentors);
  document.querySelector("[data-download]").addEventListener("click", () => {
    downloadJson("mentor-recruiting-statuses.json", {
      updatedAt: new Date().toISOString(),
      mentorRecruitingStatuses: fullStatusMap(),
      labels: statusLabels,
    });
  });
  document.querySelector("[data-save-fellows]").addEventListener("click", saveFellows);
  document.querySelector("[data-apply-fellows]").addEventListener("click", () => applyFellowsToContent(false));
  document.querySelector("[data-commit-fellows]").addEventListener("click", () => applyFellowsToContent(true));
  document.querySelector("[data-reset-fellows]").addEventListener("click", resetFellows);
  document.querySelector("[data-add-fellow]").addEventListener("click", addFellow);
  document.querySelector("[data-download-fellows]").addEventListener("click", () => {
    downloadJson("fellow-profiles.json", {
      updatedAt: new Date().toISOString(),
      fellowProfiles: state.fellows,
    });
  });
  document.querySelector("[data-save-news]").addEventListener("click", saveNews);
  document.querySelector("[data-apply-news]").addEventListener("click", () => applyNewsToContent(false));
  document.querySelector("[data-commit-news]").addEventListener("click", () => applyNewsToContent(true));
  document.querySelector("[data-reset-news]").addEventListener("click", resetNews);
  document.querySelector("[data-add-news]").addEventListener("click", addNews);
  document.querySelector("[data-download-news]").addEventListener("click", () => {
    downloadJson("news-items.json", {
      updatedAt: new Date().toISOString(),
      news: state.news,
    });
  });

  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    header.dataset.elevated = String(window.scrollY > 24);
  });

  renderMentorRows();
  updateMentorSummary();
  renderFellowEditors();
  updateFellowSummary();
  renderNewsEditors();
  updateNewsSummary();
})();
