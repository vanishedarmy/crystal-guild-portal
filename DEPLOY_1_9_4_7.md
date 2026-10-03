# Crystal Guild Web 1.9.4.7 — Full Deployment Root

This archive is a complete Web service deployment context. `Dockerfile` is at the archive root.

It is reconstructed from the pre–Living World Web line:
- v1.9.4.3 full Web baseline
- valid Raid Overlay v1.9.4.4 Web changes
- Visibility Hardening v1.9.4.5
- Portal Usability Overhaul v1.9.4.7

The abandoned site-wide v1.9.4.4 Accessibility Update and Living World Batch 1A/1B are not included.

If your host builds the Web service directly from an uploaded folder/repository root, use this archive as that root. The included Dockerfile builds the React frontend with npm and then launches the Python hosted portal.

Preserve your live environment variables, secrets, persistent data/database mounts, and hosting settings.
