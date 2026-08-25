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
  /* O quarto cartão é o espaço reservado, acrescentado em 689b384 (19/08/2026).
     Ele não tem par em `projectAssets`, e é essa ausência que faz o carrossel
     montar o cartão de "em breve": por isso host e imagem são nulos, e é o
     estado correto, não uma lacuna a preencher.

     **Ele entrou sem que estas listas fossem atualizadas, e por isso este
     arquivo ficou vermelho de 19/08 a 25/08 sem ninguém ver.** É a razão de o
     contrato ser explícito: quem mexe no portfólio tem que vir aqui de
     propósito. */
  { nome: "Seu projeto", host: null, imagem: null },
];

/* O nome do quarto cartão é traduzido ("Tu proyecto", "Your project"), então
   comparar NOMES entre idiomas acusa divergência onde há tradução correta.
   O que precisa bater entre idiomas é o par endereço↔imagem, que é o que
   troca de lugar quando alguém reordena um dicionário e esquece os outros. */
const NOME_TRADUZIDO_POR_IDIOMA = { pt: "Seu projeto", es: "Tu proyecto", en: "Your project" };

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
    const esperado = ORDEM_ESPERADA.map((c) =>
      c.host === null ? { ...c, nome: NOME_TRADUZIDO_POR_IDIOMA[locale] } : c,
    );
    assert.deepEqual(cartoes, esperado);
  });
}

test("os projetos aparecem na mesma ordem nos três idiomas", async () => {
  const porIdioma = {};
  for (const { locale, home } of HOMES) {
    /* Compara o par endereço↔imagem, não o nome: nome de projeto conceitual
       é traduzido de propósito, e comparar nome acusaria a tradução como se
       fosse defeito. */
    porIdioma[locale] = cartoesDe(await htmlDe(home)).map((c) => `${c.host}|${c.imagem}`);
  }
  /* Redundante com o bloco acima enquanto os dois olham para
     `ORDEM_ESPERADA`, e de propósito: se um dia alguém afrouxar a lista fixa,
     esta ainda cobra que os três idiomas concordem entre si. Divergência
     entre idiomas é o defeito caro; a lista fixa é só o guarda-costas. */
  assert.deepEqual(porIdioma.es, porIdioma.pt);
  assert.deepEqual(porIdioma.en, porIdioma.pt);
});

/**
 * Os trabalhos publicados, acrescentados em 25/08/2026.
 *
 * Mesmo contrato do carrossel, e pelo mesmo motivo: nome vem do dicionário,
 * imagem e endereço vêm de `featuredAssets`, casados pela posição, e nada no
 * build reclama se divergirem.
 *
 * Aqui o defeito seria pior que trocar duas demonstrações de lugar. Estes
 * dois são sites de negócios que existem: colar o endereço de um na descrição
 * do outro manda o visitante para a empresa errada, com o nome certo na tela.
 */
const NO_AR_ESPERADO = [
  { nome: "Casa Conexão", host: "casaconexao.varandaestudioweb.com", imagem: "casa-conexao-hero" },
  { nome: "Milênio", host: "milenio.varandaestudioweb.com", imagem: "milenio-hero" },
];

function destaquesDe(html) {
  const pedacos = html.split('class="destaque-link"').slice(1);
  return pedacos.map((pedaco) => ({
    nome: pedaco.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i)?.[1]?.trim() ?? null,
    host: pedaco.match(/^[\s\S]{0,400}?href="https?:\/\/([^/"]+)/i)?.[1] ?? null,
    imagem: pedaco.match(/\/images\/r\/([a-z0-9-]+?)-\d+\.(?:avif|webp)/i)?.[1] ?? null,
  }));
}

for (const { locale, home } of HOMES) {
  test(`no ar em ${locale}: ordem e pareamento`, async () => {
    const destaques = destaquesDe(await htmlDe(home));
    assert.equal(
      destaques.length,
      NO_AR_ESPERADO.length,
      `esperava ${NO_AR_ESPERADO.length} destaques em ${home}, achei ${destaques.length}`,
    );
    assert.deepEqual(destaques, NO_AR_ESPERADO);
  });
}

test("o aviso de conceitual não descreve mais o portfólio inteiro", async () => {
  /* Enquanto tudo era conceitual, o aviso ficava logo abaixo do título da
     seção e valia para tudo o que vinha depois. Com trabalho publicado no
     meio, o mesmo aviso naquele lugar passaria a ser falso sobre dois
     cartões. Ele desceu junto com os conceituais, e este teste trava a
     posição: o aviso tem que vir DEPOIS do último destaque. */
  for (const { locale, home } of HOMES) {
    const html = await htmlDe(home);
    const ultimoDestaque = html.lastIndexOf('class="destaque-link"');
    const aviso = html.indexOf('class="portfolio-aviso"');
    assert.ok(ultimoDestaque > 0, `${locale}: nenhum destaque no documento`);
    assert.ok(aviso > 0, `${locale}: aviso de conceitual sumiu do documento`);
    assert.ok(
      aviso > ultimoDestaque,
      `${locale}: o aviso de "projetos conceituais" aparece ANTES dos trabalhos publicados, ` +
        "então descreve como fictícios dois negócios que existem",
    );
  }
});
