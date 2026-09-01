# RC2 Web Hotfix 1 Validation

Scope: regenerated Triple Triad card faces only. All 15 shipping faces are 530×742 WebP at 5:7; the card values printed on the faces match the canonical RC2 Top/Right/Bottom/Left parameters. Runtime/Bot remains RC2.

Automated results for this hotfix:
- Frontend unit suite: **524 / 524 PASS**.
- Hosted Web/API suite: **56 / 56 PASS**.
- RC2 Bot parameter-to-art manifest sync: **15 / 15 cards exact**.
- Regenerated shipping card dimensions: **15 / 15 at 530×742 (5:7)**.
- WebP decode gate: **815 / 815 PASS** across the public Web tree.
- JavaScript/MJS syntax: **192 / 192 PASS**.
- Python parse: **12 / 12 PASS**.
- CSS brace sanity: **8 / 8 PASS**.
- Public PNG gate: **0 PNG files**.

# Validation Report — Crystal Guild v1.6.0 — Gold Saucer RC2 — Web

**PASS**

## Regression suites
- Matched RC2 Bot: **641 / 641 PASS**
- Frontend: **522 / 522 PASS**
- Hosted Web/API: **56 / 56 PASS**

## Source / asset gates
- Web Python parse: **12 / 12 PASS**
- Plain JS/MJS Node syntax: **191 / 191 PASS**
- CSS parse: **8 / 8 PASS**
- Public artwork: **0 PNG / 800 WebP**, **800 / 800 decode PASS**

## Focused RC2 checks
- Public release identity is `v1.6.0 RC2`; frontend/runtime revision is `1.6.0-gold-saucer-rc2`.
- The Saucer Ledger exposes Mini Cactpot net W/D/L from the authoritative state contract.
- H5 full Triple Triad card faces and H6 compact opponent chooser remain intact.
- Mini Cactpot/Crystal Slots stay fixed-open; other current Saucer sections retain shared finger-pointer disclosures.
- Guide/What's New document the RC2 Cactpot correction and frozen balance of the other attractions.

The source-only workspace has no installed project `node_modules`; no local Vite production-build claim is made.

Contract: runtime `1.6.0-gold-saucer-rc2` / frontend `1.6.0-gold-saucer-rc2h1`, schema **13**, hosted sync **1**, Portal protocol **29**, MGP canonical.
