from pathlib import Path
import shutil, sys

PATCH_ROOT = Path(__file__).resolve().parent
if len(sys.argv) != 2:
    raise SystemExit("Usage: python web_patch/apply_patch.py <target-web-root>")
target = Path(sys.argv[1]).resolve()
if not target.exists():
    raise SystemExit(f"Target does not exist: {target}")
for src in PATCH_ROOT.rglob("*"):
    if not src.is_file():
        continue
    rel = src.relative_to(PATCH_ROOT)
    if rel.as_posix() in {"apply_patch.py","PATCH_MANIFEST.txt","DELETIONS.txt","VALIDATION_REPORT.md","FINALIZATION_AUDIT.md"}:
        continue
    dest = target / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
print("Crystal Guild v1.5.1 Web Hotfix 1 — Relic Artwork Refresh applied.")
