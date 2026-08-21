# PI Openings Admin Plan

This document defines how PI-specific opening posts should be managed.

## Current Static Version

The public webpage renders PI-specific openings from `content.js`.

Administrators can update the `piOpenings` arrays in Korean and English, then commit and deploy the change.

Each PI detail page is rendered by `pi.html` and `pi.js` from the `mentors` array in `content.js`.
When a `piOpenings` entry has a matching `id`, that detail page also displays the PI-specific opening details and header image.

Example:

```text
pi.html?id=su-mi-hur
```

The `id` is generated from the PI's English name.

This is safe for public hosting because the page only reads static data.

## Why A Frontend Password Is Not Enough

A static GitHub Pages site cannot securely support "enter password and edit the site" by itself.

Do not store an edit password in `app.js`, `content.js`, or any other frontend file. Visitors can inspect frontend code, recover the password, and bypass any client-side checks. A static page also cannot safely write approved changes back to the GitHub repository without exposing a GitHub token.

## Recommended Management Options

### Option 1: Admin-Reviewed Form

Use a Google Form, Tally form, Airtable form, or GitHub issue template.

This repository includes a GitHub issue template at `.github/ISSUE_TEMPLATE/pi-opening.yml`.
Use `PI_OPENING_PIPELINE.md` for the full issue-form-to-webpage publishing workflow.

PI submits:

- PI name
- Lab name
- Hiring status
- Research area
- Detailed project fit
- Preferred applicant background
- Hiring timeline
- Contact link

An administrator reviews the submission and updates `content.js`.

For public PI detail pages, create one matching header image for the opening:

- Follow `flyer_design.md`.
- Save the image as `assets/pi-openings/<pi-slug>-header.png`.
- Add `heroImage: "./assets/pi-openings/<pi-slug>-header.png"` to the Korean and English `piOpenings` entries.

This is the lowest-risk workflow for the first public version.

### Option 2: Authenticated CMS

Use Decap CMS, TinaCMS, or another Git-based CMS with authenticated GitHub access.

Each PI gets an account. Changes become Git commits or pull requests, so administrators can review them before publishing.

This is suitable if nontechnical users need regular editing access.

### Option 3: Backend Admin System

Use Supabase or Firebase with authentication and database rules.

The public site reads approved openings from the database. PIs sign in, edit only their own opening, and admins approve or publish changes.

This is the most flexible option, but it requires backend setup and security rules.

## Public Display Policy

Each PI opening should clearly show whether the lab is:

- Actively recruiting
- Reviewing candidates
- Planning future recruitment
- Not currently recruiting

Avoid showing stale openings. Every card should include a last-updated date or update cycle before public launch.
