# DGIST InnoCORE E-MatAX Webpage

This repository contains a standalone static webpage for the DGIST InnoCORE E-MatAX 사업단.

Because the site is static, it can be hosted directly with GitHub Pages, Netlify, Vercel, or any ordinary static web server.

## Files

- `index.html`: page structure. Routine content edits should not require changing this file.
- `content.js`: editable Korean and English page content.
- `app.js`: renders navigation, cards, language switching, and links from `content.js`.
- `pi.html`, `pi.js`: reusable PI detail page template.
- `styles.css`: visual system and responsive layout.
- `flyer_design.md`: standard image-generation spec for PI opening flyers.
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
- PI-specific opening cards: `piOpenings`
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

## PI Opening Management

PI-specific opening cards are rendered from the `piOpenings` arrays in `content.js`.

Each mentor also has a shareable PI detail page generated from the `mentors` array. The URL format is:

```text
pi.html?id=su-mi-hur
```

The `id` is generated from the mentor's English name in `content.js`. For example, `Su-Mi Hur` becomes `su-mi-hur`.

Each entry supports:

- `id`: PI detail page id, matching `pi.html?id=<pi-slug>`
- `status`: recruiting status shown at the top of the card
- `title`: opening title
- `pi`: PI name
- `lab`: lab or group name
- `area`: research area
- `fit`: preferred candidate fit or project note
- `timeline`: expected update or hiring timing
- `contactLabel`, `contactHref`: contact link
- `flyer`: optional 4:5 flyer image path, usually `./assets/pi-openings/<pi-slug>-flyer.png`

PI opening flyer images should follow `flyer_design.md` so every PI page uses the same visual standard.

Direct browser-based editing with a shared password cannot be implemented securely in this static-only site. A password embedded in frontend JavaScript would be visible to visitors and would not safely write changes back to GitHub.

For PI self-service editing, use one of these managed workflows:

- GitHub-based review: PIs submit updates through a form or issue template; an administrator reviews and merges changes.
- Headless CMS: connect the repository to a CMS such as Decap CMS with authenticated GitHub access.
- Database-backed admin page: add a backend such as Supabase or Firebase Auth plus database rules, then render approved openings from that data source.

This repository includes a GitHub Issue Form at `.github/ISSUE_TEMPLATE/pi-opening.yml` so PIs can submit opening updates for administrator review.

## Release Check

Before final public release, verify recruitment-specific numbers such as annual hiring count, salary, contract period, and official application links with the latest approved notice.
