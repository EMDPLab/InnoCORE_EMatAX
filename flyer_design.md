# PI Opening Flyer Design

This document standardizes generated flyer images for PI-specific E-MatAX openings.

## Purpose

Each PI opening page may include one generated flyer image summarizing lab-level recruitment needs.

The flyer should help applicants understand:

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

- Aspect ratio: 4:5 vertical flyer
- Intended display: PI detail page and social preview
- Background: clean white
- Composition: structured academic recruitment flyer
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
5. Candidate fit
6. Timeline and contact

Text must be legible, but generated-image text can be imperfect. The webpage should also provide the same information as real HTML text for accessibility and accuracy.

## Prompt Template

```text
Use case: ads-marketing
Asset type: PI-specific recruitment flyer for the E-MatAX webpage
Primary request: Create a polished academic recruitment flyer for <PI name>, <Lab name>.
Scene/backdrop: clean white university research flyer, strict grid layout
Subject: energy materials / <research topic> represented abstractly with lab-grade materials imagery
Style/medium: modern Korean university recruitment design, minimal AI-friendly typography
Composition/framing: 4:5 vertical poster, large title area, structured information blocks, generous margins
Lighting/mood: bright, precise, credible, research-forward
Color palette: white 70%, navy 13%, blue 13%, lime 4%; no other colors
Text (verbatim): include only the approved concise copy
Constraints: no QR code, no fake logos, no watermark, no spellcheck underlines, no decorative blobs, no gradients
Avoid: crowded layout, stock-photo feel, illegible text, random icons, extra colors
```

## File Naming

Save generated flyer assets under:

```text
assets/pi-openings/<pi-slug>-flyer.png
```

Example:

```text
assets/pi-openings/dong-hae-ho-flyer.png
```
