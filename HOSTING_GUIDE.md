# Hosting Guide — Monster Identity Wave 6

The hosted Web runtime remains `1.1.18-retro-phase-ii` with frontend asset revision `1.1.18-retro-phase-ii10`, paired with unchanged Bot runtime `1.1.17-arsenal-ii-h4`.

Deploy the Web package, confirm the `monster-portraits-v6` directory is served, and verify `/api/health` before checking Adventure Board, Bestiary, Hunts, and Player Guide imagery.

Recommended post-deploy checks:
- Open the Adventure Board and enter a Solo Venture fight to confirm the enemy portrait appears.
- Open Bestiary and verify Iron Giant, Behemoth, Evil Eye, Great Malboro, and Magitek Armor portraits.
- Open Hunts and confirm shared monster art still renders.
- Open Player Guide and confirm its Bestiary/Hunts sections still use the shared portrait lookup.
