(function () {
  const MENTOR_STORAGE_KEY = "innocore-mentor-recruiting-statuses";
  const FELLOW_STORAGE_KEY = "innocore-fellow-profiles";
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
      throw new Error(data?.error || `서버 응답 오류 ${response.status}`);
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

  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    header.dataset.elevated = String(window.scrollY > 24);
  });

  renderMentorRows();
  updateMentorSummary();
  renderFellowEditors();
  updateFellowSummary();
})();
