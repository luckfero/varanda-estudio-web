import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const env = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};

const ctx = {
  waitUntil() {},
  passThroughOnException() {},
};

async function fetchRoute(pathname) {
  return worker.fetch(
    new Request(`https://varanda-estudio-web.test${pathname}`, {
      headers: { accept: "text/html" },
    }),
    env,
    ctx,
  );
}

function assertSecurityHeaders(response) {
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(response.headers.get("permissions-policy"), "camera=(), geolocation=(), microphone=()");
}

test("renders the homepage with production metadata and security headers", async () => {
  const response = await fetchRoute("/");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assertSecurityHeaders(response);
  assert.match(html, /<title>Varanda Estúdio Web \| Sites para negócios brasileiros<\/title>/i);
  assert.match(html, /rel=["']canonical["'][^>]*href=["']https:\/\/varanda-estudio-web\.luccaoliveira123\.workers\.dev\/?["']/i);
  assert.match(html, /href=["']\/privacidade["']/i);
  assert.doesNotMatch(html, /codex-preview/i);
});

test("renders the privacy route with its own canonical URL", async () => {
  const response = await fetchRoute("/privacidade");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assertSecurityHeaders(response);
  assert.match(html, /<h1[^>]*>Política de Privacidade<\/h1>/i);
  assert.match(html, /rel=["']canonical["'][^>]*href=["']https:\/\/varanda-estudio-web\.luccaoliveira123\.workers\.dev\/privacidade["']/i);
  assert.doesNotMatch(html, /codex-preview/i);
});
