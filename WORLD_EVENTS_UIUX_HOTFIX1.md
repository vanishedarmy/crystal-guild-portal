# Crystal Guild v1.9.0 Alpha 6 — World Events UI/UX Hotfix 1

This hotfix tightens the new **Stream Activities → World Events** presentation without changing World Event gameplay.

## Changes
- World Events now uses the same shared collapsible section pattern and finger-pointer control as the other Portal boards.
- Open/closed state is remembered locally; narrow phones default collapsed to reduce scrolling.
- A newly appearing World Event automatically opens the section once so the active rally is not hidden.
- Removed the duplicate World Events hero image from inside the panel.
- Removed the redundant idle-status box beneath the idle banner.
- Idle, active, and defeated state artwork received cache-safe `_h1` variants cropped from 1800×562 to 1800×430, removing the large black bands from the original generated canvases.
- Rules, active-event presentation, roster spacing, portrait footprint, card padding, and descriptions were tightened.
- Boss descriptions are clamped to two lines in the dense desktop roster while retaining the responsive mobile card layout.

## Compatibility
- Runtime identity remains `1.9.0-world-events-alpha6`.
- Schema remains **19**.
- Hosted sync schema remains **1**.
- Portal Action protocol remains **36**.
- No player reset or migration is required.
- Spawn rates, World Event scaling, rewards, combat, and roster content are unchanged.
