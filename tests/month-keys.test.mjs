import test from "node:test";
import assert from "node:assert/strict";
import { getMonthKeysWithHistory, getYear12Months } from "../lib/month-keys.ts";

test("keeps September 2026 visible when the rolling window advances to October", () => {
  const octoberWindow = getYear12Months(new Date(2026, 9, 1));
  const keys = getMonthKeysWithHistory(["2026-09"], octoberWindow);

  assert.equal(keys[0], "2026-09");
  assert.equal(keys[1], "2026-10");
  assert.equal(keys.at(-1), "2027-09");
});

test("includes older saved months once each, in chronological order", () => {
  const octoberWindow = getYear12Months(new Date(2026, 9, 1));
  const keys = getMonthKeysWithHistory(
    ["2024-03", "2025-11", "2026-09", "2025-11", "2026-13", "not-a-month"],
    octoberWindow,
  );

  assert.deepEqual(keys.slice(0, 4), ["2024-03", "2025-11", "2026-09", "2026-10"]);
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(keys.includes("2026-13"), false);
  assert.equal(keys.includes("not-a-month"), false);
});
