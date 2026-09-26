import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";

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

async function htmlDe(pathname) {
  return (await fetchRoute(pathname)).text();
}

/* O domínio próprio. Enquanto o canonical apontava para o endereço do
   worker, o buscador tratava `.workers.dev` como a versão oficial do site. */
const SITE = "https://varandaestudioweb.com";

/**
 * Os seis endereços do site, com o que cada um deve declarar.
 *
 * O português mora na raiz porque é o endereço que o domínio já tinha
 * indexado; mover para `/pt` jogaria fora a autoridade acumulada.
 */
/* `lang` e `hreflang` não são a mesma coisa e divergem no espanhol: o
   atributo do `<html>` é `es` e a anotação para o buscador é `es-ES`.
   Tratá-los como um só campo foi o primeiro erro deste arquivo. */
const IDIOMAS = [
  { locale: "pt", lang: "pt-BR", hreflang: "pt-BR", home: "/", politica: "/privacidade", titulo: "Varanda Estúdio Web | Criação de sites profissionais", moeda: "R$", precos: ["1.000", "2.100", "3.800"], extras: ["R$ 390", "R$ 220", "R$ 320", "R$ 190"], reparo: true },
  { locale: "es", lang: "es", hreflang: "es-ES", home: "/es", politica: "/es/privacidad", titulo: "Varanda Estúdio Web | Diseño y desarrollo de webs profesionales", moeda: "€", precos: ["790", "1.590", "2.900"], extras: ["250 €", "150 €", "199 €", "59 €"], reparo: false },
  { locale: "en", lang: "en", hreflang: "en", home: "/en", politica: "/en/privacy", titulo: "Varanda Estúdio Web | Professional website design and development", moeda: "US$", precos: ["900", "1,850", "3,350"], extras: ["US$ 290", "US$ 170", "US$ 230", "US$ 69"], reparo: false },
];

function headDe(html) {
  return html.slice(0, html.indexOf("</head>"));
}

function canonicalDe(html) {
  return headDe(html).match(/rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? null;
}

/* O payload do RSC repete os metadados como dado serializado no corpo da
   página: um `assert.match(html, ...)` passa mesmo com a tag ausente da
   head. Por isso recorta a head — e conta, porque duas `<title>` fazem o
   navegador usar a primeira, que costuma ser a do layout. */
function titulosDe(html) {
  return [...headDe(html).matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => m[1]);
}

function alternativosDe(html) {
  const mapa = {};
  for (const tag of headDe(html).matchAll(/<link[^>]*rel=["']alternate["'][^>]*>/gi)) {
    const hreflang = tag[0].match(/hreflang=["']([^"']+)["']/i)?.[1];
    const href = tag[0].match(/href=["']([^"']+)["']/i)?.[1];
    if (hreflang && href) mapa[hreflang] = href;
  }
  return mapa;
}

function assertSecurityHeaders(response) {
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(response.headers.get("permissions-policy"), "camera=(), geolocation=(), microphone=()");
  assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000");
  /* A política de conteúdo vale desde 25/09/2026, e o site não pode voltar ao
     modo relatório por engano. Conferir as diretivas que carregam o peso:
     própria origem por padrão, o beacon da borda liberado (sem ele a
     analítica morre em silêncio) e nada de objeto nem moldura de fora. */
  const politica = response.headers.get("content-security-policy") ?? "";
  assert.match(politica, /default-src 'self'/);
  assert.match(politica, /script-src [^;]*https:\/\/static\.cloudflareinsights\.com/);
  assert.match(politica, /frame-ancestors 'none'/);
  assert.match(politica, /object-src 'none'/);
  assert.equal(response.headers.get("content-security-policy-report-only"), null);
}

for (const idioma of IDIOMAS) {
  test(`[${idioma.locale}] home responde com metadados e cabeçalhos de segurança`, async () => {
    const response = await fetchRoute(idioma.home);
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    assertSecurityHeaders(response);

    const titulos = titulosDe(html);
    assert.equal(titulos.length, 1, `a head deveria ter uma única <title>, tem ${titulos.length}`);
    assert.equal(titulos[0], idioma.titulo);
    assert.equal(canonicalDe(html), `${SITE}${idioma.home}`);
    assert.doesNotMatch(html, /codex-preview/i);
  });

  test(`[${idioma.locale}] o <html lang> acompanha o idioma da rota`, async () => {
    /* Três layouts raiz, um por grupo de rota, existem só por causa disto:
       é o que faz um leitor de tela trocar de voz. Um layout único não sabe
       qual rota está abaixo dele e serviria pt-BR para as três. */
    for (const rota of [idioma.home, idioma.politica]) {
      const html = await htmlDe(rota);
      const lang = html.match(/<html[^>]*\slang=["']([^"']+)["']/i)?.[1];
      assert.equal(lang, idioma.lang, `${rota} declarou lang="${lang}"`);
    }
  });

  test(`[${idioma.locale}] hreflang é recíproco e inclui x-default`, async () => {
    /* O buscador só honra a anotação quando todas as versões apontam umas
       para as outras **e cada uma se inclui na lista**. Faltando um lado,
       ele descarta o conjunto inteiro em silêncio — é o tipo de defeito que
       nunca aparece em revisão visual. */
    for (const pagina of ["home", "politica"]) {
      const mapa = alternativosDe(await htmlDe(idioma[pagina]));
      for (const outro of IDIOMAS) {
        assert.equal(mapa[outro.hreflang], `${SITE}${outro[pagina]}`, `${idioma[pagina]} não aponta para ${outro.hreflang}`);
      }
      assert.equal(mapa["x-default"], `${SITE}${IDIOMAS[0][pagina]}`, `${idioma[pagina]} sem x-default para a raiz`);
    }
  });

  test(`[${idioma.locale}] a tabela publicada é a tabela decidida, na moeda certa`, async () => {
    const html = await htmlDe(idioma.home);

    /* Preço é a informação do site que custa mais caro quando erra. São três
       tabelas independentes — euro e dólar não são conversão do real, estão
       ancorados em pesquisa de cada mercado —, então errar uma não deixa
       rastro nas outras. */
    for (const valor of idioma.precos) {
      assert.match(html, new RegExp(`>${valor.replace(".", "\\.")}<`), `${idioma.locale}: valor ${valor} sumiu da home`);
    }
    assert.ok(html.includes(idioma.moeda), `${idioma.locale}: moeda ${idioma.moeda} ausente`);
    for (const valor of idioma.extras) {
      assert.ok(html.includes(`>${valor}<`), `${idioma.locale}: preço de extra ${valor} sumiu da home`);
    }
  });

  test(`[${idioma.locale}] a manutenção mensal não volta ao site`, async () => {
    /* Decisão de 13/09/2026: o estúdio vende o site e, depois dele, só
       alteração paga pelo tempo. Plano mensal anunciado seria promessa que a casa decidiu
       não fazer. Confere-se o texto VISÍVEL: tira script e marcação antes. */
    const html = await htmlDe(idioma.home);
    const visivel = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ");
    assert.doesNotMatch(visivel, /manuten[çc][ãa]o|mantenimiento|maintenance/i, `${idioma.locale}: manutenção voltou ao texto da home`);
    assert.doesNotMatch(visivel, /plano mensal|plan mensual|monthly plan|\/m[êe]s\b|\/month\b/i, `${idioma.locale}: plano mensal voltou à home`);
    assert.doesNotMatch(html, /titulo-manutencao/, `${idioma.locale}: a seção de manutenção voltou`);
    /* A condição de abertura "os cinco primeiros" também saiu, no mesmo dia: os
       valores dela viraram a tabela em real, e anunciar uma oferta que não
       existe mais seria o site prometendo o que a casa não cobra. */
    assert.doesNotMatch(visivel, /cinco primeiros|condição de abertura|condición de apertura|opening offer/i, `${idioma.locale}: a condição de abertura voltou`);
  });

  test(`[${idioma.locale}] os extras são cards, com a ilustração certa em cada um`, async () => {
    /* Ordem e desenho são casados pelo NOME do serviço (`item.arte`), e é
       isso que se cobra: a mesma sequência nos três idiomas, uma ilustração
       dentro de cada card, e o Reparo só em português. */
    const html = await htmlDe(idioma.home);
    const cards = [...html.matchAll(/class="extra-celula extra-celula--([a-z]+)"/g)].map((m) => m[1]);
    const esperado = ["pagina", "redacao", "integracao", "rodada", "avulsa", ...(idioma.reparo ? ["reparo"] : [])];
    assert.deepEqual(cards, esperado, `${idioma.locale}: cards fora da ordem`);
    const pedacos = html.split(/class="extra-celula extra-celula--/).slice(1);
    for (const pedaco of pedacos) {
      const nome = pedaco.slice(0, pedaco.indexOf('"'));
      const card = pedaco.split("</li>")[0];
      assert.match(card, /<svg[^>]*viewBox="[0-9. ]+"/, `${idioma.locale}: card ${nome} sem ilustração`);
      assert.match(card, /href="#contato"/, `${idioma.locale}: card ${nome} não leva ao contato`);
    }
    /* `class="..."` e não a palavra solta: o payload do RSC repete as classes
       no corpo da página (a regra 9.2), e a contagem solta dava dois. */
    assert.equal((html.match(/class="[^"]*extra--destaque/g) ?? []).length, 1, `${idioma.locale}: esperava um card de destaque`);
  });

  test(`[${idioma.locale}] fala como estúdio: nenhum nome de pessoa na home`, async () => {
    const html = await htmlDe(idioma.home);

    /* Decisão comercial de 2026-08-10: o site se apresenta só como Varanda
       Estúdio Web. Isto é teste e não revisão porque o nome tinha voltado
       por quatro caminhos diferentes — assinatura da seção "sobre",
       `authors` nos metadados, `founder` no JSON-LD — e o endereço de e-mail
       o exibia em texto grande na seção de contato sem parecer um nome.

       O quinto caminho foi este teste que encontrou, na tradução: passar o
       dicionário inteiro como propriedade de um componente cliente serializa
       **todas** as chaves no payload, inclusive o texto da política. O nome
       ficava invisível na tela e presente no fonte das três home. A correção
       foi passar fatias; este teste é o que impede a volta. */
    assert.doesNotMatch(html, /Lucca Oliveira/i, `${idioma.locale}: nome da pessoa voltou à home`);
    assert.doesNotMatch(html, /luccaassoc/i, `${idioma.locale}: o e-mail pessoal voltou à home`);

    /* Conhecido e ainda aberto: as três URLs do portfólio apontam para
       o `*.workers.dev` da conta, que carrega um nome e ainda parece
       endereço de teste. Só sai com domínio próprio para os conceituais —
       por isso a asserção acima é pelo nome completo, não por "lucca". */
  });

  test(`[${idioma.locale}] a política mantém a identificação exigida por lei`, async () => {
    const response = await fetchRoute(idioma.politica);
    const html = await response.text();

    assert.equal(response.status, 200);
    assertSecurityHeaders(response);
    assert.equal(canonicalDe(html), `${SITE}${idioma.politica}`);

    /* O contraponto do teste acima. A LGPD e o RGPD exigem identificar quem
       controla os dados; se alguém "limpar" o nome daqui junto com o resto
       do site, as três páginas ficam ilegais em silêncio. */
    assert.match(html, /Lucca Oliveira/i, `${idioma.locale}: identificação do controlador sumiu`);
    assert.match(html, /luccaassoc@gmail\.com/i, `${idioma.locale}: sem canal para pedido de titular`);
  });

  test(`[${idioma.locale}] o seletor de idioma leva aos outros dois`, async () => {
    const html = await htmlDe(idioma.home);
    for (const outro of IDIOMAS.filter((o) => o.locale !== idioma.locale)) {
      assert.match(
        html,
        new RegExp(`href=["']${outro.home.replace("/", "\\/")}["']`),
        `${idioma.locale}: sem link para ${outro.locale}`,
      );
    }
  });
}

test("nenhum endereço de worker sobra nos metadados", async () => {
  for (const idioma of IDIOMAS) {
    for (const rota of [idioma.home, idioma.politica]) {
      assert.doesNotMatch(headDe(await htmlDe(rota)), /workers\.dev/i, `${rota} ainda cita workers.dev na head`);
    }
  }
});

test("o conteúdo não depende do JavaScript para aparecer", async () => {
  const html = await htmlDe("/");
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

test("a home publica dados estruturados válidos e sem dado inventado", async () => {
  for (const idioma of IDIOMAS) {
    const html = await htmlDe(idioma.home);

    const bloco = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    assert.ok(bloco, `${idioma.locale}: nenhum bloco JSON-LD na página`);

    /* Se o JSON estiver malformado o Google descarta tudo em silêncio, então
       o teste precisa fazer o parse, não só procurar a string. */
    const dados = JSON.parse(bloco[1]);
    assert.equal(dados["@context"], "https://schema.org");
    assert.equal(dados["@type"], "ProfessionalService");
    assert.equal(dados.name, "Varanda Estúdio Web");
    assert.equal(dados.url, SITE);
    assert.equal(dados.inLanguage, idioma.hreflang);
    assert.ok(Array.isArray(dados.serviceType) && dados.serviceType.length > 0);
    assert.equal(dados.hasOfferCatalog.itemListElement.length, 3);

    /* O protocolo proíbe inventar dado comercial. Estes campos só poderiam
       ser preenchidos com número que ninguém confirmou. */
    for (const campo of ["aggregateRating", "review", "priceRange", "foundingDate", "address", "taxID", "founder"]) {
      assert.equal(dados[campo], undefined, `${idioma.locale}: ${campo} não pode ser inventado`);
    }
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
  const aberto = await pedir("http://varanda-estudio-web.test/es/privacidad?x=1");
  assert.equal(aberto.status, 301);
  assert.equal(aberto.headers.get("location"), "https://varanda-estudio-web.test/es/privacidad?x=1");

  /* A borda da Cloudflare entrega o esquema original no CF-Visitor. Ele
     manda mais que o endereço: numa borda que já terminou o TLS, a URL
     chega como https mesmo quando o visitante veio de http. */
  const viaBorda = await pedir("https://varanda-estudio-web.test/en", { "CF-Visitor": '{"scheme":"http"}' });
  assert.equal(viaBorda.status, 301, "CF-Visitor http deve redirecionar mesmo com URL https");

  /* E o contrário: quem já está em HTTPS **não** pode ser redirecionado,
     senão o destino vira http de novo e o site entra em laço infinito. */
  const seguro = await pedir("https://varanda-estudio-web.test/", { "CF-Visitor": '{"scheme":"https"}' });
  assert.notEqual(seguro.status, 301, "requisição já segura não pode redirecionar");

  /* localhost fica de fora: é onde rodam o dev e estes testes. */
  const local = await pedir("http://localhost/privacidade");
  assert.notEqual(local.status, 301, "localhost não pode redirecionar");
});

test("a head declara SÓ o SVG, e os quatro arquivos existem e são válidos", async () => {
  /* Em 2026-08-14 o resultado de busca do Google ainda mostrava o "V" verde
     antigo. O SVG publicado estava certo, válido e em 200: o que faltava era
     formato alternativo, e `/favicon.ico` respondia 404 — que é o endereço
     que o rastreador tenta sozinho quando não usa o que foi declarado.

     A causa maior era outra (o Google não tinha voltado, e o título exibido
     era anterior a 10/08), mas declarar só um formato era o risco que dava
     para eliminar de graça.

     **A head é recortada de propósito.** O payload repete metadado no corpo
     da página, e asserção sobre o documento inteiro já passou aqui com a tag
     ausente.

     EM 09/09/2026 ESTE TESTE INVERTEU, e o motivo é o oposto do de cima. O
     dono viu a aba do painel creme e âmbar e a do site TODA PRETA. Os dois SVG
     são o mesmo desenho; quem estragava era esta declaração. O painel declara
     só o SVG, então a aba usa o SVG e ele troca de cor com o tema; o site
     declarava também os PNG com `sizes`, e o Chrome PREFERE o raster quando
     existe um no tamanho pedido. Os rasters eram tinta escura sobre
     transparente: um borrão preto em barra de abas escura.

     Agora a head declara SÓ o SVG (mais o apple-touch, que o iOS exige porque
     não lê SVG), e este teste cobra isso. Os arquivos raster continuam
     existindo e continuam conferidos por bytes abaixo: `/favicon.ico` é o
     caminho que todo rastreador pede sozinho, e eles agora saem creme e âmbar
     sobre o chão da marca, legíveis no branco da busca e numa aba escura. */
  const head = headDe(await htmlDe("/"));

  const tagsDeIcone = [...head.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => /rel=["'][^"']*icon/i.test(tag));

  const hrefs = tagsDeIcone.map((tag) => tag.match(/href=["']([^"']+)["']/i)?.[1] ?? "");

  for (const esperado of ["/favicon.svg", "/apple-touch-icon.png"]) {
    assert.ok(
      hrefs.some((href) => href.includes(esperado)),
      `${esperado} não está declarado na head (declarados: ${hrefs.join(", ") || "nenhum"})`,
    );
  }

  /* E o que NÃO pode estar declarado, que é a metade que conserta o defeito:
     raster no `rel="icon"` faz o Chrome preferir o raster à aba adaptativa. */
  for (const proibido of ["/favicon-96.png", "/favicon-48.png", "/favicon.ico"]) {
    assert.ok(
      !hrefs.some((href) => href.includes(proibido)),
      `${proibido} voltou a ser declarado em rel="icon": a aba deixa de usar o SVG`,
    );
  }

  /* Declarar `sizes="96x96"` num arquivo que não tem 96px é pior que não
     declarar: o buscador confia no atributo. Ler o IHDR do PNG é a única
     forma de conferir sem dependência — largura e altura são dois inteiros
     de 32 bits logo depois da assinatura e do cabeçalho do bloco. */
  const publicDir = new URL("../public/", import.meta.url);

  for (const [arquivo, lado] of [
    ["favicon-96.png", 96],
    ["favicon-48.png", 48],
    ["apple-touch-icon.png", 180],
  ]) {
    const bytes = await readFile(new URL(arquivo, publicDir));
    assert.equal(bytes.subarray(12, 16).toString("ascii"), "IHDR", `${arquivo} não é um PNG`);
    assert.equal(bytes.readUInt32BE(16), lado, `${arquivo} não tem ${lado}px de largura`);
    assert.equal(bytes.readUInt32BE(20), lado, `${arquivo} não tem ${lado}px de altura`);
  }

  const ico = await readFile(new URL("favicon.ico", publicDir));
  /* Cabeçalho ICO: dois bytes zerados, tipo 1, e a contagem de imagens. */
  assert.equal(ico.readUInt16LE(0), 0, "favicon.ico não começa com o cabeçalho ICO");
  assert.equal(ico.readUInt16LE(2), 1, "favicon.ico não se declara como ícone");
  assert.ok(ico.readUInt16LE(4) >= 1, "favicon.ico não contém nenhuma imagem");
});

test("todo SVG do projeto é XML válido", async () => {
  /* Um favicon com XML inválido não avisa: o navegador não faz o parse, não
     renderiza nada, e mantém o ícone anterior. Parece cache e não é.

     Aconteceu aqui: um comentário trazia o nome de uma variável CSS, e
     comentário XML **não pode conter dois hifens seguidos**. O arquivo foi
     publicado, o md5 do que o servidor entregava batia com o do repositório,
     e mesmo assim o ícone não aparecia. Comparar bytes prova que o arquivo
     chegou, não que ele é válido.

     `DOMParser` não existe no Node, então a validação é por regex sobre as
     armadilhas conhecidas de XML, mais uma checagem de tags balanceadas. */
  const { readdir, readFile } = await import("node:fs/promises");
  const dir = new URL("../public/", import.meta.url);

  async function svgsDe(caminho, prefixo = "") {
    const saida = [];
    for (const item of await readdir(caminho, { withFileTypes: true })) {
      const nome = prefixo + item.name;
      if (item.isDirectory()) saida.push(...await svgsDe(new URL(item.name + "/", caminho), nome + "/"));
      else if (item.name.endsWith(".svg")) saida.push([nome, new URL(item.name, caminho)]);
    }
    return saida;
  }

  /* Os mestres das ilustrações dos extras também são SVG escritos à mão, e o
     gerador os converte em JSX. XML inválido ali não quebra o site, mas
     quebra o arquivo que se abre para corrigir o desenho. */
  const arte = await svgsDe(new URL("../assets/extras-arte/", import.meta.url), "assets/extras-arte/");
  assert.equal(arte.length, 6, `esperava 6 mestres de ilustração, achei ${arte.length}`);
  const arquivos = [...(await svgsDe(dir)), ...arte];
  assert.ok(arquivos.length > 0, "nenhum SVG encontrado em public/");

  for (const [nome, url] of arquivos) {
    const texto = await readFile(url, "utf8");

    for (const comentario of texto.matchAll(/<!--([\s\S]*?)-->/g)) {
      assert.doesNotMatch(
        comentario[1],
        /--/,
        `${nome}: comentário XML com dois hifens seguidos, o que invalida o arquivo inteiro`,
      );
    }

    /* Contar tags exige tirar os comentários antes: o `assinatura.svg` cita
       literalmente uma tag dentro de um aviso, e contá-la dava desequilíbrio
       onde o arquivo estava correto. Foi este teste que errou primeiro. */
    const semComentario = texto.replace(/<!--[\s\S]*?-->/g, "");

    const abre = (semComentario.match(/<(?!\/|!|\?)[a-zA-Z]/g) || []).length;
    const fecha = (semComentario.match(/<\//g) || []).length + (semComentario.match(/\/>/g) || []).length;
    assert.equal(abre, fecha, `${nome}: ${abre} tags abertas contra ${fecha} fechadas`);

    assert.match(semComentario, /<svg[\s>]/, `${nome}: não começa com <svg>`);
    assert.doesNotMatch(semComentario, /&(?!amp;|lt;|gt;|quot;|apos;|#)/, `${nome}: & sem escapar`);
  }
});

/**
 * O CARTÃO DE PRÉ-VISUALIZAÇÃO DO LINK, e por que ele precisa de teste próprio.
 *
 * Ele é a peça mais vista do site por quem ainda não é visitante: todo prospect
 * recebe o endereço por WhatsApp e vê isto antes da home.
 *
 * **O Satori falha em silêncio.** Ele exige `display` explícito em qualquer
 * elemento com mais de um filho, e quando não encontra não desenha nada: a
 * rota responde **200**, com `content-type: image/png` correto, e **zero
 * byte**. Não há erro no console, não há aviso no build, e o teste de
 * metadados continua passando, porque a tag `og:image` existe e aponta para um
 * endereço que responde. Foi assim que o cartão foi publicado em branco em
 * 28/08/2026, junto com a identidade nova, e só apareceu ao baixar o arquivo e
 * tentar abrir.
 *
 * Por isso o teste não confere o código HTTP nem o tipo: os dois estavam certos
 * com o cartão vazio. Ele lê os BYTES e o IHDR, que é o mesmo critério que os
 * favicons já usam neste arquivo.
 */
test("os três cartões de link são imagens de verdade, e são TRÊS", async () => {
  /* **O endereço de cada cartão sai da head da própria página**, e não é
     escrito aqui. O vinext dá nome com hash aos arquivos de metadado de
     segmento (`/en/opengraph-image-1nh35u`), então adivinhar o caminho mediria
     um 404 e o teste passaria a provar outra coisa. */
  const bytesDe = async (rotaDaPagina) => {
    const head = headDe(await htmlDe(rotaDaPagina));
    const declarados = [...head.matchAll(/<meta property="og:image" content="([^"]+)"/g)];
    assert.equal(declarados.length, 1, `${rotaDaPagina}: esperava uma og:image na head`);

    const endereco = new URL(declarados[0][1]);
    const resposta = await worker.fetch(
      new Request(`https://varanda-estudio-web.test${endereco.pathname}${endereco.search}`),
      env,
      ctx,
    );
    assert.equal(resposta.status, 200, `${rotaDaPagina}: a rota do cartão não respondeu 200`);
    return Buffer.from(await resposta.arrayBuffer());
  };

  const cartoes = new Map();
  for (const rota of ["/", "/en", "/es"]) {
    const bytes = await bytesDe(rota);
    assert.ok(
      bytes.length > 5000,
      `${rota}: o cartão saiu com ${bytes.length} bytes; abaixo disso não há imagem, e zero é o sintoma do Satori falhando em silêncio`,
    );
    assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG", `${rota}: o corpo do cartão não é um PNG`);
    assert.equal(bytes.subarray(12, 16).toString("ascii"), "IHDR", `${rota}: PNG sem cabeçalho IHDR`);
    assert.equal(bytes.readUInt32BE(16), 1200, `${rota}: o cartão não tem 1200px de largura`);
    assert.equal(bytes.readUInt32BE(20), 630, `${rota}: o cartão não tem 630px de altura`);
    cartoes.set(rota, createHash("md5").update(bytes).digest("hex"));
  }

  /* **Três md5 diferentes.** Até 09/09/2026 as três rotas herdavam o mesmo
     arquivo da raiz da árvore: `/en` e `/es` mandavam para o mundo um cartão
     escrito em português, e nenhuma verificação de bytes pegaria isso, porque
     o PNG era válido. O que separa "existe imagem" de "existe a imagem certa"
     é justamente os três serem distintos. */
  const distintos = new Set(cartoes.values());
  assert.equal(
    distintos.size,
    3,
    `os três cartões precisam ser diferentes entre si, e saíram ${distintos.size} arquivo(s) distintos`,
  );
});

/**
 * A PÁGINA DE ENDEREÇO QUE NÃO EXISTE.
 *
 * Duas coisas que só valem juntas, e é por isso que o teste é um só:
 *
 * 1. **O código HTTP é 404 de verdade.** Rota coringa que responde 200 com a
 *    página de erro é um soft 404, e o buscador indexa endereço que não
 *    existe (regra 9.3). Quem troca o código é `worker/index.ts`.
 * 2. **Os metadados são os da página de erro**, e não os do layout. É aqui
 *    que o caminho idiomático do Next falha no vinext: `notFound()` com
 *    `app/not-found.tsx` acerta o item 1 e erra o item 2 em silêncio.
 *
 * A head é recortada e as tags são CONTADAS, porque o payload RSC repete
 * metadado no corpo da página e asserção sobre o documento inteiro já passou
 * aqui com a tag ausente (regra 9.2).
 */
test("endereço que não existe responde 404, com a página e os metadados certos", async () => {
  const CASOS = [
    { rota: "/nao-existe", lang: "pt-BR", titulo: "Página não encontrada | Varanda Estúdio Web" },
    { rota: "/en/does-not-exist", lang: "en", titulo: "Page not found | Varanda Estúdio Web" },
    { rota: "/es/no-existe", lang: "es", titulo: "Página no encontrada | Varanda Estúdio Web" },
    { rota: "/privacidade/xx", lang: "pt-BR", titulo: "Página não encontrada | Varanda Estúdio Web" },
    { rota: "/a/b/c/d", lang: "pt-BR", titulo: "Página não encontrada | Varanda Estúdio Web" },
  ];

  for (const caso of CASOS) {
    const resposta = await fetchRoute(caso.rota);
    assert.equal(resposta.status, 404, `${caso.rota}: soft 404, o buscador indexaria este endereço`);
    assert.match(
      resposta.headers.get("content-type") ?? "",
      /text\/html/,
      `${caso.rota}: a página de erro precisa ser HTML, e não o texto puro de antes`,
    );

    const html = await resposta.text();
    const head = headDe(html);

    assert.equal((head.match(/<title[ >]/g) ?? []).length, 1, `${caso.rota}: esperava uma <title> só`);
    assert.ok(head.includes(`<title>${caso.titulo}</title>`), `${caso.rota}: título errado`);
    assert.equal(html.match(/<html lang="([^"]*)"/)?.[1], caso.lang, `${caso.rota}: idioma errado no <html>`);

    /* `noindex` na head, e não no documento: endereço que não existe não pode
       entrar no índice. `follow` fica, para o rastreador seguir o link da home
       em vez de tratar isto como beco. */
    assert.equal((head.match(/name="robots"/g) ?? []).length, 1, `${caso.rota}: esperava um robots só`);
    assert.match(head, /content="noindex/, `${caso.rota}: a página de erro precisa ser noindex`);
    assert.doesNotMatch(head, /nofollow/, `${caso.rota}: nofollow deixaria o rastreador sem saída`);

    /* Sem canonical: não existe endereço oficial de uma página que não existe. */
    assert.equal(canonicalDe(html), null, `${caso.rota}: página de erro não pode declarar canonical`);

    /* Caminho de volta, que é o motivo de a página existir. */
    const inicio = { "pt-BR": "/", en: "/en", es: "/es" }[caso.lang];
    assert.ok(
      html.includes(`href="${inicio}"`),
      `${caso.rota}: a página de erro precisa levar de volta para ${inicio}`,
    );
  }

  /* E o outro lado, que é o que impede a troca de código de virar defeito: as
     seis páginas de verdade continuam em 200. */
  for (const rota of ["/", "/privacidade", "/en", "/en/privacy", "/es", "/es/privacidad"]) {
    const resposta = await fetchRoute(rota);
    assert.equal(resposta.status, 200, `${rota} deixou de responder 200`);
  }

  /* E o que não é página não pode virar 404 por não estar na lista de rotas. */
  for (const [rota, tipo] of [
    ["/robots.txt", /text\/plain/],
    ["/sitemap.xml", /xml/],
  ]) {
    const resposta = await fetchRoute(rota);
    assert.equal(resposta.status, 200, `${rota} deixou de responder 200`);
    assert.match(resposta.headers.get("content-type") ?? "", tipo, `${rota}: tipo errado`);
  }
});
