# Crystal Guild v1.2.0 Expeditions Alpha 1 — Hosting Guide

Deploy the Web and Bot as a matched pair.

After deployment, `/api/health` should report Web runtime `1.2.0-expeditions-alpha2`, frontend asset revision `1.2.0-expeditions-a2h1`, hosted sync schema **1**, and Portal Action protocol **20**.

The compatible Bot should report runtime `1.2.0-expeditions-a1h1`, local DB schema **8**, hosted sync schema **1**, and Portal Action protocol **20**. Preserve all existing Render environment values unless intentionally changing them; H9 combat timing defaults remain compatible.
