# Upgrade — v1.1.18 Retro Phase II Monster Identity Wave 1

1. Deploy the full Web package, or overlay the Wave 1 patch onto the immediately previous Job Portrait Wave 2 Web source.
2. Do not replace Bot runtime data or player databases; this is a Web-only visual release.
3. After deploy, verify `/api/health` reports frontend asset revision `1.1.18-retro-phase-ii5`.
4. Hard refresh only if the browser still has an older application shell open; the new monster art uses its own versioned `/retro-phase-ii/monster-portraits-v1/` path.
5. Check Bestiary, Hunts, and Player Guide on desktop and mobile widths.
