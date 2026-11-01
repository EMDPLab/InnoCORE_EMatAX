const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
const files = [
  ".nojekyll", "index.html", "fellows.html", "pi.html", "data.html", "boards.html",
  "styles.css", "content.js", "app.js", "fellows.js", "pi.js", "site-i18n.js", "boards.js", "boards.css",
  "data-portal/config.js", "data-portal/entry.js", "data-portal/entry.css",
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const file of files) {
  const target = path.join(output, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, file), target);
}
fs.cpSync(path.join(root, "assets"), path.join(output, "assets"), {
  recursive: true,
  filter: (source) => !path.basename(source).startsWith("."),
});
console.log("Public site built in dist/ (admin tools and operational documents excluded).");
