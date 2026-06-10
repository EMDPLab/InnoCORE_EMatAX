# PI Opening Header Image Design

This document standardizes generated header images for PI-specific E-MatAX openings.

## Purpose

Each PI opening page may include one generated header image summarizing lab-level recruitment needs.

The header image should help applicants quickly understand:

- PI and lab name
- Recruiting status
- Research topic
- Preferred candidate background
- Hiring timeline
- Contact route

## Visual System

Use the same visual language as the E-MatAX webpage.

- Palette: white, navy, blue, lime only
- Dominant color balance: white 70%, navy 13%, blue 13%, lime 4%
- Typography feel: minimal, technical, AI-friendly, academic
- Layout: strict grid, generous margins, no decorative blobs, no gradients
- Borders: thin navy or blue rules only
- Cards: square or very lightly rounded corners, no side/top color bars
- Mood: precise, research-forward, credible, easy to scan

## Required Format

- Aspect ratio: wide horizontal header, preferably around 2:1
- Intended display: one full-width row at the top of a PI detail page
- Background: clean white
- Composition: structured academic webpage header, not a dense poster
- No QR code unless explicitly provided
- No fake institutional seals
- No excessive body text

## Text Rules

Use concise bilingual-friendly text. Korean text may be included when the opening is submitted in Korean.

Recommended hierarchy:

1. Program line: `DGIST InnoCORE E-MatAX`
2. Main title: `Postdoctoral Fellow Opening`
3. PI and lab: PI name, lab name
4. Research focus
5. Research visual motif

Recruiting status, timeline, contact, and detailed fit should remain as real HTML text below the image whenever possible. This prevents generated-image text errors from becoming the only source of truth.

Text must be legible, but generated-image text can be imperfect. The webpage should also provide the same information as real HTML text for accessibility and accuracy.

## Prompt Template

```text
Use case: ads-marketing
Asset type: PI-specific wide visual header for the E-MatAX webpage
Primary request: Create a polished academic webpage header image for <PI name>, <Lab name>.
Scene/backdrop: clean white university research header, strict grid layout
Subject: energy materials / <research topic> represented abstractly with lab-grade materials imagery
Style/medium: modern Korean university recruitment design, minimal AI-friendly typography
Composition/framing: wide horizontal image, one full webpage row, large title area on the left, complete technical schematic on the right, generous margins
Lighting/mood: bright, precise, credible, research-forward
Color palette: white 70%, navy 13%, blue 13%, lime 4%; no other colors
Text (verbatim): include only the approved concise copy
Constraints: no QR code, no fake logos, no watermark, no spellcheck underlines, no decorative blobs, no gradients, no lower metadata strip
Avoid: crowded layout, stock-photo feel, illegible text, random icons, extra colors, cropped schematic edges
```

## File Naming

Save generated header assets under:

```text
assets/pi-openings/<pi-slug>-flyer.png
assets/pi-openings/<pi-slug>-header.png
```

Example:

```text
assets/pi-openings/dong-hae-ho-flyer.png
assets/pi-openings/dong-hae-ho-header.png
```
