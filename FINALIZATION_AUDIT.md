# RC2 Web Hotfix 1 Finalization Audit

- Web-only artwork change; no Bot/gameplay/schema/protocol change.
- 15 regenerated card faces use a dedicated cache-busted asset root.
- No source PNG files are placed in the public Web tree.
- Card display ratio is normalized to 5:7 to match the finalized art template.
- Exact RC2 canonical Top/Right/Bottom/Left parameters verified for all 15 regenerated faces.
- Frontend 524/524 and hosted 56/56 automated suites pass.
- All 815 public WebP assets decode successfully; public tree remains PNG-free.

# Finalization Audit — Crystal Guild v1.6.0 — Gold Saucer RC2

RC2 freezes the complete five-attraction Gold Saucer Portal and matched Bot contract after the final win/draw/loss balance pass.

Only Mini Cactpot payouts change from RC1; the Web reflects the authoritative RC2 table and adds net Cactpot W/D/L to the Saucer Ledger. All H5/H6 Triple Triad artwork/UI, shared finger-pointer disclosures, and other Gold Saucer attraction economics remain unchanged.

Runtime/Bot `1.6.0-gold-saucer-rc2`; frontend `1.6.0-gold-saucer-rc2`; local DB schema **13**; hosted sync **1**; Portal Action protocol **29**; prefix `!`; MGP canonical.

Validated gates: **641/641 Bot**, **522/522 frontend**, **56/56 hosted Web/API**, **12/12 Web Python**, **191/191 plain JS/MJS**, **8/8 CSS**, **800/800 WebP decode**, **0 PNG**.

H5 Triple Triad visual assets remain served from `/gold-saucer/a5h5/triple-triad/`; RC2 does not duplicate a stable art family for release identity alone.

Packaging excludes live state, secrets, caches, databases, logs, and compiled Python artifacts.
