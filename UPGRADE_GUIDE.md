# Upgrade Guide — v1.3.0 Guild Expansion Beta 2

Baseline: **Guild Expansion Beta 1 Web + Beta 1 Bot**.

1. Leave the Beta 1 Bot deployment unchanged.
2. Deploy the **Beta 1 → Beta 2 Web patch**, or replace the hosted Web source with the full Beta 2 Web package.
3. Redeploy the hosted Web service.
4. Verify `/api/health` reports hosted runtime/frontend revision `1.3.0-guild-expansion-b2`, hosted sync schema **1**, and Portal Action protocol **21**.
5. Confirm the Bot still reports `1.3.0-guild-expansion-b1` and protocol **21**.
6. Open `/fellowship` and verify Current Project, Airship, Weekly Orders, and Guild Legacy appear before secondary Guild detail.
7. Collapse a Fellowship section, refresh the page, and confirm its state is remembered.
8. Check a phone-width view and confirm priority cards/disclosures stack without horizontal overflow.

No database migration, player reset, OAuth change, or new environment variable is required.
