# Crystal Guild v1.1.18 — Retro Phase II
## Pixelify Sans Typography Pass

This Web-only visual pass introduces Pixelify Sans as Crystal Guild's retro display typeface for major identity text while preserving the existing body/UI font stack for readability.

### Applied to
- Major page titles such as Guild Heroes and Privacy Policy
- Shared site-header section identity such as Adventurer Portal and Player Guide
- Character display names in the Guild Heroes roster and Adventurer profile masthead
- Panel and section headings
- Bestiary monster names
- Boss names and boss detail headings
- Major Player Guide headings and prominent card titles

### Readability safeguards
- Body paragraphs, stat values, dense tables, form inputs, and long instructions remain on the clean existing UI font stack.
- Existing mobile no-wrap and responsive name handling remains intact.
- Pixelify Sans is loaded from Google Fonts with local fantasy-font fallbacks if the remote resource is unavailable.

### Privacy / security
- CSP explicitly allows only the Google Fonts stylesheet and font-resource origins required for Pixelify Sans.
- Privacy Policy updated to disclose the remote font request and effective date updated to August 25, 2026.

### Release identity
- Hosted Web runtime: `1.1.18-retro-phase-ii`
- Frontend asset revision: `1.1.18-retro-phase-ii25`
- Bot runtime: unchanged (`1.1.17-arsenal-ii-h4`)
- DB schema: unchanged (5)
- Hosted sync schema: unchanged (1)
- Portal Action protocol: unchanged (14)
- Twitch prefix: unchanged (`!`)
