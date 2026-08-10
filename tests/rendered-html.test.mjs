import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";

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

/* O domínio próprio. Enquanto o canonical apontava para o endereço do
   worker, o buscador tratava `.workers.dev` como a versão oficial do site. */
const SITE = "https://varandaestudioweb.com";

function canonicalDe(html) {
  const head = html.slice(0, html.indexOf("</head>"));
  return head.match(/rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? null;
}

function assertSecurityHeaders(response) {
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(response.headers.get("permissions-policy"), "camera=(), geolocation=(), microphone=()");
  assert.equal(response.headers.get("strict-transport-security"), "max-age=86400");
}

test("renders the homepage with production metadata and security headers", async () => {
  const response = await fetchRoute("/");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assertSecurityHeaders(response);
  assert.match(html, /<title>Varanda Estúdio Web \| Sites para negócios brasileiros<\/title>/i);
  assert.equal(canonicalDe(html), `${SITE}/`);
  assert.match(html, /href=["']\/privacidade["']/i);
  assert.doesNotMatch(html, /codex-preview/i);
});

test("nenhum endereço de worker sobra nos metadados", async () => {
  for (const rota of ["/", "/privacidade"]) {
    const head = (await (await fetchRoute(rota)).text()).split("</head>")[0];
    assert.doesNotMatch(head, /workers\.dev/i, `${rota} ainda cita workers.dev na head`);
  }
});

test("o conteúdo não depende do JavaScript para aparecer", async () => {
  const html = await (await fetchRoute("/")).text();
  assert.match(html, /data-reveal/, "a home deveria ter elementos de revelação");

  /* Se o CSS esconder `[data-reveal]` sem exigir a classe que só o JS
     coloca, a página nasce invisível e fica assim quando o script falha.
     Era o estado anterior: 109 de 113 elementos sumiam sem JavaScript. */
  const dir = new URL("../dist/client/assets/", import.meta.url);
  const folhas = (await readdir(dir)).filter((f) => f.endsWith(".css"));
  assert.ok(folhas.length > 0, "nenhuma folha de estilo no build");

  for (const folha of folhas) {
    const css = await readFile(new URL(folha, dir), "utf8");
    for (const trecho of css.matchAll(/([^{}]*)\{([^}]*opacity:\s*0[;}][^}]*)\}/g)) {
      const seletores = trecho[1];
      if (!seletores.includes("[data-reveal]")) continue;
      assert.ok(
        seletores.includes(".reveal-ready"),
        `estado escondido sem trava do JS em "${seletores.trim().slice(0, 90)}"`,
      );
    }
  }
});

test("renders the privacy route with its own canonical URL", async () => {
  const response = await fetchRoute("/privacidade");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assertSecurityHeaders(response);
  assert.match(html, /<h1[^>]*>Política de Privacidade<\/h1>/i);
  assert.equal(canonicalDe(html), `${SITE}/privacidade`);
  assert.doesNotMatch(html, /codex-preview/i);
});

test("a home publica dados estruturados válidos e sem dado inventado", async () => {
  const response = await fetchRoute("/");
  const html = await response.text();

  const bloco = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i,
  );
  assert.ok(bloco, "nenhum bloco JSON-LD na página");

  /* Se o JSON estiver malformado o Google descarta tudo em silêncio, então
     o teste precisa fazer o parse, não só procurar a string. */
  const dados = JSON.parse(bloco[1]);
  assert.equal(dados["@context"], "https://schema.org");
  assert.equal(dados["@type"], "ProfessionalService");
  assert.equal(dados.name, "Varanda Estúdio Web");
  assert.equal(dados.url, "https://varandaestudioweb.com");
  assert.ok(Array.isArray(dados.serviceType) && dados.serviceType.length > 0);
  assert.equal(dados.hasOfferCatalog.itemListElement.length, 3);

  /* O protocolo proíbe inventar dado comercial. Estes campos só poderiam
     ser preenchidos com número que ninguém confirmou. */
  for (const campo of ["aggregateRating", "review", "priceRange", "foundingDate", "address", "taxID"]) {
    assert.equal(dados[campo], undefined, `${campo} não pode ser inventado`);
  }
});

test("HTTP puro não entrega página: redireciona para HTTPS", async () => {
  const wUrl = new URL("../dist/server/index.js", import.meta.url);
  wUrl.searchParams.set("test", `${process.pid}-${Date.now()}-tls`);
  const { default: w } = await import(wUrl.href);

  const pedir = (endereco, cabecalhos = {}) =>
    w.fetch(
      new Request(endereco, { headers: { accept: "text/html", ...cabecalhos } }),
      { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
      { waitUntil() {}, passThroughOnException() {} },
    );

  /* Visitante em texto aberto: 301 para o mesmo caminho em HTTPS. */
  const aberto = await pedir("http://varanda-estudio-web.test/privacidade?x=1");
  assert.equal(aberto.status, 301);
  assert.equal(aberto.headers.get("location"), "https://varanda-estudio-web.test/privacidade?x=1");

  /* A borda da Cloudflare entrega o esquema original no CF-Visitor. Ele
     manda mais que o endereço: numa borda que já terminou o TLS, a URL
     chega como https mesmo quando o visitante veio de http. */
  const viaBorda = await pedir("https://varanda-estudio-web.test/", { "CF-Visitor": '{"scheme":"http"}' });
  assert.equal(viaBorda.status, 301, "CF-Visitor http deve redirecionar mesmo com URL https");

  /* E o contrário: quem já está em HTTPS **não** pode ser redirecionado,
     senão o destino vira http de novo e o site entra em laço infinito. */
  const seguro = await pedir("https://varanda-estudio-web.test/", { "CF-Visitor": '{"scheme":"https"}' });
  assert.notEqual(seguro.status, 301, "requisição já segura não pode redirecionar");

  /* localhost fica de fora: é onde rodam o dev e estes testes. */
  const local = await pedir("http://localhost/privacidade");
  assert.notEqual(local.status, 301, "localhost não pode redirecionar");
});
