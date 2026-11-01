const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "content.js"), "utf8"), context);
const catalogs = JSON.parse(JSON.stringify(context.window.INNOCORE_CONTENT));

test("Boards have stable bilingual identities, source dates, categories and working local media", () => {
  const identity = (post) => [post.id, post.category, post.sortDate, post.archived || false, post.href, post.images];
  assert.deepEqual(catalogs.ko.news.map(identity), catalogs.en.news.map(identity));
  for (const catalog of Object.values(catalogs)) {
    const ids = new Set();
    for (const post of catalog.news) {
      assert.match(post.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.ok(!ids.has(post.id), `Duplicate shared URL: ${post.id}`);
      ids.add(post.id);
      assert.ok(["notice", "seminar", "recruitment"].includes(post.category));
      assert.ok(post.title.trim());
      assert.ok(post.date.trim());
      if (post.sortDate) {
        assert.match(post.sortDate, /^\d{4}-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?$/);
        const iso = post.sortDate.length === 7 ? `${post.sortDate}-01` : post.sortDate;
        assert.equal(new Date(iso).toISOString().slice(0, 10), iso, `Invalid source date for ${post.id}`);
      }
      if (post.href) assert.match(post.href, /^https:\/\//);
      for (const image of post.images) {
        for (const file of [image.thumb, image.full]) {
          assert.ok(fs.existsSync(path.join(root, file)), `Missing published image: ${file}`);
        }
      }
    }
    assert.deepEqual([...new Set(catalog.news.map((post) => post.category))].sort(), ["notice", "recruitment", "seminar"]);
    assert.ok(catalog.nav.some((item) => item.href === "./boards.html"));
  }
});

test("Public artifact includes board and existing site resources, excludes local administration", () => {
  execFileSync(process.execPath, [path.join(root, "scripts/build-site.cjs")]);
  const output = path.join(root, "dist");
  for (const file of ["index.html", "boards.html", "boards.js", "boards.css", "pi.html", "fellows.html", "data.html", "data-portal/config.js"]) {
    assert.ok(fs.existsSync(path.join(output, file)), `Missing public file: ${file}`);
  }
  for (const file of ["admin.html", "admin-server.js", "admin.js", "BOARDS_ADMIN.md", ".git", "tests", "data-portal/Code.gs", "data-portal/README.md"]) {
    assert.ok(!fs.existsSync(path.join(output, file)), `Internal file in artifact: ${file}`);
  }
  for (const file of ["index.html", "boards.html", "pi.html", "fellows.html", "data.html"]) {
    const html = fs.readFileSync(path.join(output, file), "utf8");
    for (const match of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)(?:[?#][^"]*)?"/g)) {
      assert.ok(fs.existsSync(path.join(output, match[1])), `${file} references missing resource ${match[1]}`);
    }
  }
});
