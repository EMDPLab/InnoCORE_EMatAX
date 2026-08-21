# PI Opening Publishing Pipeline

This is the standard workflow for turning a PI issue form submission into a published PI-specific opening page.

## 1. Review The Issue Form

Use `.github/ISSUE_TEMPLATE/pi-opening.yml` as the source of truth.

Required submitted fields:

- PI name
- Lab or group name
- Hiring status
- Research area
- Project fit and preferred background
- Hiring timeline
- Contact link or email

Before publishing, remove sensitive internal notes and confirm that the PI wants the opening shown publicly.

## 2. Match The PI Slug

PI detail URLs use the English mentor name from `content.js`.

Slug rule:

```text
Dong Hae Ho -> dong-hae-ho
Su-Mi Hur -> su-mi-hur
```

The opening entry `id` must match the generated PI page URL:

```text
pi.html?id=<pi-slug>
```

## 3. Update `content.js`

Add or update the matching object in both `ko.piOpenings` and `en.piOpenings`.

Use this structure:

```js
{
  id: "<pi-slug>",
  status: "<public hiring status>",
  title: "<short opening title>",
  pi: "<PI display name>",
  lab: "<lab or group name>",
  area: "<research area>",
  fit: "<public project fit and preferred background>",
  timeline: "<hiring timeline>",
  contactLabel: "<Contact label>",
  contactHref: "<mailto:... or https://...>",
  heroImage: "./assets/pi-openings/<pi-slug>-header.png",
  flyer: "./assets/pi-openings/<pi-slug>-flyer.png"
}
```

`heroImage` is the primary asset for the PI detail page. `flyer` is optional legacy/poster support.

## 4. Generate The Header Image

Use the built-in image generation workflow and follow `flyer_design.md`.

Image requirements:

- Wide horizontal header, preferably around 2:1
- One full-width row on the PI detail page
- White, navy, blue, lime only
- Left side: program, PI opening title, PI/lab, research area
- Right side: complete technical schematic
- No contact email, timeline, lower metadata strip, QR code, fake logo, watermark, gradient, or cropped schematic edge

Save the final selected image as:

```text
assets/pi-openings/<pi-slug>-header.png
```

If generated text is imperfect, keep the precise facts in HTML and regenerate only when the image itself is visually misleading.

## 5. Layout Check

Confirm that the PI page renders in this order:

1. Back link
2. Full-row `heroImage`
3. PI meta cards
4. Opening status, fit, timeline, contact, and lab website actions

The image should not sit inside the opening text card.

## 6. QA Checklist

Run:

```bash
node --check content.js
node --check app.js
node --check pi.js
```

Check:

- `content.js` has matching Korean and English entries
- `heroImage` path exists
- `pi.html?id=<pi-slug>` uses the correct PI
- CSS still uses only the approved four hex colors
- Contact link works as `mailto:` or `https://`
- No internal notes are published

## 7. Commit And Deploy

Commit the content, image, and documentation changes together.

After pushing to `main`, verify GitHub Pages:

```text
https://emdplab.github.io/InnoCORE_EMatAX/pi.html?id=<pi-slug>
https://emdplab.github.io/InnoCORE_EMatAX/assets/pi-openings/<pi-slug>-header.png
```

If the page still shows the old asset, bump the cache query version in `index.html` and `pi.html`.
