import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";

/**
 * AS ROTAS DO QUESTIONÁRIO DE PROJETO, contra o Worker compilado.
 *
 * Como `rendered-html.test.mjs`, este arquivo importa `dist/server/index.js`
 * no Node e chama `fetch` com um `env` falso. A diferença é o painel: aqui
 * `env.BRIEFING` é um objeto em memória com `abrir` e `salvar`, que imita o
 * contrato 1 da ESPEC 2.4 (estados, trava otimista, limite, tamanho). Não
 * existe modo de demonstração no código do site: o painel falso só existe
 * neste arquivo.
 *
 * **Todo teste daqui foi visto falhando** com o código quebrado de propósito
 * antes de valer como guarda (regra 9.32). As mutações feitas estão no
 * comentário de cada grupo.
 *
 * Os nomes começam pelo grupo ("página:", "cabeçalho interno:",
 * "cabeçalhos:", "api:", "sem JavaScript:", "log:", "fonte:") para a falha
 * dizer de cara qual contrato quebrou.
 */

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-briefing`);
const { default: worker } = await import(workerUrl.href);

const { CABECALHO_BRIEFING, codificarCabecalho } = await import(new URL("../app/briefing/contexto.ts", import.meta.url).href);
const { PERGUNTAS } = await import(new URL("../app/briefing/nucleo.ts", import.meta.url).href);
const { VERSAO } = await import(new URL("../app/briefing/perguntas.ts", import.meta.url).href);

const ORIGEM = "https://varanda-estudio-web.test";
const ctx = { waitUntil() {}, passThroughOnException() {} };

/* ---------- O painel falso ---------- */

/* Chaves de 22 caracteres no alfabeto base64url, legíveis no teste. */
const chave = (nome) => `${nome}${"_".repeat(22)}`.slice(0, 22);
const K = {
  aberto: chave("aberto"),
  enviado: chave("enviado"),
  fechado: chave("fechado"),
  encerrado: chave("encerrado"),
  vencido: chave("vencido"),
  limite: chave("limite"),
  tamanho: chave("tamanho"),
  desconhecida: chave("naoexiste"),
};

const CONTEXTO = {
  idioma: "pt",
  pais: "BR",
  pacote: "negocio",
  capacidade: null,
  paginas: 6,
  idiomas_site: ["pt_br"],
  moeda: "BRL",
  empresa: "Exemplo Varanda",
  primeiro_nome: "Ana",
};
const INICIAL = {
  empresa: "Exemplo Varanda",
  responsavel: "Ana Exemplo",
  email: "contato@exemplo.test",
  telefone: "11 91234-5678",
  cnpj: null,
  instagram: "@exemploteste",
  site: null,
  cidade: "Santo André",
};

/* "AAAA-MM-DD HH:MM:SS" em UTC, que é o que o `datetime('now')` do D1 grava. */
function sqlite(data = new Date()) {
  return data.toISOString().slice(0, 19).replace("T", " ");
}

function linha(estado, extra = {}) {
  return {
    estado,
    contexto: { ...CONTEXTO },
    inicial: { ...INICIAL },
    respostas: {},
    revisao: 0,
    salvo_em: null,
    enviado_em: null,
    envios: 0,
    ...extra,
  };
}

/**
 * O que o RPC do workerd (o Service Binding de verdade) recusa, e o
 * `structuredClone` do Node aceita: objeto cujo protótipo não é
 * `Object.prototype` nem `Array.prototype`. No workerd ele lança
 * `DataCloneError` no lado de quem chama, antes de chegar ao painel.
 *
 * O painel falso copiava os dados com `structuredClone` e por isso escondeu,
 * na primeira rodada, que TODA gravação morria em 503: o saneamento cria as
 * respostas com `Object.create(null)` de propósito. Achado na revisão ponta a
 * ponta de 25/09/2026, com os dois Workers ligados por binding de verdade.
 */
function serializavelPeloWorkerd(valor) {
  if (valor === null || typeof valor !== "object") return;
  const prototipo = Object.getPrototypeOf(valor);
  if (prototipo !== Object.prototype && prototipo !== Array.prototype) {
    throw new DOMException('Could not serialize object of type "Object". This type does not support serialization.', "DataCloneError");
  }
  for (const v of Object.values(valor)) serializavelPeloWorkerd(v);
}

/**
 * Um painel em memória com o contrato 1. `falhar` simula o painel fora do ar
 * ("abrir", "salvar"), um contrato de outra versão ("contrato") ou o binding
 * ausente (quem chama tira `BRIEFING` do env). As mensagens de erro trazem a
 * chave de propósito: o teste de log confere que ela não vaza.
 */
function criarPainel() {
  const linhas = new Map([
    [K.aberto, linha("aberto")],
    [K.enviado, linha("enviado", { enviado_em: sqlite(), envios: 1, revisao: 4 })],
    [K.fechado, linha("fechado")],
    [K.encerrado, linha("encerrado")],
    [K.vencido, linha("vencido")],
    [K.limite, linha("aberto", { limite: true })],
    [K.tamanho, linha("aberto", { tamanho: true })],
  ]);
  const chamadas = [];
  const painel = {
    linhas,
    chamadas,
    falhar: null,
    /* Roda uma vez antes do próximo `salvar`, para simular outro aparelho
       gravando entre o `abrir` e o `salvar` do Worker. */
    antesDeSalvar: null,
    async abrir(token, opcoes) {
      chamadas.push({ metodo: "abrir", token, opcoes });
      if (painel.falhar === "abrir") throw new Error(`D1 indisponível ao ler ${token}`);
      if (painel.falhar === "contrato") return { contrato: 2, estado: "aberto" };
      const l = linhas.get(token);
      if (!l) return { contrato: 1, estado: "invalido" };
      if (l.estado === "encerrado" || l.estado === "vencido") return { contrato: 1, estado: l.estado };
      if (l.estado === "fechado") return { contrato: 1, estado: "fechado", contexto: { ...l.contexto } };
      return {
        contrato: 1,
        estado: l.estado,
        contexto: { ...l.contexto },
        inicial: { ...l.inicial },
        respostas: structuredClone(l.respostas),
        revisao: l.revisao,
        salvo_em: l.salvo_em,
        enviado_em: l.enviado_em,
        envios: l.envios,
      };
    },
    async salvar(token, dados) {
      /* Como o workerd: recusa antes de a chamada existir para o painel. */
      serializavelPeloWorkerd(dados);
      chamadas.push({ metodo: "salvar", token, dados: structuredClone(dados) });
      if (painel.falhar === "salvar") throw new Error(`D1 indisponível ao gravar ${token}`);
      if (painel.antesDeSalvar) {
        const antes = painel.antesDeSalvar;
        painel.antesDeSalvar = null;
        antes(linhas.get(token));
      }
      const l = linhas.get(token);
      if (!l) return { ok: false, motivo: "invalido" };
      if (["encerrado", "vencido", "fechado"].includes(l.estado)) return { ok: false, motivo: l.estado };
      if (l.limite && !dados.final) return { ok: false, motivo: "limite", retry_after: 120 };
      if (l.tamanho) return { ok: false, motivo: "tamanho" };
      if (dados.revisao_base !== l.revisao) {
        return { ok: false, motivo: "conflito", revisao: l.revisao, respostas: structuredClone(l.respostas) };
      }
      l.respostas = structuredClone(dados.respostas);
      l.revisao += 1;
      l.salvo_em = sqlite();
      if (dados.final) {
        l.estado = "enviado";
        l.envios += 1;
        l.enviado_em = l.salvo_em;
      }
      return { ok: true, revisao: l.revisao, salvo_em: l.salvo_em, enviado_em: l.enviado_em, envios: l.envios };
    },
  };
  return painel;
}

function ambiente(painel) {
  return { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) }, BRIEFING: painel, BRIEFING_ATIVO: "1" };
}

/* Os testes que derrubam o painel de propósito fazem o Worker registrar a
   falha. O conteúdo do log é conferido no grupo "log:"; nos outros, ele só
   polui a saída. */
async function calando(fazer) {
  const original = console.error;
  console.error = () => {};
  try {
    return await fazer();
  } finally {
    console.error = original;
  }
}

function pedir(env, caminho, init = {}) {
  const headers = new Headers(init.headers ?? {});
  if (!headers.has("accept")) headers.set("accept", "text/html");
  return worker.fetch(new Request(`${ORIGEM}${caminho}`, { ...init, headers }), env, ctx);
}

/**
 * Um pedido à API como o navegador faz: mesma origem nos dois cabeçalhos, a
 * menos que o teste diga outra coisa (passar `null` apaga o cabeçalho).
 */
function api(env, metodo, { k, corpo, tipo = "application/json", headers = {}, idioma } = {}) {
  const busca = k === undefined ? "" : `?chave=${k}${idioma ? `&idioma=${idioma}` : ""}`;
  const h = new Headers({ accept: "application/json", "sec-fetch-site": "same-origin", origin: ORIGEM });
  if (corpo !== undefined && tipo) h.set("content-type", tipo);
  for (const [nome, valor] of Object.entries(headers)) {
    if (valor === null) h.delete(nome);
    else h.set(nome, valor);
  }
  const body = corpo === undefined ? undefined : typeof corpo === "string" || corpo instanceof Uint8Array ? corpo : JSON.stringify(corpo);
  return worker.fetch(new Request(`${ORIGEM}/api/briefing${busca}`, { method: metodo, headers: h, body }), env, ctx);
}

/* ---------- Leitura do HTML ---------- */

function headDe(html) {
  return html.slice(0, html.indexOf("</head>"));
}
const langDe = (html) => html.match(/<html[^>]*\slang=["']([^"']+)["']/i)?.[1];
const titulosDe = (html) => [...headDe(html).matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => m[1]);
/* O marcador é lido no ELEMENTO, e não em qualquer lugar do documento: o
   payload do RSC repete as props no corpo (regra 9.2). */
function marcadorDe(html) {
  const m = html.match(/<main[^>]*data-briefing-estado="([^"]+)"[^>]*data-briefing-tela="([^"]+)"/);
  return m ? { estado: m[1], tela: m[2] } : null;
}

const IDIOMAS = [
  { locale: "pt", prefixo: "", lang: "pt-BR", titulo: "Questionário de projeto | Varanda Estúdio Web", erro: "Página não encontrada | Varanda Estúdio Web" },
  { locale: "es", prefixo: "/es", lang: "es", titulo: "Cuestionario de proyecto | Varanda Estúdio Web", erro: "Página no encontrada | Varanda Estúdio Web" },
  { locale: "en", prefixo: "/en", lang: "en", titulo: "Project questionnaire | Varanda Estúdio Web", erro: "Page not found | Varanda Estúdio Web" },
];

/* ==========================================================================
   página:
   Mutações vistas falhando: 410 trocado por 200 em `atenderPagina`; o
   `.rsc` tirado da regex da página; `marcar: false` trocado por `true`;
   `decidirTela` sem exigir o `?enviado=1`; `disallow: "/briefing"` no
   `app/robots.ts`.
   ========================================================================== */

test("página: aberto e enviado respondem 200 nos três idiomas, com o lang da rota e sem marcar a abertura", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  for (const idioma of IDIOMAS) {
    for (const estado of ["aberto", "enviado"]) {
      const resposta = await pedir(env, `${idioma.prefixo}/briefing?chave=${K[estado]}`);
      const html = await resposta.text();
      assert.equal(resposta.status, 200, `${idioma.locale} ${estado}: status`);
      assert.match(resposta.headers.get("content-type") ?? "", /^text\/html/);
      assert.equal(langDe(html), idioma.lang, `${idioma.locale} ${estado}: lang`);
      assert.deepEqual(titulosDe(html), [idioma.titulo], `${idioma.locale} ${estado}: título`);
      assert.deepEqual(marcadorDe(html), { estado, tela: "formulario" }, `${idioma.locale} ${estado}: marcador`);
    }
  }
  /* A prévia de link do WhatsApp faz GET na página: se a página marcasse, o
     painel diria "abriu" no minuto em que o link foi mandado. */
  const aberturas = painel.chamadas.filter((c) => c.metodo === "abrir");
  assert.equal(aberturas.length, 6);
  assert.ok(aberturas.every((c) => c.opcoes?.marcar === false), "a página não pode marcar a abertura");
});

test("página: encerrado e vencido respondem 410; fechado responde 200 com a tela de só leitura", async () => {
  const env = ambiente(criarPainel());
  for (const idioma of IDIOMAS) {
    for (const estado of ["encerrado", "vencido"]) {
      const resposta = await pedir(env, `${idioma.prefixo}/briefing?chave=${K[estado]}`);
      const html = await resposta.text();
      assert.equal(resposta.status, 410, `${idioma.locale} ${estado}: status`);
      assert.equal(langDe(html), idioma.lang);
      assert.deepEqual(marcadorDe(html), { estado, tela: "encerrado" });
    }
    const fechado = await pedir(env, `${idioma.prefixo}/briefing?chave=${K.fechado}`);
    assert.equal(fechado.status, 200);
    assert.deepEqual(marcadorDe(await fechado.text()), { estado: "fechado", tela: "fechado" });
  }
});

test("página: painel fora do ar, contrato de outra versão ou binding ausente dão 503 com Retry-After", async () => {
  for (const caso of ["abrir", "contrato", "sem binding"]) {
    const painel = criarPainel();
    const env = ambiente(painel);
    if (caso === "sem binding") delete env.BRIEFING;
    else painel.falhar = caso;
    for (const idioma of IDIOMAS) {
      const resposta = await calando(() => pedir(env, `${idioma.prefixo}/briefing?chave=${K.aberto}`));
      const html = await resposta.text();
      assert.equal(resposta.status, 503, `${caso} ${idioma.locale}: status`);
      assert.equal(resposta.headers.get("retry-after"), "300", `${caso}: Retry-After`);
      assert.equal(langDe(html), idioma.lang);
      assert.deepEqual(marcadorDe(html), { estado: "fora_do_ar", tela: "fora_do_ar" }, `${caso}: tela`);
    }
  }
});

test("página: sem chave, chave curta, fora do alfabeto ou desconhecida dão 404 com a página de erro do idioma", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  for (const idioma of IDIOMAS) {
    const malformadas = ["", "?chave=", "?chave=curta", `?chave=${K.aberto}x`, `?chave=${K.aberto.slice(0, 21)}!`, `?outra=${K.aberto}`];
    for (const busca of malformadas) {
      const resposta = await pedir(env, `${idioma.prefixo}/briefing${busca}`);
      const html = await resposta.text();
      assert.equal(resposta.status, 404, `${idioma.prefixo}/briefing${busca}`);
      assert.deepEqual(titulosDe(html), [idioma.erro], `${idioma.prefixo}/briefing${busca}: não é a página de erro`);
      assert.equal(langDe(html), idioma.lang);
      assert.equal(marcadorDe(html), null);
    }
  }
  /* Chave malformada não gasta chamada ao painel. */
  assert.equal(painel.chamadas.length, 0, "chave malformada não pode chegar ao painel");

  for (const idioma of IDIOMAS) {
    const resposta = await pedir(env, `${idioma.prefixo}/briefing?chave=${K.desconhecida}`);
    assert.equal(resposta.status, 404);
    assert.deepEqual(titulosDe(await resposta.text()), [idioma.erro]);
  }
  assert.equal(painel.chamadas.length, 3);
});

test("página: o pedido .rsc da mesma rota não dá 404 e leva o estado", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  for (const idioma of IDIOMAS) {
    const resposta = await pedir(env, `${idioma.prefixo}/briefing.rsc?chave=${K.aberto}`, { headers: { accept: "text/x-component" } });
    assert.equal(resposta.status, 200, `${idioma.prefixo}/briefing.rsc`);
    assert.match(resposta.headers.get("content-type") ?? "", /text\/x-component/);
    assert.match(await resposta.text(), /data-briefing-estado/, "o payload precisa trazer a página, e não o erro");
  }
  assert.equal(painel.chamadas.length, 3, "o .rsc também passa pelo painel");
});

test("página: link de outro idioma abre no idioma da URL, sem redirecionar", async () => {
  const painel = criarPainel();
  painel.linhas.get(K.aberto).contexto.idioma = "es";
  const resposta = await pedir(ambiente(painel), `/en/briefing?chave=${K.aberto}`);
  assert.equal(resposta.status, 200);
  assert.equal(resposta.headers.get("location"), null);
  assert.equal(langDe(await resposta.text()), "en");
});

test("página: recebido só com ?enviado=1 E um envio de agora há pouco", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  const tela = async (caminho) => marcadorDe(await (await pedir(env, caminho)).text())?.tela;

  assert.equal(await tela(`/briefing?chave=${K.enviado}&enviado=1`), "recebido");
  assert.equal(await tela(`/briefing?chave=${K.enviado}`), "formulario", "sem ?enviado=1, quem reabre quer o formulário");
  assert.equal(await tela(`/briefing?chave=${K.aberto}&enviado=1`), "formulario", "?enviado=1 sozinho não mostra recebido");

  painel.linhas.get(K.enviado).enviado_em = sqlite(new Date(Date.now() - 2 * 60 * 60 * 1000));
  assert.equal(await tela(`/briefing?chave=${K.enviado}&enviado=1`), "formulario", "envio de duas horas atrás não é recebido");
});

test("página: metadados na head, sem canonical, com noindex, nofollow e referrer no-referrer", async () => {
  const env = ambiente(criarPainel());
  for (const idioma of IDIOMAS) {
    const head = headDe(await (await pedir(env, `${idioma.prefixo}/briefing?chave=${K.aberto}`)).text());
    /* Contar as tags, e não procurar no documento (regra 9.2). */
    const robots = [...head.matchAll(/<meta name="robots" content="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(robots, ["noindex, nofollow"], `${idioma.locale}: robots`);
    const referrer = [...head.matchAll(/<meta name="referrer" content="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(referrer, ["no-referrer"], `${idioma.locale}: referrer`);
    assert.doesNotMatch(head, /rel="canonical"/, `${idioma.locale}: canonical`);
    assert.doesNotMatch(head, /hrefLang|hreflang/, `${idioma.locale}: hreflang`);
  }
});

test("página: com o questionário desligado, as quatro rotas respondem 404 como qualquer inexistente, sem chamar o painel", async () => {
  for (const ativo of ["0", undefined, "true"]) {
    const painel = criarPainel();
    const env = ambiente(painel);
    if (ativo === undefined) delete env.BRIEFING_ATIVO;
    else env.BRIEFING_ATIVO = ativo;
    for (const idioma of IDIOMAS) {
      for (const caminho of [`${idioma.prefixo}/briefing?chave=${K.aberto}`, `${idioma.prefixo}/briefing`, `${idioma.prefixo}/briefing.rsc?chave=${K.aberto}`]) {
        const resposta = await pedir(env, caminho);
        const html = await resposta.text();
        assert.equal(resposta.status, 404, `BRIEFING_ATIVO=${ativo} ${caminho}`);
        assert.deepEqual(titulosDe(html), [idioma.erro], `BRIEFING_ATIVO=${ativo} ${caminho}: página de erro`);
        /* Como qualquer inexistente: com os cabeçalhos do site, e não os do
           questionário, que denunciariam a rota. */
        assert.equal(resposta.headers.get("x-robots-tag"), null);
        assert.notEqual(resposta.headers.get("referrer-policy"), "no-referrer", "com os cabeçalhos do site, não os do questionário");
        assert.ok(resposta.headers.get("content-security-policy"));
      }
    }
    for (const metodo of ["GET", "PUT", "POST"]) {
      const resposta = await api(env, metodo, { k: K.aberto, corpo: metodo === "GET" ? undefined : { respostas: {}, revisao_base: 0 } });
      assert.equal(resposta.status, 404, `BRIEFING_ATIVO=${ativo} ${metodo} /api/briefing`);
    }
    assert.equal(painel.chamadas.length, 0, `BRIEFING_ATIVO=${ativo}: o painel não pode ser chamado`);
  }
});

test("página: fora do sitemap, e sem Disallow no robots.txt", async () => {
  /* O sitemap lista o que é para achar; o questionário é de uma empresa só.
     E `Disallow` no robots.txt ANULA o noindex da página, porque o rastreador
     que não busca a página nunca lê a meta (regra 9.10): quem tira o
     questionário da busca é o noindex, não o robots. */
  const env = ambiente(criarPainel());
  const sitemap = await (await pedir(env, "/sitemap.xml")).text();
  assert.match(sitemap, /<urlset/, "o sitemap não respondeu");
  assert.doesNotMatch(sitemap, /briefing/i, "o questionário entrou no sitemap");
  const robots = await (await pedir(env, "/robots.txt")).text();
  assert.match(robots, /User-Agent/i, "o robots.txt não respondeu");
  assert.doesNotMatch(robots, /briefing/i, "o robots.txt cita o questionário");
});

test("página: método que não é GET nem HEAD dá 405, sem chamar o painel", async () => {
  const painel = criarPainel();
  const resposta = await pedir(ambiente(painel), `/briefing?chave=${K.aberto}`, { method: "POST", body: "a=1", headers: { "content-type": "application/x-www-form-urlencoded" } });
  assert.equal(resposta.status, 405);
  assert.equal(resposta.headers.get("allow"), "GET, HEAD");
  assert.equal(painel.chamadas.length, 0);
});

/* ==========================================================================
   cabeçalho interno:
   Mutação vista falhando: `semCabecalhoInterno` devolvendo a requisição sem
   apagar o cabeçalho (a página passou a desenhar o estado forjado).
   ========================================================================== */

test("cabeçalho interno: o que vem de fora é apagado e a página não o usa", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  const forjado = codificarCabecalho({
    estado: "aberto",
    chave: K.aberto,
    contexto: { ...CONTEXTO, empresa: "Empresa Forjada" },
    inicial: { ...INICIAL, empresa: "Empresa Forjada" },
    enviado_em: null,
  });

  /* O caminho que o bloco do questionário não vê e o roteador do vinext vê:
     `%62` é `b`, e o roteador decodifica antes de casar a rota. */
  for (const idioma of IDIOMAS) {
    const resposta = await pedir(env, `${idioma.prefixo}/%62riefing?chave=${K.aberto}`, { headers: { [CABECALHO_BRIEFING]: forjado } });
    const html = await resposta.text();
    /* Prova de que o caminho chega mesmo à página do questionário (o título
       é dela): sem isto, o teste passaria à toa no dia em que o roteador
       deixasse de decodificar. */
    assert.deepEqual(titulosDe(html), [idioma.titulo], `${idioma.locale}: o desvio não chegou à página, e o teste não mede nada`);
    assert.equal(marcadorDe(html), null, `${idioma.locale}: a página desenhou o estado forjado`);
    assert.doesNotMatch(html, /Empresa Forjada/, `${idioma.locale}: o contexto forjado chegou à página`);
    assert.equal(resposta.status, 404);
  }

  /* Na rota de verdade, o estado é sempre o do painel. */
  const encerrado = await pedir(env, `/briefing?chave=${K.encerrado}`, { headers: { [CABECALHO_BRIEFING]: forjado } });
  assert.equal(encerrado.status, 410);
  assert.deepEqual(marcadorDe(await encerrado.text()), { estado: "encerrado", tela: "encerrado" });
});

/* ==========================================================================
   cabeçalhos:
   Mutações vistas falhando: `comCabecalhosDoBriefing` sem trocar a política
   para a bloqueante; a mesma função sem o `no-referrer`.
   ========================================================================== */

async function politicaDoSite(env) {
  const home = await pedir(env, "/");
  await home.text();
  return home.headers.get("content-security-policy");
}

function conferirCabecalhosDoBriefing(resposta, rotulo, politica) {
  assert.equal(resposta.headers.get("cache-control"), "private, no-store", `${rotulo}: Cache-Control`);
  assert.equal(resposta.headers.get("x-robots-tag"), "noindex, nofollow", `${rotulo}: X-Robots-Tag`);
  assert.equal(resposta.headers.get("referrer-policy"), "no-referrer", `${rotulo}: Referrer-Policy`);
  assert.equal(resposta.headers.get("content-security-policy"), politica, `${rotulo}: a política bloqueante precisa ser a MESMA lista do site`);
  assert.equal(resposta.headers.get("content-security-policy-report-only"), null, `${rotulo}: sobrou o modo relatório`);
  assert.equal(resposta.headers.get("x-vinext-cache"), null, `${rotulo}: a página passou por cache do vinext`);
  /* E os do site continuam: estes não mudam nas rotas do questionário. */
  assert.equal(resposta.headers.get("x-frame-options"), "DENY", `${rotulo}: X-Frame-Options`);
  assert.equal(resposta.headers.get("strict-transport-security"), "max-age=31536000", `${rotulo}: HSTS`);
  assert.equal(resposta.headers.get("x-content-type-options"), "nosniff", `${rotulo}: nosniff`);
}

test("cabeçalhos: página e API mandam no-store, noindex, no-referrer e a política que bloqueia, sem X-Vinext-Cache", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  const politica = await politicaDoSite(env);
  assert.ok(politica && politica.includes("default-src 'self'"), "a home deveria mandar a política em modo relatório");

  const casos = [
    ["página 200", () => pedir(env, `/briefing?chave=${K.aberto}`)],
    ["página .rsc", () => pedir(env, `/es/briefing.rsc?chave=${K.aberto}`)],
    ["página 404", () => pedir(env, `/en/briefing?chave=curta`)],
    ["página 410", () => pedir(env, `/briefing?chave=${K.vencido}`)],
    ["página 405", () => pedir(env, `/briefing?chave=${K.aberto}`, { method: "DELETE" })],
    ["api GET 200", () => api(env, "GET", { k: K.aberto })],
    ["api 403", () => api(env, "PUT", { k: K.aberto, corpo: {}, headers: { "sec-fetch-site": "cross-site" } })],
    ["api 404", () => api(env, "GET", { k: "curta" })],
    ["api 405", () => api(env, "DELETE", { k: K.aberto })],
    ["api 415", () => api(env, "PUT", { k: K.aberto, corpo: "a=1", tipo: "text/plain" })],
    ["api 410", () => api(env, "GET", { k: K.fechado })],
    ["api PUT 200", () => api(env, "PUT", { k: K.aberto, corpo: { respostas: {}, revisao_base: 0 } })],
    ["api 303", () => api(env, "POST", { k: K.aberto, corpo: "empresa.nome=Exemplo", tipo: "application/x-www-form-urlencoded" })],
  ];
  for (const [rotulo, fazer] of casos) {
    const resposta = await fazer();
    await resposta.arrayBuffer();
    conferirCabecalhosDoBriefing(resposta, rotulo, politica);
  }

  painel.falhar = "abrir";
  const fora = await calando(() => pedir(env, `/briefing?chave=${K.aberto}`));
  conferirCabecalhosDoBriefing(fora, "página 503", politica);
  const foraApi = await calando(() => api(env, "GET", { k: K.aberto }));
  conferirCabecalhosDoBriefing(foraApi, "api 503", politica);
});

test("cabeçalhos: com o questionário ligado, as seis rotas de hoje e o 404 genérico continuam como estão", async () => {
  const env = ambiente(criarPainel());
  for (const rota of ["/", "/privacidade", "/en", "/en/privacy", "/es", "/es/privacidad"]) {
    const resposta = await pedir(env, rota);
    await resposta.arrayBuffer();
    assert.equal(resposta.status, 200, `${rota}: status`);
    assert.equal(resposta.headers.get("referrer-policy"), "strict-origin-when-cross-origin", `${rota}: Referrer-Policy`);
    /* Desde 25/09/2026 a política do site inteiro bloqueia, e o modo
       relatório não volta por engano: um dos dois nomes, nunca os dois. */
    assert.ok(resposta.headers.get("content-security-policy"), `${rota}: a política do site bloqueia`);
    assert.equal(resposta.headers.get("content-security-policy-report-only"), null, `${rota}: sobrou o modo relatório`);
    assert.equal(resposta.headers.get("x-robots-tag"), null, `${rota}: X-Robots-Tag é só do questionário`);
  }
  for (const rota of ["/nao-existe", "/es/no-existe", "/briefing/x", "/api/outra"]) {
    const resposta = await pedir(env, rota);
    await resposta.arrayBuffer();
    assert.equal(resposta.status, 404, `${rota}: status`);
  }
});

/* ==========================================================================
   api:
   Mutações vistas falhando: `origemAceita` devolvendo sempre true; a checagem
   do Content-Length tirada de `lerCorpo`; a contagem do corpo sem
   Content-Length tirada (lendo tudo); o 409 trocado por 200; o `Retry-After`
   do 429 tirado.
   ========================================================================== */

test("api: GET devolve o rascunho sem `contrato` e marca a abertura", async () => {
  const painel = criarPainel();
  painel.linhas.get(K.aberto).respostas = { "empresa.nome": "Exemplo Varanda", _etapa: 2 };
  painel.linhas.get(K.aberto).revisao = 7;
  const resposta = await api(ambiente(painel), "GET", { k: K.aberto });
  assert.equal(resposta.status, 200);
  assert.match(resposta.headers.get("content-type") ?? "", /application\/json/);
  const corpo = await resposta.json();
  assert.equal(corpo.contrato, undefined, "o `contrato` é do RPC e não sai para o navegador");
  assert.deepEqual(Object.keys(corpo).sort(), ["contexto", "enviado_em", "envios", "estado", "inicial", "respostas", "revisao", "salvo_em"]);
  assert.equal(corpo.estado, "aberto");
  assert.equal(corpo.revisao, 7);
  assert.deepEqual(corpo.respostas, { "empresa.nome": "Exemplo Varanda", _etapa: 2 });
  assert.equal(corpo.contexto.pacote, "negocio");
  assert.equal(corpo.inicial.email, INICIAL.email);
  /* Só o JavaScript da página chama esta rota; é aqui que a abertura se marca. */
  assert.deepEqual(painel.chamadas.map((c) => c.opcoes), [{ marcar: true }]);
});

test("api: outro método dá 405 com Allow, sem chamar o painel", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  for (const metodo of ["DELETE", "PATCH", "HEAD", "OPTIONS"]) {
    const resposta = await api(env, metodo, { k: K.aberto });
    assert.equal(resposta.status, 405, metodo);
    assert.equal(resposta.headers.get("allow"), "GET, PUT, POST", `${metodo}: Allow`);
    if (metodo !== "HEAD") assert.deepEqual(await resposta.json(), { erro: "metodo" });
  }
  assert.equal(painel.chamadas.length, 0);
});

test("api: 403 quando a origem não é a do site; Origin null só passa com Sec-Fetch-Site same-origin", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  const corpo = { respostas: {}, revisao_base: 0 };
  const recusados = [
    ["Sec-Fetch-Site cross-site", { "sec-fetch-site": "cross-site" }],
    ["Sec-Fetch-Site same-site", { "sec-fetch-site": "same-site" }],
    ["Sec-Fetch-Site none", { "sec-fetch-site": "none" }],
    ["Origin de outro site", { origin: "https://outro-site.test", "sec-fetch-site": null }],
    ["Origin em http", { origin: "http://varanda-estudio-web.test", "sec-fetch-site": null }],
    ["Origin null sem Sec-Fetch-Site", { origin: "null", "sec-fetch-site": null }],
  ];
  for (const metodo of ["PUT", "POST"]) {
    for (const [rotulo, headers] of recusados) {
      const resposta = await api(env, metodo, { k: K.aberto, corpo, headers });
      assert.equal(resposta.status, 403, `${metodo} ${rotulo}`);
      assert.deepEqual(await resposta.json(), { erro: "origem" });
    }
  }
  assert.equal(painel.chamadas.length, 0, "pedido recusado pela origem não chega ao painel");

  /* O formulário nativo numa página com `no-referrer` manda `Origin: null`
     (medido no Chromium e no WebKit). Com Sec-Fetch-Site same-origin, passa. */
  const nativo = await api(env, "POST", {
    k: K.aberto,
    corpo: "empresa.nome=Exemplo",
    tipo: "application/x-www-form-urlencoded",
    headers: { origin: "null", "sec-fetch-site": "same-origin" },
  });
  assert.equal(nativo.status, 303);
  /* Sem nenhum dos dois cabeçalhos (cliente que não é navegador), passa: a
     chave é a credencial, e a origem é defesa a mais. */
  const semCabecalhos = await api(env, "PUT", { k: K.enviado, corpo: { respostas: {}, revisao_base: 4 }, headers: { origin: null, "sec-fetch-site": null } });
  assert.equal(semCabecalhos.status, 200);
  /* GET não confere origem: não grava nada. */
  const leitura = await api(env, "GET", { k: K.aberto, headers: { "sec-fetch-site": "cross-site", origin: "https://outro-site.test" } });
  assert.equal(leitura.status, 200);
});

test("api: 404 para chave ausente, malformada ou desconhecida", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  for (const [k, metodo] of [[undefined, "GET"], ["curta", "GET"], ["curta", "PUT"], [`${K.aberto}x`, "POST"]]) {
    const resposta = await api(env, metodo, { k, corpo: metodo === "GET" ? undefined : { respostas: {}, revisao_base: 0 } });
    assert.equal(resposta.status, 404, `${metodo} chave=${k}`);
    assert.deepEqual(await resposta.json(), { erro: "chave" });
  }
  assert.equal(painel.chamadas.length, 0);
  for (const metodo of ["GET", "PUT"]) {
    const resposta = await api(env, metodo, { k: K.desconhecida, corpo: metodo === "GET" ? undefined : { respostas: {}, revisao_base: 0 } });
    assert.equal(resposta.status, 404, `${metodo} desconhecida`);
    assert.deepEqual(await resposta.json(), { erro: "chave" });
  }
});

test("api: 415 para tipo de conteúdo fora do contrato", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  const casos = [
    ["PUT", "application/x-www-form-urlencoded", "empresa.nome=x"],
    ["PUT", "text/plain", "{}"],
    ["POST", "text/plain", "{}"],
    ["POST", "multipart/form-data; boundary=x", "--x--"],
    ["PUT", null, "{}"],
  ];
  for (const [metodo, tipo, corpo] of casos) {
    const resposta = await api(env, metodo, { k: K.aberto, corpo, tipo });
    assert.equal(resposta.status, 415, `${metodo} ${tipo}`);
    assert.deepEqual(await resposta.json(), { erro: "tipo" });
  }
  /* Com charset, continua sendo JSON. */
  const comCharset = await api(env, "PUT", { k: K.aberto, corpo: { respostas: {}, revisao_base: 0 }, tipo: "application/json; charset=utf-8" });
  assert.equal(comCharset.status, 200);
});

test("api: 413 pelo Content-Length, pelo corpo sem Content-Length e pelas respostas acima de 128 KB", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);

  /* 1. Content-Length declarado acima do teto: nem começa a ler. O corpo real
     é pequeno de propósito, para só a checagem do cabeçalho dar 413. */
  const declarado = await api(env, "PUT", { k: K.aberto, corpo: { respostas: {}, revisao_base: 0 }, headers: { "content-length": "300000" } });
  assert.equal(declarado.status, 413, "Content-Length acima de 262144");
  assert.deepEqual(await declarado.json(), { erro: "tamanho" });

  /* 2. Sem Content-Length, em pedaços: conta e para no teto. O conteúdo não é
     JSON, então sem a contagem a resposta seria 400, e não 413. */
  const pedaco = new TextEncoder().encode("a".repeat(65536));
  let enviados = 0;
  const fluxo = new ReadableStream({
    pull(controle) {
      if (enviados >= 5) return controle.close();
      enviados += 1;
      controle.enqueue(pedaco);
    },
  });
  const semTamanho = await worker.fetch(
    new Request(`${ORIGEM}/api/briefing?chave=${K.aberto}`, {
      method: "PUT",
      headers: { "content-type": "application/json", "sec-fetch-site": "same-origin" },
      body: fluxo,
      duplex: "half",
    }),
    env,
    ctx,
  );
  assert.equal(semTamanho.status, 413, "corpo em pedaços acima de 262144");
  assert.ok(enviados <= 5);
  assert.equal(painel.chamadas.length, 0, "corpo grande não chega ao painel");

  /* 3. Corpo abaixo de 256 KB, mas respostas saneadas acima de 128 KB. Cada
     "ã" é um caractere para o limite do campo e dois bytes para o painel. */
  const contexto = CONTEXTO;
  const paragrafos = PERGUNTAS.filter(
    (p) => p.tipo === "paragrafo" && (!p.pacotes || p.pacotes.includes(contexto.pacote)) && (!p.paises || p.paises.includes("BR")),
  ).slice(0, 16);
  assert.equal(paragrafos.length, 16);
  const respostas = Object.fromEntries(paragrafos.map((p) => [p.id, "ã".repeat(5000)]));
  const grande = await api(env, "PUT", { k: K.aberto, corpo: { respostas, revisao_base: 0 } });
  assert.equal(grande.status, 413, "respostas acima de 131072 bytes");
  assert.deepEqual(await grande.json(), { erro: "tamanho" });
  assert.equal(painel.chamadas.filter((c) => c.metodo === "salvar").length, 0, "o painel não recebe o que ele recusaria");

  /* 4. O painel também pode dizer tamanho. */
  const doPainel = await api(env, "PUT", { k: K.tamanho, corpo: { respostas: {}, revisao_base: 0 } });
  assert.equal(doPainel.status, 413);
});

test("api: 400 para JSON inválido, raiz que não é objeto, revisão ausente e `final` contrariando o método", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  const casos = [
    ["PUT", "{isto não é json"],
    ["PUT", "[1,2,3]"],
    ["PUT", "null"],
    ["PUT", JSON.stringify({ respostas: {} })],
    ["PUT", JSON.stringify({ respostas: {}, revisao_base: -1 })],
    ["PUT", JSON.stringify({ respostas: {}, revisao_base: "0" })],
    ["PUT", JSON.stringify({ respostas: [], revisao_base: 0 })],
    ["PUT", JSON.stringify({ respostas: {}, revisao_base: 0, final: true })],
    ["POST", JSON.stringify({ respostas: {}, revisao_base: 0, final: false })],
    ["PUT", new Uint8Array([0x7b, 0xff, 0xfe, 0x7d])],
  ];
  for (const [metodo, corpo] of casos) {
    const resposta = await api(env, metodo, { k: K.aberto, corpo });
    assert.equal(resposta.status, 400, `${metodo} ${typeof corpo === "string" ? corpo : "bytes inválidos"}`);
    assert.deepEqual(await resposta.json(), { erro: "json" });
  }
  assert.equal(painel.chamadas.filter((c) => c.metodo === "salvar").length, 0);
});

test("api: 422 para texto acima do limite e telefone inválido, sem cortar nada", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  const longo = await api(env, "PUT", { k: K.aberto, corpo: { respostas: { "empresa.nome": "x".repeat(301) }, revisao_base: 0 } });
  assert.equal(longo.status, 422);
  assert.deepEqual(await longo.json(), { erro: "longo", campo: "empresa.nome" });

  const telefone = await api(env, "PUT", { k: K.aberto, corpo: { respostas: { "contato.whatsapp": "12" }, revisao_base: 0 } });
  assert.equal(telefone.status, 422);
  assert.deepEqual(await telefone.json(), { erro: "telefone", campo: "contato.whatsapp" });

  assert.equal(painel.chamadas.filter((c) => c.metodo === "salvar").length, 0, "nada é gravado cortado");
});

test("api: PUT grava rascunho e POST envia, com a resposta saneada e a leitura completa", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  const respostas = {
    "empresa.nome": "  Exemplo Varanda  ",
    "empresa.como_compra": ["vem", "orcamento", "inventada"],
    "chave.que.nao.existe": "some",
    _etapa: 3,
  };
  const put = await api(env, "PUT", { k: K.aberto, corpo: { respostas, revisao_base: 0 } });
  assert.equal(put.status, 200);
  const corpoPut = await put.json();
  assert.equal(corpoPut.ok, true);
  assert.equal(corpoPut.revisao, 1);

  const post = await api(env, "POST", { k: K.aberto, corpo: { respostas, revisao_base: 1, final: true }, idioma: "en" });
  assert.equal(post.status, 200);
  assert.equal((await post.json()).envios, 1);

  const [rascunho, envio] = painel.chamadas.filter((c) => c.metodo === "salvar").map((c) => c.dados);
  assert.equal(rascunho.final, false, "PUT nunca envia");
  assert.equal(envio.final, true, "POST sempre envia");
  for (const dados of [rascunho, envio]) {
    assert.equal(dados.versao, VERSAO);
    assert.equal(dados.respostas["empresa.nome"], "Exemplo Varanda");
    assert.deepEqual(dados.respostas["empresa.como_compra"], ["vem", "orcamento"]);
    assert.equal(dados.respostas["chave.que.nao.existe"], undefined, "chave fora do esquema não passa");
    assert.equal(dados.respostas._etapa, 3);
    assert.deepEqual(dados.leitura.itens.map((i) => i.id), PERGUNTAS.map((p) => p.id), "a leitura leva todas as perguntas, na ordem");
  }
  assert.equal(rascunho.revisao_base, 0);
  assert.equal(envio.revisao_base, 1);
  /* O idioma da leitura é o da página (`?idioma=`), e sem ele, o do link. */
  assert.equal(rascunho.leitura.locale, "pt");
  assert.equal(envio.leitura.locale, "en");
});

test("api: 409 no conflito, com a versão do servidor para o navegador juntar", async () => {
  const painel = criarPainel();
  painel.linhas.get(K.aberto).revisao = 5;
  painel.linhas.get(K.aberto).respostas = { "empresa.nome": "Gravado no outro aparelho" };
  const resposta = await api(ambiente(painel), "PUT", { k: K.aberto, corpo: { respostas: { "empresa.nome": "Daqui" }, revisao_base: 4 } });
  assert.equal(resposta.status, 409);
  assert.deepEqual(await resposta.json(), { erro: "conflito", revisao: 5, respostas: { "empresa.nome": "Gravado no outro aparelho" } });
});

test("api: 410 para encerrado, vencido e fechado", async () => {
  const env = ambiente(criarPainel());
  for (const estado of ["encerrado", "vencido", "fechado"]) {
    for (const metodo of ["GET", "PUT", "POST"]) {
      const resposta = await api(env, metodo, { k: K[estado], corpo: metodo === "GET" ? undefined : { respostas: {}, revisao_base: 0 } });
      assert.equal(resposta.status, 410, `${metodo} ${estado}`);
      assert.deepEqual(await resposta.json(), { erro: estado });
    }
  }
});

test("api: 429 com Retry-After quando o painel limita as gravações", async () => {
  const resposta = await api(ambiente(criarPainel()), "PUT", { k: K.limite, corpo: { respostas: {}, revisao_base: 0 } });
  assert.equal(resposta.status, 429);
  assert.equal(resposta.headers.get("retry-after"), "120");
  assert.deepEqual(await resposta.json(), { erro: "limite" });
});

test("api: 503 com Retry-After quando o painel cai, responde fora do contrato ou falta o binding", async () => {
  for (const caso of ["abrir", "salvar", "contrato", "sem binding"]) {
    const painel = criarPainel();
    const env = ambiente(painel);
    if (caso === "sem binding") delete env.BRIEFING;
    else painel.falhar = caso;
    const metodos = caso === "salvar" ? ["PUT", "POST"] : ["GET", "PUT", "POST"];
    for (const metodo of metodos) {
      const resposta = await calando(() => api(env, metodo, { k: K.aberto, corpo: metodo === "GET" ? undefined : { respostas: {}, revisao_base: 0 } }));
      assert.equal(resposta.status, 503, `${caso} ${metodo}`);
      assert.equal(resposta.headers.get("retry-after"), "300", `${caso} ${metodo}: Retry-After`);
      assert.deepEqual(await resposta.json(), { erro: "indisponivel" });
    }
  }
});

/* ==========================================================================
   sem JavaScript:
   Mutações vistas falhando: `juntar` trocado pelo que chegou no POST (o campo
   em branco apagou o salvo); o `continue` do conflito tirado; a leitura
   montada sobre o que chegou em vez do que foi juntado.
   ========================================================================== */

const FORM = "application/x-www-form-urlencoded";
const NATIVO = { origin: "null", "sec-fetch-site": "same-origin" };

test("sem JavaScript: múltipla repetida, campo vazio que não apaga, envio final e 303 para a página do idioma", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  painel.linhas.get(K.aberto).respostas = { "empresa.nome": "Exemplo Varanda", "empresa.desde": "1998", _etapa: 4 };
  painel.linhas.get(K.aberto).revisao = 3;

  const corpo = new URLSearchParams();
  corpo.append("empresa.como_compra", "vem");
  corpo.append("empresa.como_compra", "entrega");
  corpo.append("empresa.nome", "");
  corpo.append("empresa.desde", "   ");
  corpo.append("empresa.o_que_faz", "Usinagem de peças sob desenho.");
  corpo.append("_conferido", "1");

  const resposta = await api(env, "POST", { k: K.aberto, corpo: corpo.toString(), tipo: FORM, headers: NATIVO, idioma: "es" });
  assert.equal(resposta.status, 303);
  assert.equal(resposta.headers.get("location"), `/es/briefing?chave=${K.aberto}&enviado=1`);

  const salvos = painel.chamadas.filter((c) => c.metodo === "salvar");
  assert.equal(salvos.length, 1);
  const { dados } = salvos[0];
  assert.equal(dados.final, true, "o formulário nativo sempre envia");
  assert.equal(dados.revisao_base, 3, "a revisão vem do rascunho que o Worker abriu");
  assert.deepEqual(dados.respostas["empresa.como_compra"], ["vem", "entrega"], "múltipla repetida perdeu valor");
  assert.equal(dados.respostas["empresa.nome"], "Exemplo Varanda", "campo em branco apagou o que estava salvo");
  assert.equal(dados.respostas["empresa.desde"], "1998", "campo só com espaço apagou o que estava salvo");
  assert.equal(dados.respostas["empresa.o_que_faz"], "Usinagem de peças sob desenho.");
  assert.equal(dados.respostas._etapa, 4);
  assert.equal(dados.respostas._conferido, true);

  /* E a volta: a página do 303 mostra o recebido, porque o envio é de agora. */
  const pagina = await pedir(env, resposta.headers.get("location"));
  assert.equal(pagina.status, 200);
  assert.deepEqual(marcadorDe(await pagina.text()), { estado: "enviado", tela: "recebido" });
});

test("sem JavaScript: a leitura enviada tem todas as perguntas, montada sobre o rascunho juntado", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  painel.linhas.get(K.aberto).respostas = { "empresa.nome": "Exemplo Varanda" };
  const resposta = await api(env, "POST", { k: K.aberto, corpo: "objetivo.servir=orcamento&objetivo.servir=google", tipo: FORM, headers: NATIVO });
  assert.equal(resposta.status, 303);
  assert.equal(resposta.headers.get("location"), `/briefing?chave=${K.aberto}&enviado=1`, "sem ?idioma=, volta para o idioma do link");

  const { leitura } = painel.chamadas.find((c) => c.metodo === "salvar").dados;
  assert.equal(leitura.versao, VERSAO);
  assert.equal(leitura.locale, "pt");
  assert.equal(leitura.itens.length, PERGUNTAS.length);
  assert.deepEqual(leitura.itens.map((i) => i.id), PERGUNTAS.map((p) => p.id));
  const item = (id) => leitura.itens.find((i) => i.id === id);
  assert.equal(item("empresa.nome").valor, "Exemplo Varanda", "a leitura ignorou o rascunho");
  assert.deepEqual(item("objetivo.servir").valor, ["orcamento", "google"]);
});

test("sem JavaScript: se outro aparelho grava no meio, junta de novo sobre a versão nova", async () => {
  const painel = criarPainel();
  const env = ambiente(painel);
  painel.antesDeSalvar = (l) => {
    l.revisao = 9;
    l.respostas = { "empresa.desde": "2001" };
  };
  const resposta = await api(env, "POST", { k: K.aberto, corpo: "empresa.nome=Exemplo%20Varanda", tipo: FORM, headers: NATIVO });
  assert.equal(resposta.status, 303);
  const salvos = painel.chamadas.filter((c) => c.metodo === "salvar").map((c) => c.dados);
  assert.equal(salvos.length, 2, "a primeira tentativa bate no conflito e a segunda grava");
  assert.equal(salvos[1].revisao_base, 9);
  assert.equal(salvos[1].respostas["empresa.desde"], "2001", "o que o outro aparelho gravou sumiu");
  assert.equal(salvos[1].respostas["empresa.nome"], "Exemplo Varanda");
  assert.equal(painel.linhas.get(K.aberto).estado, "enviado");
});

test("sem JavaScript: os erros seguem o mesmo contrato da API", async () => {
  const env = ambiente(criarPainel());
  const longo = await api(env, "POST", { k: K.aberto, corpo: `empresa.nome=${"x".repeat(301)}`, tipo: FORM, headers: NATIVO });
  assert.equal(longo.status, 422);
  assert.deepEqual(await longo.json(), { erro: "longo", campo: "empresa.nome" });
  const fechado = await api(env, "POST", { k: K.fechado, corpo: "empresa.nome=x", tipo: FORM, headers: NATIVO });
  assert.equal(fechado.status, 410);
});

/* ==========================================================================
   log:
   Mutações vistas falhando: `mensagemSegura` sem apagar a chave; o
   `console.error` do abrir recebendo o erro inteiro.
   ========================================================================== */

test("log: nenhum console.error recebe a chave nem o corpo", async () => {
  const registrados = [];
  const original = console.error;
  console.error = (...args) => registrados.push(args.map((a) => (a instanceof Error ? `${a.name} ${a.message} ${a.stack}` : typeof a === "string" ? a : JSON.stringify(a))).join(" "));
  const MARCADOR = "MARCADOR-DO-CORPO-QUE-NAO-PODE-IR-PARA-O-LOG";
  try {
    for (const falha of ["abrir", "salvar", "contrato"]) {
      const painel = criarPainel();
      painel.falhar = falha;
      const env = ambiente(painel);
      await (await pedir(env, `/briefing?chave=${K.aberto}`)).arrayBuffer();
      await (await api(env, "GET", { k: K.aberto })).arrayBuffer();
      await (await api(env, "PUT", { k: K.aberto, corpo: { respostas: { "empresa.nome": MARCADOR }, revisao_base: 0 } })).arrayBuffer();
      await (await api(env, "POST", { k: K.aberto, corpo: `empresa.nome=${MARCADOR}`, tipo: FORM, headers: NATIVO })).arrayBuffer();
      await (await api(env, "PUT", { k: K.aberto, corpo: `{"x": "${MARCADOR}"` })).arrayBuffer();
    }
    const env = ambiente(criarPainel());
    delete env.BRIEFING;
    await (await pedir(env, `/es/briefing?chave=${K.enviado}`)).arrayBuffer();
  } finally {
    console.error = original;
  }

  /* Sem isto o teste passaria sem ninguém ter registrado nada. */
  assert.ok(registrados.some((r) => r.includes("briefing: abrir falhou")), "o log do abrir sumiu");
  assert.ok(registrados.some((r) => r.includes("briefing: salvar falhou")), "o log do salvar sumiu");
  for (const registro of registrados) {
    for (const k of Object.values(K)) assert.ok(!registro.includes(k), `a chave foi para o log: ${registro.slice(0, 120)}`);
    assert.ok(!registro.includes(MARCADOR), `o corpo foi para o log: ${registro.slice(0, 120)}`);
  }
});

/* ==========================================================================
   fonte:
   Mutações vistas falhando: `export const revalidate = 60` na rota em
   inglês; `import "cloudflare:workers"` num arquivo de `app/`; `vars` com
   "1" no `wrangler.jsonc`.
   ========================================================================== */

async function arquivosDe(pasta) {
  const saida = [];
  for (const item of await readdir(pasta, { withFileTypes: true })) {
    const url = new URL(`${item.name}${item.isDirectory() ? "/" : ""}`, pasta);
    if (item.isDirectory()) saida.push(...(await arquivosDe(url)));
    else if (/\.(m?[jt]sx?)$/.test(item.name)) saida.push(url);
  }
  return saida;
}

/* Código sem comentário: os comentários destes arquivos citam justamente o
   que é proibido, para explicar por quê. */
async function codigoDe(url) {
  const texto = await readFile(url, "utf8");
  return texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

test("fonte: nenhum arquivo de app/ importa cloudflare:workers, e as rotas do questionário não têm cache", async () => {
  /* O Node recusa o esquema `cloudflare:`, e estes testes importam o build no
     Node: um import desses em `app/` derruba a suíte inteira. */
  const arquivos = await arquivosDe(new URL("../app/", import.meta.url));
  assert.ok(arquivos.length > 50, "a varredura de app/ não achou os arquivos");
  for (const url of arquivos) {
    assert.doesNotMatch(await codigoDe(url), /(?:from|import)\s*\(?\s*["']cloudflare:workers["']/, `${url.pathname} importa cloudflare:workers`);
  }
  /* `revalidate` ou `force-static` guardariam a tela de um cliente e a
     serviriam a outro. `headers()` já marca a rota como dinâmica; isto impede
     que alguém desfaça. */
  for (const caminho of ["../app/(pt)/briefing/page.tsx", "../app/(es)/es/briefing/page.tsx", "../app/(en)/en/briefing/page.tsx", "../app/briefing/pagina.tsx"]) {
    assert.doesNotMatch(await codigoDe(new URL(caminho, import.meta.url)), /export\s+const\s+(revalidate|dynamic|fetchCache)\b/, `${caminho} declara cache`);
  }
});

test("fonte: o build liga o binding do painel e nasce com o questionário desligado", async () => {
  /* Lido do `wrangler.json` que o build gera, que é o que o deploy manda.
     O segundo commit da publicação (ESPEC 8, passo 4) troca "0" por "1" e
     muda esta linha junto, de propósito: virar "1" nunca é por acidente. */
  const gerado = JSON.parse(await readFile(new URL("../dist/server/wrangler.json", import.meta.url), "utf8"));
  assert.deepEqual(gerado.services, [{ binding: "BRIEFING", service: "painel-varanda", entrypoint: "BriefingPublico" }]);
  assert.equal(gerado.vars?.BRIEFING_ATIVO, "0");
});
