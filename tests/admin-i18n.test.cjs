const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const { spawn } = require("node:child_process");
const { test } = require("node:test");

function load(source) {
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return JSON.parse(JSON.stringify(context.window.INNOCORE_CONTENT));
}

test("Saving Korean profiles and news preserves the English catalog", { timeout: 10000 }, async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "ematax-i18n-"));
  const file = path.join(directory, "content.js");
  const source = await fs.readFile(path.join(__dirname, "../content.js"), "utf8");
  await fs.writeFile(file, source);
  const original = load(source);
  const server = spawn(process.execPath, [path.join(__dirname, "../admin-server.js")], {
    env: { ...process.env, CONTENT_FILE: file, PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(async () => {
    server.kill();
    await fs.rm(directory, { recursive: true, force: true });
  });
  const origin = await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.once("exit", (code) => reject(new Error(`Admin server exited: ${code}`)));
    server.stdout.on("data", (chunk) => {
      const match = chunk.toString().match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) resolve(match[0]);
    });
    server.stderr.on("data", (chunk) => reject(new Error(chunk.toString())));
  });
  const profiles = original.ko.fellowProfiles;
  profiles[0].summary += " 국문 수정 확인.";
  const news = original.ko.news;
  news[0].description += " 국문 수정 확인.";
  for (const [endpoint, payload] of [
    ["fellows", { fellowProfiles: profiles }],
    ["news", { news }],
  ]) {
    const response = await fetch(`${origin}/api/admin/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ok, true);
  }
  const saved = load(await fs.readFile(file, "utf8"));
  assert.equal(saved.ko.fellowProfiles[0].summary, profiles[0].summary);
  assert.equal(saved.ko.news[0].description, news[0].description);
  assert.equal(saved.ko.news[0].id, news[0].id);
  assert.equal(saved.ko.news[0].category, news[0].category);
  assert.equal(saved.ko.news[0].sortDate, news[0].sortDate);
  assert.equal(saved.ko.news[1].archived, news[1].archived);
  assert.deepEqual(saved.en, original.en);
});
