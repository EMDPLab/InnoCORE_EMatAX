const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../content.js"), "utf8"), context);
const { ko, en } = JSON.parse(JSON.stringify(context.window.INNOCORE_CONTENT));

test("English Fellow profiles contain translated research and affiliation text", () => {
  assert.deepEqual(en.fellowProfiles.map((p) => p.nameEn), ko.fellowProfiles.map((p) => p.nameEn));
  for (const profile of ko.fellowProfiles) {
    assert.match(profile.summary, /[가-힣]/, `${profile.nameEn}: Korean summary was overwritten`);
  }
  for (const profile of en.fellowProfiles) {
    for (const field of ["summary", "currentPi", "researchArea", "affiliation", "status"]) {
      assert.ok(profile[field]?.trim(), `${profile.nameEn}: missing ${field}`);
      assert.doesNotMatch(profile[field], /[가-힣]/, `${profile.nameEn}: untranslated ${field}`);
    }
  }
});

test("English news uses translated titles, descriptions, and dates", () => {
  assert.equal(en.news.length, ko.news.length);
  for (const item of en.news) {
    assert.ok(item.title.trim());
    for (const field of ["title", "description", "date"]) {
      assert.doesNotMatch(item[field] || "", /[가-힣]/, `untranslated news ${field}`);
    }
  }
});

test("Language catalogs retain matching public sections and PI identities", () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(ko).sort());
  assert.deepEqual(en.mentors.map((p) => p.nameEn), ko.mentors.map((p) => p.nameEn));
  assert.deepEqual(en.piOpenings.map((p) => p.id), ko.piOpenings.map((p) => p.id));
  for (const mentor of en.mentors) {
    for (const field of ["nameEn", "role", "affiliation", "department"]) {
      assert.doesNotMatch(mentor[field] || "", /[가-힣]/, `${mentor.nameEn}: untranslated ${field}`);
    }
  }
});
