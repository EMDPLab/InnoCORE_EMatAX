const childProcess = require("child_process");
const fs = require("fs/promises");
const http = require("http");
const path = require("path");
const util = require("util");
const vm = require("vm");

const execFile = util.promisify(childProcess.execFile);
const repoRoot = __dirname;
const repoContentFile = path.join(repoRoot, "content.js");
const contentFile = process.env.CONTENT_FILE ? path.resolve(process.env.CONTENT_FILE) : repoContentFile;
const port = Number(process.env.PORT || 8787);
const host = "127.0.0.1";
const maxBodyBytes = 12 * 1024 * 1024;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

async function readJson(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      const error = new Error("요청 데이터가 너무 큽니다. 사진 용량을 줄인 뒤 다시 시도해주세요.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("JSON 요청 형식이 올바르지 않습니다.");
    error.statusCode = 400;
    throw error;
  }
}

function loadContent(source) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "content.js", timeout: 1000 });

  if (!sandbox.window.INNOCORE_CONTENT?.ko || !sandbox.window.INNOCORE_CONTENT?.en) {
    throw new Error("content.js에서 INNOCORE_CONTENT 데이터를 찾을 수 없습니다.");
  }

  return sandbox.window.INNOCORE_CONTENT;
}

function findValueEnd(source, start) {
  const opener = source[start];
  const closers = { "{": "}", "[": "]", "(": ")" };

  if (closers[opener]) {
    let depth = 0;
    let quote = "";
    let escaped = false;
    let lineComment = false;
    let blockComment = false;

    for (let index = start; index < source.length; index += 1) {
      const char = source[index];
      const next = source[index + 1];

      if (lineComment) {
        if (char === "\n") lineComment = false;
        continue;
      }

      if (blockComment) {
        if (char === "*" && next === "/") {
          blockComment = false;
          index += 1;
        }
        continue;
      }

      if (quote) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === quote) {
          quote = "";
        }
        continue;
      }

      if (char === "/" && next === "/") {
        lineComment = true;
        index += 1;
        continue;
      }

      if (char === "/" && next === "*") {
        blockComment = true;
        index += 1;
        continue;
      }

      if (char === "\"" || char === "'" || char === "`") {
        quote = char;
        continue;
      }

      if (closers[char]) {
        depth += 1;
        continue;
      }

      if (Object.values(closers).includes(char)) {
        depth -= 1;
        if (depth === 0) return index + 1;
      }
    }
  }

  if (opener === "\"" || opener === "'") {
    let escaped = false;
    for (let index = start + 1; index < source.length; index += 1) {
      const char = source[index];
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === opener) {
        return index + 1;
      }
    }
  }

  const primitiveEnd = source.slice(start).search(/[\n,]/);
  return primitiveEnd === -1 ? source.length : start + primitiveEnd;
}

function formatValue(value, indent) {
  return JSON.stringify(value, null, 2)
    .split("\n")
    .map((line, index) => (index === 0 ? line : `${indent}${line}`))
    .join("\n");
}

function replaceNthProperty(source, propertyName, occurrenceIndex, value) {
  const pattern = new RegExp(`(^|\\n)([ \\t]*)${propertyName}\\s*:`, "g");
  let match;
  let count = 0;

  while ((match = pattern.exec(source)) !== null) {
    if (count === occurrenceIndex) {
      const indent = match[2];
      let valueStart = pattern.lastIndex;

      while (/\s/.test(source[valueStart])) valueStart += 1;

      const valueEnd = findValueEnd(source, valueStart);
      return `${source.slice(0, valueStart)}${formatValue(value, indent)}${source.slice(valueEnd)}`;
    }
    count += 1;
  }

  throw new Error(`${propertyName} 항목을 content.js에서 찾을 수 없습니다.`);
}

function validateMentorStatuses(rawStatuses, content) {
  if (!rawStatuses || typeof rawStatuses !== "object" || Array.isArray(rawStatuses)) {
    throw new Error("멘토 채용상태 데이터가 올바르지 않습니다.");
  }

  const allowedStatuses = new Set(["active", "inactive"]);
  const mentors = content.ko.mentors || [];
  const mentorNames = new Set(mentors.map((mentor) => mentor.name));
  const defaultStatus = content.ko.mentorDefaultRecruitingStatus || "active";
  const statuses = {};

  Object.entries(rawStatuses).forEach(([name, status]) => {
    if (!mentorNames.has(name)) {
      throw new Error(`등록되지 않은 멘토입니다: ${name}`);
    }
    if (!allowedStatuses.has(status)) {
      throw new Error(`채용상태 값이 올바르지 않습니다: ${name}`);
    }
  });

  mentors.forEach((mentor) => {
    statuses[mentor.name] = rawStatuses[mentor.name] || defaultStatus;
  });

  return statuses;
}

function isAllowedImageSource(image) {
  return (
    image === "" ||
    image.startsWith("data:image/") ||
    image.startsWith("./") ||
    image.startsWith("/") ||
    image.startsWith("https://") ||
    image.startsWith("http://")
  );
}

function validateFellowProfiles(rawProfiles) {
  if (!Array.isArray(rawProfiles)) {
    throw new Error("Fellow 프로필 데이터가 올바르지 않습니다.");
  }

  if (rawProfiles.length > 200) {
    throw new Error("Fellow 프로필 수가 너무 많습니다.");
  }

  const fields = ["name", "nameEn", "status", "currentPi", "researchArea", "affiliation", "summary", "image"];

  return rawProfiles.map((profile, index) => {
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
      throw new Error(`Fellow ${index + 1} 프로필 형식이 올바르지 않습니다.`);
    }

    const cleanProfile = {};
    fields.forEach((field) => {
      cleanProfile[field] = typeof profile[field] === "string" ? profile[field] : "";
    });

    if (!isAllowedImageSource(cleanProfile.image)) {
      throw new Error(`Fellow ${index + 1} 사진 경로가 올바르지 않습니다.`);
    }

    return cleanProfile;
  });
}

function isAllowedHref(href) {
  return (
    href === "" ||
    href.startsWith("#") ||
    href.startsWith("./") ||
    href.startsWith("/") ||
    href.startsWith("https://") ||
    href.startsWith("http://") ||
    href.startsWith("mailto:")
  );
}

function imageListFor(item) {
  if (Array.isArray(item?.images)) return item.images.filter(Boolean);
  return item?.image ? [item.image] : [];
}

function validateNewsItems(rawItems) {
  if (!Array.isArray(rawItems)) {
    throw new Error("뉴스 데이터가 올바르지 않습니다.");
  }

  if (rawItems.length > 100) {
    throw new Error("뉴스 항목 수가 너무 많습니다.");
  }

  return rawItems.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`뉴스 ${index + 1} 형식이 올바르지 않습니다.`);
    }

    const cleanItem = {
      date: typeof item.date === "string" ? item.date : "",
      title: typeof item.title === "string" ? item.title : "",
      href: typeof item.href === "string" ? item.href : "",
      images: imageListFor(item),
    };

    if (!isAllowedHref(cleanItem.href)) {
      throw new Error(`뉴스 ${index + 1} 링크가 올바르지 않습니다.`);
    }

    cleanItem.images.forEach((image, imageIndex) => {
      if (!isAllowedImageSource(image)) {
        throw new Error(`뉴스 ${index + 1}의 ${imageIndex + 1}번째 사진 경로가 올바르지 않습니다.`);
      }
    });

    return cleanItem;
  });
}

async function writeContent(nextSource) {
  const tmpFile = `${contentFile}.tmp-${process.pid}`;
  await fs.writeFile(tmpFile, nextSource, "utf8");
  await fs.rename(tmpFile, contentFile);
}

async function git(args) {
  return execFile("git", args, { cwd: repoRoot, maxBuffer: 1024 * 1024 });
}

async function commitContent(message) {
  if (contentFile !== repoContentFile) {
    throw new Error("CONTENT_FILE 테스트 모드에서는 commit을 만들 수 없습니다.");
  }

  await git(["commit", "--only", "content.js", "-m", message]);
  const result = await git(["rev-parse", "--short", "HEAD"]);
  return result.stdout.trim();
}

async function finishUpdate(source, nextSource, shouldCommit, commitMessage) {
  if (source === nextSource) {
    return { changed: false, committed: false, message: "변경 사항이 없습니다." };
  }

  await writeContent(nextSource);

  if (!shouldCommit) {
    return { changed: true, committed: false, message: "content.js에 반영했습니다." };
  }

  const commitHash = await commitContent(commitMessage);
  return {
    changed: true,
    committed: true,
    commitHash,
    message: `content.js 반영 후 commit 완료 (${commitHash})`,
  };
}

async function updateMentors(payload) {
  const source = await fs.readFile(contentFile, "utf8");
  const content = loadContent(source);
  const statuses = validateMentorStatuses(payload.mentorRecruitingStatuses, content);
  let nextSource = replaceNthProperty(source, "mentorRecruitingStatuses", 0, statuses);
  nextSource = replaceNthProperty(nextSource, "mentorRecruitingStatuses", 1, statuses);
  return finishUpdate(source, nextSource, Boolean(payload.commit), "chore(content): update mentor statuses");
}

async function updateFellows(payload) {
  const source = await fs.readFile(contentFile, "utf8");
  loadContent(source);
  const profiles = validateFellowProfiles(payload.fellowProfiles);
  let nextSource = replaceNthProperty(source, "fellowProfiles", 0, profiles);
  nextSource = replaceNthProperty(nextSource, "fellowProfiles", 1, profiles);
  return finishUpdate(source, nextSource, Boolean(payload.commit), "chore(content): update fellow profiles");
}

async function updateNews(payload) {
  const source = await fs.readFile(contentFile, "utf8");
  loadContent(source);
  const news = validateNewsItems(payload.news);
  let nextSource = replaceNthProperty(source, "news", 0, news);
  nextSource = replaceNthProperty(nextSource, "news", 1, news);
  return finishUpdate(source, nextSource, Boolean(payload.commit), "chore(content): update news items");
}

function staticPathFor(pathname) {
  const decodedPath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  const normalized = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = normalized === "/content.js" ? contentFile : path.join(repoRoot, normalized);
  const resolved = path.resolve(filePath);

  if (resolved !== contentFile && !resolved.startsWith(`${repoRoot}${path.sep}`)) {
    return null;
  }

  return resolved;
}

async function serveStatic(request, response, pathname) {
  const filePath = staticPathFor(pathname);
  if (!filePath) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(data);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      sendText(response, 404, "Not found");
      return;
    }
    throw error;
  }
}

async function handleApi(request, response, pathname) {
  if (request.method !== "POST") {
    sendJson(response, 405, { ok: false, error: "POST 요청만 지원합니다." });
    return;
  }

  const payload = await readJson(request);
  const handlers = {
    "/api/admin/mentors": updateMentors,
    "/api/admin/fellows": updateFellows,
    "/api/admin/news": updateNews,
  };
  const result = await handlers[pathname](payload);
  sendJson(response, 200, { ok: true, ...result });
}

const server = http.createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url, `http://${host}:${port}`);

    if (pathname === "/api/admin/mentors" || pathname === "/api/admin/fellows" || pathname === "/api/admin/news") {
      await handleApi(request, response, pathname);
      return;
    }

    await serveStatic(request, response, pathname);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(response, statusCode, { ok: false, error: error.message || "서버 오류가 발생했습니다." });
  }
});

server.listen(port, host, () => {
  console.log(`Admin server: http://${host}:${port}/admin.html`);
});
