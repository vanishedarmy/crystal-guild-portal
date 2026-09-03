# Validation Report — Crystal Guild v1.7.1 Resynthesis Alpha 1 Hotfix 1

**Result: PASS**

## Release contract
- Web runtime: `1.7.1-resynthesis-a1`
- Frontend asset revision: `1.7.1-resynthesis-a1h1`
- Paired Bot runtime: `1.7.1-resynthesis-a1`
- Local DB schema: **15**
- Hosted sync schema: **1**
- Portal Action protocol: **32**
- Twitch command prefix: `!`

## Automated regression
- Bot: **675 / 675 PASS**
- Frontend: **561 / 561 PASS**
- Hosted Web/API: **65 / 65 PASS**

## Warning checks
- Persistent Resynthesis warning is present in the Blacksmith tab.
- Confirmation explicitly states the selected gear is permanently destroyed.
- Confirmation explicitly states the action cannot be undone.
- No material-recovery or eligibility behavior changed.
