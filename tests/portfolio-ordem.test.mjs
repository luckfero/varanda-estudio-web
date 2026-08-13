import assert from "node:assert/strict";
import test from "node:test";

/**
 * A ordem do portfólio, e o casamento entre nome, endereço e imagem.
 *
 * **Por que este arquivo existe.** O texto de cada projeto mora em
 * `app/i18n/pt.ts`, `es.ts` e `en.ts`; a imagem e o endereço moram em
 * `projectAssets`, em `app/data.ts`. Os quatro são casados **pela posição**,
 * e nada no build reclama se um deles divergir.
 *
 * O defeito que isso produz é silencioso: mudar a ordem em três dicionários e
 * esquecer o quarto arquivo cola a foto da construtora na descrição da
 * churrascaria, em um idioma só. Quem revisa em português não vê. Foi por
 * isso que o teste nasceu junto com a reordenação de 2026-08-13.
 *
 * A ordem em si é decisão comercial, não estética, e o porquê está no
 * comentário de `projectAssets`. Se ela mudar de novo, muda aqui também — de
 * propósito: a lista abaixo é o contrato, e alterá-la tem que ser um ato
 * deliberado, não o efeito colateral de mexer em outro arquivo.
 */
const ORDEM_ESPERADA = [
  { nome: "Nívora Construções", host: "nivora.varandaestudioweb.com", imagem: "nivora-casa-patio-alto" },
  { nome: "Nascente", host: "nascente.varandaestudioweb.com", imagem: "nascente-hero-central" },
  { nome: "Brasa do Vale", host: "brasa.varandaestudioweb.com", imagem: "brasa-do-vale-hero" },
];

const HOMES = [
  { locale: "pt", home: "/" },
  { locale: "es", home: "/es" },
  { locale: "en", home: "/en" },
];

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };

async function htmlDe(pathname) {
  const resposta = await worker.fetch(
    new Request(`https://varanda-estudio-web.test${pathname}`, { headers: { accept: "text/html" } }),
    env,
    ctx,
  );
  return resposta.text();
}

/**
 * Os cartões na ordem em que aparecem no documento.
 *
 * Recorta pelo `project-slide` em vez de procurar cada campo pela página
 * inteira: é o recorte que garante que o nome, o endereço e a imagem lidos
 * pertencem ao **mesmo** cartão. Uma varredura solta acharia os três valores
 * certos espalhados em cartões trocados e passaria.
 */
function cartoesDe(html) {
  const pedacos = html.split('class="project-slide"').slice(1);
  return pedacos.map((pedaco) => ({
    nome: pedaco.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1]?.trim() ?? null,
    host: pedaco.match(/class="project-visual"[^>]*href="https?:\/\/([^/"]+)/i)?.[1] ?? null,
    imagem: pedaco.match(/\/images\/r\/([a-z0-9-]+?)-\d+\.(?:avif|webp)/i)?.[1] ?? null,
  }));
}

for (const { locale, home } of HOMES) {
  test(`portfólio em ${locale}: ordem e pareamento`, async () => {
    const cartoes = cartoesDe(await htmlDe(home));

    assert.equal(
      cartoes.length,
      ORDEM_ESPERADA.length,
      `esperava ${ORDEM_ESPERADA.length} cartões em ${home}, achei ${cartoes.length}`,
    );

    /* Um `deepEqual` da lista inteira em vez de três asserções soltas: assim
       a mensagem de falha mostra a ordem que saiu ao lado da esperada, que é
       a informação de que quem for consertar precisa. */
    assert.deepEqual(cartoes, ORDEM_ESPERADA);
  });
}

test("os três projetos aparecem na mesma ordem nos três idiomas", async () => {
  const porIdioma = {};
  for (const { locale, home } of HOMES) {
    porIdioma[locale] = cartoesDe(await htmlDe(home)).map((c) => c.nome);
  }
  /* Redundante com o bloco acima enquanto os dois olham para
     `ORDEM_ESPERADA`, e de propósito: se um dia alguém afrouxar a lista fixa,
     esta ainda cobra que os três idiomas concordem entre si. Divergência
     entre idiomas é o defeito caro; a lista fixa é só o guarda-costas. */
  assert.deepEqual(porIdioma.es, porIdioma.pt);
  assert.deepEqual(porIdioma.en, porIdioma.pt);
});
