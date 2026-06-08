# Design QA Criteria

This webpage must pass the following checks before handoff.

## Readability

- Korean copy must read as public-facing program copy, not page-management or layout commentary.
- Major Korean headers must be short, catchphrase-like, and avoid awkward line breaks.
- At 1920 x 1080, Korean `h1` and major section `h2` headings should render on one line wherever the phrase is intended as a single headline.
- Korean text must use word-level wrapping, not syllable-level breaking.
- English copy must be reviewed independently from Korean copy; English `h1`, major `h2`, card titles, process labels, buttons, and table cells must not clip or overflow at 1920 x 1080.
- English headings may wrap naturally, but the line break must remain readable and the element `scrollWidth` must not exceed `clientWidth`.
- Body text should explain the program, research, support, or recruitment directly.

## Layout

- All major sections must align to the same grid and gutter.
- No horizontal page overflow at desktop, tablet, or mobile widths.
- Desktop and 1920 x 1080 views must keep generous side gutters and avoid text touching viewport edges.
- Sticky header must not cover section headings after anchor navigation.
- Cards and tables must have stable dimensions; hover or dynamic content must not shift layout.

## Mentor Table

- Mentor table uses fixed column widths.
- Role and name columns must stay compact.
- Department may wrap, but it must not force the website column off-screen.
- Website column must contain a clear clickable button-style link.
- On mobile, mentor rows stack for readability instead of causing page overflow.

## Visual System

- The visible site uses only the approved four-color palette: white, navy, blue, lime.
- Avoid decorative colored side/top bars on cards.
- Borders, spacing, and typography must be consistent across repeated sections.
- Buttons and clickable links must have sufficient target size.
