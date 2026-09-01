# Validation Report — Crystal Guild v1.7.0 — Retainer Service Alpha 1 Web

## Automated release gates

- Frontend regression suite: **531 / 531 PASS**
- Hosted Web/API suite: **58 / 58 PASS**
- Retainer frontend tests: included in the frontend total
- Retainer hosted payload/contract tests: included in the hosted total
- Node JS/MJS syntax: **194 / 194 PASS**
- Web Python AST parse: **13 / 13 PASS**
- CSS structural checks: **8 / 8 PASS**
- WebP decode checks: **815 / 815 PASS**
- Public PNG count: **0**
- Paired Bot schema: **14**
- Hosted sync: **1**
- Portal protocol: **30**

Retainer coverage verifies the Portal tab, action helpers, hosted allowlist and strict payload validation, rank/assignment presentation, responsive Retainer CSS, and the v1.7.0 public release identity. Existing Gold Saucer presentation and regressions remain green.

The source-only archive does not include installed `node_modules`, so a local Vite production build is not claimed as a validation gate.
