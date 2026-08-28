import assert from "node:assert/strict";
import test from "node:test";

/**
 * A ordem do portfólio, e o casamento entre nome, endereço e imagem.
 *
 * **Por que este arquivo existe.** O texto de cada projeto mora em
 * `app/i18n/pt.ts`, `es.ts` e `en.ts`; a imagem e o endereço moram em
 * `featuredAssets` e `projectAssets`, em `app/data.ts`. Os dois lados são
 * casados **pela posição**, e nada no build reclama se um deles divergir.
 *
 * O defeito que isso produz é silencioso: mudar a ordem em três dicionários e
 * esquecer o quarto arquivo cola a foto de um projeto na descrição de outro,
 * **em um idioma só**. Quem revisa em português não vê.
 *
 * Nos publicados o estrago é pior que nos estudos: são sites de empresas que
 * existem, e trocar os pares manda o visitante para a empresa errada com o
 * nome certo na tela.
 *
 * **Reescrito em 25/08/2026**, quando a seção foi redesenhada e o carrossel
 * deixou de existir. O contrato é o mesmo; mudaram os seletores.
 */

const NO_AR_ESPERADO = [
  { nome: "Casa Conexão", host: "casaconexao.varandaestudioweb.com", imagem: "casa-conexao-hero" },
  { nome: "Milênio", host: "milenio.varandaestudioweb.com", imagem: "milenio-hero" },
];

const ESTUDOS_ESPERADOS = [
  { nome: "Nívora Construções", host: "nivora.varandaestudioweb.com", imagem: "nivora-casa-patio-alto" },
  { nome: "Nascente", host: "nascente.varandaestudioweb.com", imagem: "nascente-hero-central" },
  { nome: "Brasa do Vale", host: "brasa.varandaestudioweb.com", imagem: "brasa-do-vale-hero" },
];

/* O nome dos estudos é igual nos três idiomas (são nomes próprios), então
   aqui dá para comparar nome. O que se compara entre idiomas, mesmo assim, é
   o par endereço↔imagem: é ele que troca de lugar quando alguém reordena um
   dicionário e esquece os outros. */

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
 * Recorta cada cartão e lê nome, host e imagem **de dentro do mesmo cartão**.
 *
 * O recorte é o que importa. Uma varredura solta na página acharia os três
 * valores certos espalhados em cartões trocados e passaria.
 */
function cartoes(html, marcador) {
  return html
    .split(marcador)
    .slice(1)
    .map((pedaco) => ate(pedaco))
    .map((pedaco) => ({
      nome: pedaco.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1]?.trim() ?? null,
      host: pedaco.match(/href="https?:\/\/([^/"]+)/i)?.[1] ?? null,
      imagem: pedaco.match(/\/images\/r\/([a-z0-9-]+?)-\d+\.(?:avif|webp)/i)?.[1] ?? null,
    }));
}

/**
 * Corta o pedaço onde o PRÓXIMO cartão começa, de qualquer um dos dois tipos.
 *
 * O `split` já termina cada pedaço no próximo cartão do MESMO tipo, então
 * sobrava um vazamento só: o último publicado seguia até o fim do documento e
 * enxergava o endereço do primeiro estudo conceitual.
 *
 * Isto substitui a janela de 600 caracteres que existia aqui. Ela funcionava
 * quando o cartão inteiro era um link e o `href` vinha na primeira linha; no
 * markup de 27/08/2026 o endereço passou a ser a ÚLTIMA peça do cartão, depois
 * da imagem, do rótulo, do título, da descrição e da lista de entregas, e a
 * janela cortava antes de chegar nele. Limite por conteúdo, e não por contagem
 * de caractere, não envelhece quando o cartão muda de forma.
 */
function ate(pedaco) {
  const fim = [/class="placa[" ]/, /class="cartao cartao--interativo estudo"/]
    .map((m) => pedaco.search(m))
    .filter((i) => i >= 0);
  return fim.length ? pedaco.slice(0, Math.min(...fim)) : pedaco;
}

/**
 * Os marcadores são expressão regular, e não texto solto, por um motivo que
 * já custou uma rodada: `class="placa` casa também com `class="placas"`, que
 * é o `<ol>` em volta, e com `placa-corpo` e `placa-endereco` que vivem
 * dentro do cartão. O recorte pegava mais cartões do que existem e o teste
 * acusava defeito onde não havia. Por isso a classe é seguida de aspas ou de
 * espaço, sempre.
 *
 * OS NOMES MUDARAM NO PORTE DA IDENTIDADE, em 27/08/2026, e o teste ficou
 * vermelho antes de o defeito existir, que é exatamente o trabalho dele. Ao
 * atualizar, apareceu uma regressão de verdade: o selo de conceitual tinha
 * virado `.selo` genérico, a mesma classe do rótulo de subseção, e com isso
 * o aviso de que a empresa NÃO EXISTE deixava de ser distinguível de um
 * título qualquer. Ele voltou a ter gancho próprio, `selo--conceitual`.
 *
 * O href vem ANTES do `h3` nos dois casos, porque é o `<a>` que abre o
 * cartão. Por isso o recorte começa no atributo de classe do link.
 */
const PLACA = /class="placa[" ]/;
const ESTUDO = /class="cartao cartao--interativo estudo"/;

/** `lastIndexOf` não aceita regex, então a posição sai daqui. */
function ultimaOcorrencia(html, marcador) {
  const partes = html.split(marcador);
  if (partes.length < 2) return -1;
  return html.length - partes[partes.length - 1].length;
}

for (const { locale, home } of HOMES) {
  test(`no ar em ${locale}: ordem e pareamento`, async () => {
    const achados = cartoes(await htmlDe(home), PLACA);
    assert.equal(
      achados.length,
      NO_AR_ESPERADO.length,
      `esperava ${NO_AR_ESPERADO.length} publicados em ${home}, achei ${achados.length}`,
    );
    assert.deepEqual(achados, NO_AR_ESPERADO);
  });

  test(`estudos em ${locale}: ordem e pareamento`, async () => {
    const achados = cartoes(await htmlDe(home), ESTUDO);
    assert.equal(
      achados.length,
      ESTUDOS_ESPERADOS.length,
      `esperava ${ESTUDOS_ESPERADOS.length} estudos em ${home}, achei ${achados.length}`,
    );
    assert.deepEqual(achados, ESTUDOS_ESPERADOS);
  });
}

test("os cinco projetos aparecem na mesma ordem nos três idiomas", async () => {
  const porIdioma = {};
  for (const { locale, home } of HOMES) {
    const html = await htmlDe(home);
    porIdioma[locale] = [...cartoes(html, PLACA), ...cartoes(html, ESTUDO)]
      .map((c) => `${c.host}|${c.imagem}`);
  }
  /* Redundante com os blocos acima enquanto os dois olham para as listas
     fixas, e de propósito: se um dia alguém afrouxar as listas, esta ainda
     cobra que os três idiomas concordem entre si. */
  assert.deepEqual(porIdioma.es, porIdioma.pt);
  assert.deepEqual(porIdioma.en, porIdioma.pt);
});

test("o aviso de conceitual não descreve os trabalhos publicados", async () => {
  /* Enquanto tudo era conceitual, o aviso ficava logo abaixo do título da
     seção e valia para tudo o que vinha depois. Com trabalho publicado no
     meio, o mesmo aviso naquele lugar passaria a chamar de fictícios dois
     negócios que existem. Este teste trava a posição. */
  for (const { locale, home } of HOMES) {
    const html = await htmlDe(home);
    const ultimaPlaca = ultimaOcorrencia(html, PLACA);
    const aviso = html.indexOf('class="aviso"');
    assert.ok(ultimaPlaca > 0, `${locale}: nenhum publicado no documento`);
    assert.ok(aviso > 0, `${locale}: aviso de conceitual sumiu do documento`);
    assert.ok(
      aviso > ultimaPlaca,
      `${locale}: o aviso de "projetos conceituais" aparece ANTES dos trabalhos publicados, ` +
        "então descreve como fictícios dois negócios que existem",
    );
  }
});

test("cada estudo carrega o selo de conceitual, e nenhum publicado carrega", async () => {
  /* A separação entre os dois grupos é dada pelo tamanho e pela posição, mas
     o rótulo é a rede de segurança: sem ele, quem chega direto pelo link de
     um estudo não tem como saber que a empresa não existe. */
  for (const { locale, home } of HOMES) {
    const html = await htmlDe(home);
    const selos = (html.match(/class="selo selo--conceitual"/g) ?? []).length;
    assert.equal(
      selos,
      ESTUDOS_ESPERADOS.length,
      `${locale}: esperava ${ESTUDOS_ESPERADOS.length} selos de conceitual, achei ${selos}`,
    );
    for (const placa of cartoes(html, PLACA)) {
      assert.ok(placa.nome, `${locale}: placa sem nome`);
    }
    /* O selo não pode aparecer dentro de uma placa de publicado. Como as
       placas vêm antes, basta cobrar que o primeiro selo venha depois da
       última delas. */
    assert.ok(
      html.indexOf('class="selo selo--conceitual"') > ultimaOcorrencia(html, PLACA),
      `${locale}: um selo de conceitual aparece dentro da área dos publicados`,
    );
  }
});
