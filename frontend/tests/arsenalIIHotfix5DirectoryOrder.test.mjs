import test from "node:test";
import assert from "node:assert/strict";

import { sortGuildDirectory } from "../src/utils/playerDirectorySort.js";

test("Hotfix 5 pins the signed-in hero first, then sorts everyone else by level descending", () => {
  const players = [
    { username: "tophero", display_name: "Top Hero", level: 60 },
    { username: "middlehero", display_name: "Middle Hero", level: 35 },
    { username: "vanishedarmy", display_name: "VanishedArmy", level: 12 },
    { username: "newhero", display_name: "New Hero", level: 4 },
  ];

  const sorted = sortGuildDirectory(players, "VANISHEDARMY");
  assert.deepEqual(sorted.map((player) => player.username), [
    "vanishedarmy",
    "tophero",
    "middlehero",
    "newhero",
  ]);
});

test("Hotfix 5 keeps level/name ordering when no linked hero is available", () => {
  const players = [
    { username: "zeta", display_name: "Zeta", level: 20 },
    { username: "beta", display_name: "Beta", level: 30 },
    { username: "alpha", display_name: "Alpha", level: 30 },
  ];

  const sorted = sortGuildDirectory(players);
  assert.deepEqual(sorted.map((player) => player.username), ["alpha", "beta", "zeta"]);
});

test("Hotfix 5 directory sorting never mutates the API snapshot", () => {
  const players = [
    { username: "high", display_name: "High", level: 50 },
    { username: "mine", display_name: "Mine", level: 1 },
  ];
  const original = [...players];

  const sorted = sortGuildDirectory(players, "mine");
  assert.deepEqual(players, original);
  assert.notStrictEqual(sorted, players);
  assert.equal(sorted[0].username, "mine");
});
