import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const privacy = await readFile(new URL("../app/privacidade/page.tsx", import.meta.url), "utf8");
const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");

test("production source contains no development preview metadata", () => {
  assert.doesNotMatch(layout, /codex-preview/i);
});

test("both public pages define canonical URLs", () => {
  assert.match(layout, /canonical:\s*["']\/["']/);
  assert.match(privacy, /canonical:\s*["']\/privacidade["']/);
});

test("worker defines the expected baseline security headers", () => {
  for (const header of [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
  ]) {
    assert.match(worker, new RegExp(header, "i"));
  }
});
