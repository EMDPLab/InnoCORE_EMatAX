(function () {
  const STORAGE_KEY = "innocore-mentor-recruiting-statuses";
  const content = window.INNOCORE_CONTENT.ko;
  const defaultStatus = content.mentorDefaultRecruitingStatus || "active";
  const options = content.mentorRecruitingStatusOptions || [
    { value: "active", label: "적극 채용중" },
    { value: "inactive", label: "채용중 아님" },
  ];
  const statusLabels = content.mentorRecruitingStatusLabels || {};

  const state = {
    statuses: loadStatuses(),
  };

  function loadStatuses() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return stored && typeof stored === "object" ? stored : {};
    } catch {
      return {};
    }
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
        updateSummary();
      });
      text.textContent = option.label;
      label.append(input, text);
      group.append(label);
    });

    return group;
  }

  function renderRows() {
    const rows = content.mentors.map((mentor) => {
      const row = document.createElement("tr");
      const name = document.createElement("td");
      const area = document.createElement("td");
      const affiliation = document.createElement("td");
      const status = document.createElement("td");
      name.innerHTML = `<strong>${mentor.name}</strong><span>${mentor.nameEn}</span>`;
      area.textContent = mentor.area || content.mentorAreas?.[mentor.name] || "-";
      affiliation.textContent = mentor.affiliation || "-";
      status.append(renderStatusControls(mentor));
      row.append(name, area, affiliation, status);
      return row;
    });

    document.querySelector(".admin-table tbody").replaceChildren(...rows);
  }

  function outputText() {
    const map = fullStatusMap();
    return `mentorRecruitingStatuses: ${JSON.stringify(map, null, 2)},`;
  }

  function updateSummary() {
    const values = Object.values(fullStatusMap());
    document.querySelector("[data-active-count]").textContent = String(values.filter((value) => value === "active").length);
    document.querySelector("[data-inactive-count]").textContent = String(values.filter((value) => value === "inactive").length);
    document.querySelector("#admin-output").value = outputText();
  }

  function saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullStatusMap()));
    state.statuses = loadStatuses();
    renderRows();
    updateSummary();
  }

  function resetLocal() {
    localStorage.removeItem(STORAGE_KEY);
    state.statuses = {};
    renderRows();
    updateSummary();
  }

  function downloadJson() {
    const data = {
      updatedAt: new Date().toISOString(),
      mentorRecruitingStatuses: fullStatusMap(),
      labels: statusLabels,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mentor-recruiting-statuses.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  document.querySelector("[data-save]").addEventListener("click", saveLocal);
  document.querySelector("[data-reset]").addEventListener("click", resetLocal);
  document.querySelector("[data-download]").addEventListener("click", downloadJson);

  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    header.dataset.elevated = String(window.scrollY > 24);
  });

  renderRows();
  updateSummary();
})();
