# Validation Report — Desktop Item Control Fit Correction

**PASS — source regression complete; shipping archive validated after packaging.**

- Frontend: **607 / 607 PASS**
- Hosted Web/API: **76 / 76 PASS**
- Paired Bot: **705 / 705 PASS** — Bot source is unchanged from Mobile Control Fit Correction / HTTP Response Efficiency.
- Focused desktop Recovery/Battle-item regressions: **6 / 6 PASS** (included in frontend total)

Focused coverage verifies wider Recovery command columns, compact 40px Recovery artwork, two-row Recovery metadata placement, compact battle-item button height/padding, three-column large-desktop battle inventory, and preserved two-line effect context. Ability grids are explicitly excluded from the compact item selector.

Source gates: **16/16 Web Python AST**, **214/214 JS/MJS syntax**, **9/9 CSS structural files**, **843/843 public WebP decode**, **0 public PNGs**.

Release contract remains runtime `1.7.1-resynthesis-a2h5`, schema **16**, hosted sync **1**, Portal protocol **33**. No migration/reset.
