# DGIST InnoCORE E-MatAX Webpage

This repository contains a standalone static webpage for the DGIST InnoCORE E-MatAX 사업단.

Because the site is static, it can be hosted directly with GitHub Pages, Netlify, Vercel, or any ordinary static web server.

## Files

- `index.html`: page structure. Routine content edits should not require changing this file.
- `content.js`: editable Korean and English page content.
- `app.js`: renders navigation, cards, language switching, and links from `content.js`.
- `styles.css`: visual system and responsive layout.
- `assets/`: copied logos and campaign visuals used by the page.

## How To Update Content

Open `content.js` and edit only the text inside the `ko` and `en` objects.

Common updates:

- Menu labels: `nav`
- Hero title and lead text: `heroTitle`, `heroLead`
- Key numbers: `facts`
- Application steps and requirements: `howApply`, `requirements`
- Center snapshot, project period, and related links: `centerDetails`, `teams`, `relatedLinks`
- Research areas: `research`
- Fellow support items: `support`
- Mentor/faculty table: `mentors`
- Recent notices and events: `news`
- Official notices and contact links: `applyActions`

Keep the same key names in both languages so the language switch continues to work.

## Preview

Open `index.html` in a browser. No build step is required.

For stricter testing, run a local server from this folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

For GitHub Pages, publish from the repository root on the `main` branch. The root `index.html` is the entry page.

## Release Check

Before final public release, verify recruitment-specific numbers such as annual hiring count, salary, contract period, and official application links with the latest approved notice.
