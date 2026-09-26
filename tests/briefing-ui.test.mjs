import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

/**
 * A TELA DO QUESTIONÁRIO DE PROJETO, no HTML que o servidor entrega.
 *
 * Como `briefing-api.test.mjs`, importa o Worker compilado
 * (`dist/server/index.js`) e chama `fetch` com um painel falso em memória.
 * Aqui o que se confere é o HTML da página, que é o que funciona SEM
 * JavaScript e o que a prévia de link do WhatsApp busca. O comportamento com
 * JavaScript (gravação, conflito, foco) é conferido no navegador de verdade, e
 * não cabe num teste de Node.
 *
 * **O que o servidor mostra, e é isto que os testes cobram:**
 *
 * - As perguntas que EXISTEM para o link, e só elas. Pacote e país são
 *   decididos pelo painel ao gerar o link; pergunta ou opção de outro pacote
 *   ou país não é desenhada nem sem JavaScript. A régua é a do núcleo
 *   (`chavesAceitas` e `opcoesDisponiveis`), a mesma do `sanear` do Worker.
 * - As condicionais TODAS, com "(se respondeu X)": sem JavaScript não há como
 *   esconder uma pergunta conforme a resposta de outra.
 * - Nenhum valor do rascunho nem do cadastro (`inicial`): os dois chegam
 *   pelo `GET` da API, que só o JavaScript faz, e assim e-mail, telefone e
 *   nome de quem recebeu o link não ficam no HTML. As marcas que nascem
 *   feitas são a opção travada do Profissional e, desde 26/09/2026, o
 *   pré-preenchimento que sai do CONTEXTO do link (o nome da empresa e os
 *   idiomas do site), só nas perguntas que o rascunho não tem: com a chave
 *   no rascunho o campo nasce vazio, que no envio sem JavaScript quer dizer
 *   "não mexi", e o valor do contexto nunca vai por cima do que o cliente
 *   corrigiu. O caso do nome é conferido em `briefing-api.test.mjs`.
 *
 * **Todo teste daqui foi visto falhando** com o código quebrado de propósito
 * (regra 9.32). A mutação de cada grupo está no comentário dele.
 *
 * Os nomes começam pelo grupo ("formulário:", "contexto:", "valores:",
 * "texto:", "pacote:", "telas:") para a falha dizer qual contrato quebrou.
 */

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-briefing-ui`);
const { default: worker } = await import(workerUrl.href);

const importar = (caminho) => import(new URL(caminho, import.meta.url).href);
const { PERGUNTAS, chavesAceitas, estimarMinutos, normalizarContexto, opcoesDisponiveis, opcoesTravadas, perguntaPorId } = await importar(
  "../app/briefing/nucleo.ts",
);
const { TEXTOS } = await importar("../app/briefing/textos.ts");
const DICIONARIOS = {
  pt: (await importar("../app/i18n/pt.ts")).default,
  es: (await importar("../app/i18n/es.ts")).default,
  en: (await importar("../app/i18n/en.ts")).default,
};

const ORIGEM = "https://varanda-estudio-web.test";
const ctx = { waitUntil() {}, passThroughOnException() {} };
const chave = (nome) => `${nome}${"_".repeat(22)}`.slice(0, 22);

/* O cadastro do cliente no painel. Valores que não aparecem em lugar nenhum
   do questionário, para a busca por eles no HTML não achar exemplo por
   coincidência. */
const INICIAL = {
  empresa: "Empresa Teste Ltda",
  responsavel: "Fulana Cadastrada",
  email: "cadastro@exemplo.test",
  telefone: "11 97777-1234",
  cnpj: "12.345.678/0001-90",
  instagram: "@perfilinventado",
  site: "https://site-inventado.test",
  cidade: "Cidade Inventada",
};

/* Um link por pacote e país, e os estados que não são formulário. */
const LINKS = {
  essencialBR: { idioma: "pt", pais: "BR", pacote: "essencial", capacidade: null, paginas: null, idiomas_site: ["pt_br"] },
  negocioBR: { idioma: "pt", pais: "BR", pacote: "negocio", capacidade: null, paginas: 6, idiomas_site: ["pt_br"] },
  profissionalBR: { idioma: "pt", pais: "BR", pacote: "profissional", capacidade: "catalogo", paginas: 8, idiomas_site: ["pt_br"] },
  essencialES: { idioma: "es", pais: "ES", pacote: "essencial", capacidade: null, paginas: null, idiomas_site: ["es"] },
  negocioES: { idioma: "es", pais: "ES", pacote: "negocio", capacidade: null, paginas: 6, idiomas_site: ["es", "ca"] },
  profissionalES: { idioma: "es", pais: "ES", pacote: "profissional", capacidade: "outro_idioma", paginas: 6, idiomas_site: ["es", "en"] },
  negocioUS: { idioma: "en", pais: "US", pacote: "negocio", capacidade: null, paginas: 5, idiomas_site: ["en"] },
  profissionalUS: { idioma: "en", pais: "US", pacote: "profissional", capacidade: "integracao", paginas: null, idiomas_site: ["en"] },
};

function sqlite(data = new Date()) {
  return data.toISOString().slice(0, 19).replace("T", " ");
}

function contextoDo(nome) {
  const c = LINKS[nome] ?? LINKS.negocioBR;
  return { ...c, moeda: c.pais === "BR" ? "BRL" : c.pais === "ES" ? "EUR" : "USD", empresa: "Empresa Teste Ltda", primeiro_nome: "Fulana" };
}

function criarPainel() {
  const linhas = new Map(Object.keys(LINKS).map((nome) => [chave(nome), { estado: "aberto", contexto: contextoDo(nome), enviado_em: null, envios: 0 }]));
  linhas.set(chave("semnome"), { estado: "aberto", contexto: { ...contextoDo("negocioBR"), primeiro_nome: null, empresa: null }, enviado_em: null, envios: 0 });
  linhas.set(chave("enviado"), { estado: "enviado", contexto: contextoDo("negocioBR"), enviado_em: sqlite(), envios: 1 });
  linhas.set(chave("fechado"), { estado: "fechado", contexto: contextoDo("negocioBR") });
  linhas.set(chave("encerrado"), { estado: "encerrado" });
  linhas.set(chave("vencido"), { estado: "vencido" });
  return {
    falhar: false,
    async abrir(token) {
      if (this.falhar) throw new Error("painel fora do ar");
      const l = linhas.get(token);
      if (!l) return { contrato: 1, estado: "invalido" };
      if (l.estado === "encerrado" || l.estado === "vencido") return { contrato: 1, estado: l.estado };
      if (l.estado === "fechado") return { contrato: 1, estado: "fechado", contexto: { ...l.contexto } };
      return {
        contrato: 1,
        estado: l.estado,
        contexto: { ...l.contexto },
        inicial: { ...INICIAL },
        /* Um rascunho com resposta: a página não pode desenhá-lo. */
        respostas: { "empresa.nome": "Rascunho Salvo", "aprovacao.responsavel": "Rascunho Aprova", _etapa: 3 },
        revisao: 2,
        salvo_em: sqlite(),
        enviado_em: l.enviado_em,
        envios: l.envios,
      };
    },
    async salvar() {
      return { ok: false, motivo: "invalido" };
    },
  };
}

const painel = criarPainel();
const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) }, BRIEFING: painel, BRIEFING_ATIVO: "1" };

function caminho(locale) {
  return locale === "pt" ? "/briefing" : `/${locale}/briefing`;
}

async function pagina(nome, locale = LINKS[nome]?.idioma ?? "pt", extra = "") {
  const resposta = await worker.fetch(new Request(`${ORIGEM}${caminho(locale)}?chave=${chave(nome)}${extra}`, { headers: { accept: "text/html" } }), env, ctx);
  return { status: resposta.status, html: await resposta.text() };
}

/* ---------- Leitura do HTML, sem dependência ---------- */

/* O payload do RSC repete a marcação dentro de <script> (regra 9.2): tudo o
   que é sobre o DOCUMENTO se lê com os scripts fora. */
const semScripts = (html) => html.replace(/<script\b[\s\S]*?<\/script>/g, "");

function decodificar(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function atributos(tag) {
  const saida = {};
  for (const m of tag.matchAll(/\s([^\s=/>]+)(?:="([^"]*)")?/g)) saida[m[1].toLowerCase()] = m[2] === undefined ? "" : decodificar(m[2]);
  return saida;
}

function tags(html, nome) {
  return [...semScripts(html).matchAll(new RegExp(`<${nome}\\b[^>]*>`, "g"))].map((m) => ({ tag: m[0], at: atributos(m[0]), pos: m.index }));
}

/* O texto como se lê: blocos viram quebra de linha, o resto some sem espaço
   (um <a> no meio da frase não pode partir a frase). */
function textoVisivel(html) {
  return decodificar(
    semScripts(html)
      .replace(/<(style|template)\b[\s\S]*?<\/\1>/g, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<\/(p|div|li|h1|h2|h3|legend|label|dt|dd|section|header|summary|button|fieldset|ul|dl)>/g, "\n")
      .replace(/<[^>]+>/g, ""),
  );
}

/** O `<form>` do questionário: a tag e o miolo. */
function formulario(html) {
  const limpo = semScripts(html);
  const inicio = limpo.indexOf("<form");
  const fim = limpo.indexOf("</form>", inicio);
  assert.ok(inicio >= 0 && fim > inicio, "a página não tem <form>");
  return { tag: atributos(limpo.slice(inicio, limpo.indexOf(">", inicio) + 1)), miolo: limpo.slice(inicio, fim) };
}

function campos(miolo) {
  return [...miolo.matchAll(/<(input|textarea|select|button)\b[^>]*>/g)].map((m) => ({ tipo: m[1], at: atributos(m[0]), pos: m.index }));
}

/* ---------- formulário ---------- */
/* Mutações que derrubaram este grupo: tirar `name={p.id}` do campo de texto
   (M1: os nomes deixam de bater com as chaves), trocar `enderecoDaApi` por
   `enderecoDaPagina` no `action` (M2), e tirar o botão de envio desligado que
   vem primeiro (M3: Enter num campo mandaria o questionário pela metade). */

test("formulário: form nativo com POST para a API do idioma da página", async () => {
  for (const [nome, locale] of [
    ["negocioBR", "pt"],
    ["negocioES", "es"],
    ["negocioUS", "en"],
    ["negocioBR", "en"],
  ]) {
    const { status, html } = await pagina(nome, locale);
    assert.equal(status, 200);
    const { tag } = formulario(html);
    assert.equal(tag.method, "post", `${nome}/${locale}: método`);
    assert.equal(tag.action, `/api/briefing?chave=${chave(nome)}&idioma=${locale}`, `${nome}/${locale}: action`);
    assert.equal(tags(html, "form").length, 1, "um formulário só");
  }
});

test("formulário: cada campo tem `name` igual ao id da pergunta, e juntos são exatamente as chaves do link", async () => {
  for (const nome of Object.keys(LINKS)) {
    const { html } = await pagina(nome);
    const c = normalizarContexto(contextoDo(nome));
    const obsoletas = new Set(PERGUNTAS.filter((p) => p.obsoleta).map((p) => p.id));
    const esperadas = chavesAceitas(c).filter((k) => k !== "_etapa" && !obsoletas.has(k) && !obsoletas.has(k.split(".").slice(0, 2).join(".")));
    const nomes = new Set(campos(formulario(html).miolo).map((x) => x.at.name).filter(Boolean));
    assert.deepEqual([...nomes].sort(), [...esperadas].sort(), `${nome}: os names do form`);
  }
});

test("formulário: escolha é fieldset com legend, com checkbox ou radio de verdade e as opções do link", async () => {
  for (const nome of ["negocioBR", "profissionalES", "profissionalUS"]) {
    const { html } = await pagina(nome);
    const c = normalizarContexto(contextoDo(nome));
    const { miolo } = formulario(html);
    const conjuntos = [...miolo.matchAll(/<fieldset\b[^>]*>([\s\S]*?)<\/fieldset>/g)];
    const escolhas = PERGUNTAS.filter((p) => (p.tipo === "unica" || p.tipo === "multipla") && chavesAceitas(c).includes(p.id));
    for (const p of escolhas) {
      const conjunto = conjuntos.find((m) => m[1].includes(`name="${p.id}"`));
      assert.ok(conjunto, `${nome}: ${p.id} fora de fieldset`);
      assert.match(conjunto[1], /<legend\b/, `${nome}: ${p.id} sem legend`);
      const opcoes = campos(conjunto[1]).filter((x) => x.at.name === p.id);
      const tipo = p.tipo === "multipla" ? "checkbox" : "radio";
      assert.ok(opcoes.every((x) => x.at.type === tipo), `${nome}: ${p.id} deveria ser ${tipo}`);
      assert.deepEqual(
        opcoes.map((x) => x.at.value),
        opcoesDisponiveis(p, c).map((o) => o.id),
        `${nome}: opções de ${p.id}`,
      );
    }
  }
});

test("formulário: todo campo tem rótulo, e o primeiro botão de envio é o desligado", async () => {
  const { html } = await pagina("negocioBR");
  const { miolo } = formulario(html);
  const rotulos = new Set(tags(miolo, "label").map((l) => l.at.for).filter(Boolean));
  const todos = campos(miolo);
  for (const x of todos.filter((x) => x.tipo !== "button" && x.at.name !== "_conferido")) {
    assert.ok(x.at.id, `campo sem id: ${x.at.name}`);
    assert.ok(rotulos.has(x.at.id), `campo sem <label for>: ${x.at.name}`);
  }
  /* A caixa do Revisar é o rótulo que envolve a caixa, como a do contato. */
  assert.ok(/<label class="consentimento"><input[^>]*name="_conferido"/.test(miolo), "a caixa _conferido fora do rótulo");
  const envios = todos.filter((x) => x.tipo === "button" && x.at.type === "submit");
  assert.ok(envios.length >= 2, "o desligado e o de enviar");
  assert.ok("disabled" in envios[0].at && "hidden" in envios[0].at, "Enter num campo aciona o PRIMEIRO botão de envio, e ele tem que ser o desligado");
  assert.ok(!("disabled" in envios.at(-1).at), "o botão de enviar não nasce desligado sem JavaScript");
});

test("formulário: sem JavaScript o navegador confere formato, e com ele o formulário confere sozinho", async () => {
  const { html } = await pagina("negocioBR");
  const { tag, miolo } = formulario(html);
  /* `novalidate` só entra na hidratação. */
  assert.ok(!("novalidate" in tag), "o HTML do servidor não pode ter novalidate");
  const todos = campos(miolo);
  const por = (id) => todos.find((x) => x.at.name === id);
  assert.equal(por("contato.email").at.type, "email");
  assert.equal(por("prazo.data").at.type, "date");
  assert.equal(por("contato.whatsapp").at.type, "tel");
  for (const id of ["contato.whatsapp", "oferta.lista_link"]) {
    const campo = por(id);
    assert.ok(campo.at.pattern, `${id} sem pattern`);
    /* O navegador compila o pattern com a flag v; padrão inválido é ignorado em silêncio. */
    assert.doesNotThrow(() => new RegExp(`^(?:${campo.at.pattern})$`, "v"), `${id}: pattern inválido`);
  }
  const tel = new RegExp(`^(?:${por("contato.whatsapp").at.pattern})$`, "v");
  assert.ok(tel.test("(11) 91234-5678") && tel.test("+55 11 91234-5678"), "telefone certo passa");
  assert.ok(!tel.test("91234-5678"), "sem DDD é barrado antes de ir ao servidor");
  const url = new RegExp(`^(?:${por("oferta.lista_link").at.pattern})$`, "v");
  assert.ok(url.test("meusite.com.br/cardapio") && url.test("https://exemplo.test/a?b=1"), "endereço certo passa");
  assert.ok(!url.test("javascript:alert(1)") && !url.test("meu site.com"), "esquema estranho e espaço são barrados");
  for (const x of todos) if (x.at.maxlength) assert.ok(Number(x.at.maxlength) > 0);
  assert.ok(todos.filter((x) => x.tipo === "textarea").every((x) => Number(x.at.maxlength) === 5000), "parágrafo com maxlength");
  assert.ok(!todos.some((x) => "required" in x.at), "sem required: campo em branco sem JavaScript quer dizer 'não mexi'");
});

/* ---------- contexto ---------- */
/* Mutação que derrubou este grupo: desenhar `etapa.perguntas` sem o filtro
   `existentes.has(p.id)` (M4: aparecem registro da Espanha no Brasil e
   pergunta do Negócio no Essencial). */

test("contexto: nenhuma pergunta nem opção de outro pacote ou país aparece no servidor", async () => {
  const casos = [
    { nome: "essencialBR", nunca: ["objetivo.sucesso", "publico.concorrentes", "funcoes.extras", "prazo.essencial", "empresa.registro", "empresa.domicilio", "oferta.imposto"] },
    { nome: "negocioBR", nunca: ["empresa.registro", "empresa.domicilio", "oferta.imposto"], sempre: ["objetivo.sucesso", "funcoes.extras"] },
    { nome: "essencialES", nunca: ["objetivo.sucesso", "funcoes.extras"], sempre: ["empresa.registro", "empresa.domicilio", "oferta.imposto"] },
    { nome: "negocioUS", nunca: ["empresa.registro"], sempre: ["empresa.domicilio", "oferta.imposto"] },
  ];
  for (const { nome, nunca = [], sempre = [] } of casos) {
    const { html } = await pagina(nome);
    const nomes = new Set(campos(formulario(html).miolo).map((x) => x.at.name));
    for (const id of nunca) assert.ok(!nomes.has(id), `${nome}: ${id} não existe para este link`);
    for (const id of sempre) assert.ok(nomes.has(id), `${nome}: ${id} existe para este link`);
  }
  /* Opção por país: Pix só no Brasil, Bizum só na Espanha; horário da conversa com a hora de lá. */
  const opcoes = async (nome, id) =>
    campos(formulario((await pagina(nome)).html).miolo)
      .filter((x) => x.at.name === id)
      .map((x) => x.at.value);
  assert.ok((await opcoes("negocioBR", "local.pagamento")).includes("pix"));
  assert.ok(!(await opcoes("negocioBR", "local.pagamento")).includes("bizum"));
  assert.ok((await opcoes("negocioES", "local.pagamento")).includes("bizum"));
  assert.ok(!(await opcoes("negocioES", "local.pagamento")).includes("pix"));
  assert.ok((await opcoes("negocioES", "final.conversa")).includes("es_12_14"));
  assert.ok(!(await opcoes("negocioBR", "final.conversa")).includes("es_12_14"));
  /* "Outro idioma" como extra só existe no Profissional. */
  assert.ok(!(await opcoes("negocioBR", "funcoes.extras")).includes("idioma"));
  assert.ok((await opcoes("profissionalES", "funcoes.extras")).includes("idioma"));
});

test("contexto: as condicionais aparecem todas, com a condição escrita para quem está sem JavaScript", async () => {
  const { html } = await pagina("negocioBR");
  const texto = textoVisivel(html);
  assert.match(texto, /Endereço como deve aparecer\.[^\n]*\(se respondeu “Sim”\)/, "a condição escrita ao lado da condicional");
  /* A marca da condição é escondida com JavaScript pela classe. */
  const semComentarios = semScripts(html).replace(/<!--[\s\S]*?-->/g, "");
  assert.ok(/<span class="bf-condicao bf-sem-js"> \(se respondeu/.test(semComentarios), "a condição sem a classe bf-sem-js");
  const { html: es } = await pagina("negocioES");
  assert.match(textoVisivel(es), /\(si has respondido «/, "a condição em espanhol");
});

/* Desde 26/09/2026 os idiomas do site nascem marcados também (o rascunho
   deste painel falso não os tem), e continuam sendo as duas únicas marcas. */
test("contexto: no Profissional a capacidade combinada nasce marcada e travada, e só ela e os idiomas do contexto nascem marcados", async () => {
  for (const nome of ["profissionalBR", "profissionalES", "profissionalUS"]) {
    const { html } = await pagina(nome);
    const c = normalizarContexto(contextoDo(nome));
    const travada = opcoesTravadas(perguntaPorId("funcoes.extras"), c);
    assert.equal(travada.length, 1, `${nome}: uma capacidade travada`);
    const marcados = campos(formulario(html).miolo).filter((x) => "checked" in x.at);
    const idiomas = opcoesDisponiveis(perguntaPorId("conteudo.idiomas"), c)
      .map((o) => o.id)
      .filter((id) => c.idiomas_site.includes(id));
    assert.ok(idiomas.length > 0, `${nome}: o link não tem idioma para marcar`);
    assert.deepEqual(
      marcados.map((x) => `${x.at.name}=${x.at.value}`).sort(),
      [`funcoes.extras=${travada[0]}`, ...idiomas.map((id) => `conteudo.idiomas=${id}`)].sort(),
      `${nome}: só a capacidade e os idiomas do link vêm marcados`,
    );
    const capacidade = marcados.find((x) => x.at.name === "funcoes.extras");
    assert.ok("disabled" in capacidade.at, `${nome}: a capacidade vem travada`);
    assert.ok(marcados.filter((x) => x.at.name === "conteudo.idiomas").every((x) => !("disabled" in x.at)), `${nome}: os idiomas vêm travados`);
  }
});

/* ---------- valores ---------- */
/* Mutação que derrubou este grupo: passar `dados.inicial` do servidor para o
   formulário e pré-preencher no render, inclusive `aprovacao.responsavel`
   (M5). */

test("valores: o servidor não desenha rascunho nem cadastro, e `aprovacao.responsavel` nasce sem valor", async () => {
  for (const nome of ["negocioBR", "profissionalES", "negocioUS"]) {
    const { html } = await pagina(nome);
    const todos = campos(formulario(html).miolo);
    const aprova = todos.find((x) => x.at.name === "aprovacao.responsavel");
    assert.ok(aprova, `${nome}: a pergunta de quem aprova existe`);
    assert.ok(!aprova.at.value, `${nome}: aprovacao.responsavel com valor "${aprova.at.value}"`);
    for (const x of todos) {
      if (x.tipo === "textarea" || x.tipo === "button" || ["checkbox", "radio"].includes(x.at.type)) continue;
      assert.ok(!x.at.value, `${nome}: ${x.at.name} nasce com valor "${x.at.value}"`);
    }
    assert.ok(!/<textarea\b[^>]*>[^<]/.test(formulario(html).miolo), `${nome}: textarea com conteúdo`);
    /* Nada do cadastro nem do rascunho em lugar nenhum do documento, nem no payload. */
    for (const valor of [INICIAL.responsavel, INICIAL.email, INICIAL.telefone, INICIAL.cnpj, INICIAL.instagram, INICIAL.site, INICIAL.cidade, "Rascunho Salvo", "Rascunho Aprova"]) {
      assert.ok(!html.includes(valor), `${nome}: "${valor}" no HTML`);
    }
  }
});

/* ---------- texto ---------- */
/* Mutações que derrubaram este grupo: um travessão no aviso sem JavaScript de
   `textos.ts` (M6), e o link da política sem `#questionario` (M7). */

const TRAVESSAO = /[—–]/;

test("texto: nenhum travessão nos textos da tela nem nas páginas, nos três idiomas", async () => {
  const fonte = await readFile(new URL("../app/briefing/textos.ts", import.meta.url), "utf8");
  assert.ok(!TRAVESSAO.test(fonte), "travessão em textos.ts");
  /* E o que as funções devolvem, com e sem empresa, e por país. */
  const frases = (v) => {
    if (typeof v === "string") return [v];
    if (typeof v === "function") return [v("Empresa", 3), v(null, 5), v("BR"), v("ES"), v("US")].map(String);
    if (v && typeof v === "object") return Object.values(v).flatMap(frases);
    return [];
  };
  for (const [locale, t] of Object.entries(TEXTOS)) {
    for (const [k, v] of Object.entries(t)) {
      for (const s of frases(v)) assert.ok(!TRAVESSAO.test(s), `${locale}.${k} com travessão: "${s}"`);
    }
  }
  for (const [nome, locale] of [
    ["negocioBR", "pt"],
    ["essencialES", "es"],
    ["profissionalUS", "en"],
    ["encerrado", "pt"],
    ["fechado", "es"],
    ["enviado", "en"],
  ]) {
    const { html } = await pagina(nome, locale, nome === "enviado" ? "&enviado=1" : "");
    const achado = html.match(/.{0,40}[—–].{0,40}/);
    assert.equal(achado, null, `${nome}/${locale}: travessão em "${achado?.[0]}"`);
  }
});

/* O texto que só vale com JavaScript, e o que só vale sem ele, pelo par de
   classes que a folha liga e desliga (`bf-so-js` e `bf-sem-js`). Com os
   comentários do React fora, que partem um texto em vários nós. */
function textosDaClasse(html, classe) {
  const limpo = semScripts(html).replace(/<!--[\s\S]*?-->/g, "");
  return [...limpo.matchAll(new RegExp(`<span class="${classe}">([^<]*)</span>`, "g"))].map((m) => decodificar(m[1]).replace(/\s+/g, " ").trim());
}

test("texto: a abertura, o aviso sem JavaScript e o aviso do Revisar são os da ESPEC, palavra por palavra", async () => {
  const { html } = await pagina("negocioBR");
  const minutos = estimarMinutos(normalizarContexto(contextoDo("negocioBR")));
  assert.ok(minutos >= 5 && minutos % 5 === 0);
  /* Com JavaScript a página grava sozinha e diz isso; sem JavaScript nada
     sobe antes do Enviar, e a página não pode prometer o contrário (revisão
     de 25/09/2026: quem acreditasse e saísse perderia tudo). */
  const soJs = textosDaClasse(html, "bf-so-js");
  const semJs = textosDaClasse(html, "bf-sem-js");
  for (const frase of [
    `Estas perguntas são o ponto de partida do site da Empresa Teste Ltda. Leva uns ${minutos} minutos, salva sozinho, e dá para parar e voltar pelo mesmo link, no celular ou no computador. Se alguém da equipe for ajudar, pode usar o mesmo link.`,
    "O que você escreve fica salvo com a Varanda desde a primeira resposta, e só quem tem este link consegue abrir. Como a Varanda cuida disso está na",
    "As respostas já estão salvas com a Varanda. Enviar avisa que estão prontas para eu ler.",
  ]) {
    assert.ok(soJs.includes(frase), `com JavaScript, falta: "${frase.slice(0, 70)}..."`);
  }
  for (const frase of [
    `Estas perguntas são o ponto de partida do site da Empresa Teste Ltda. Leva uns ${minutos} minutos. Nesta página nada fica salvo antes do envio, então responda de uma vez e envie no fim.`,
    "O que você enviar fica salvo com a Varanda, e só quem tem este link consegue abrir. Como a Varanda cuida disso está na",
    "Enviar grava as respostas com a Varanda e avisa que estão prontas para eu ler.",
  ]) {
    assert.ok(semJs.includes(frase), `sem JavaScript, falta: "${frase.slice(0, 70)}..."`);
  }
  for (const frase of semJs) assert.ok(!/salva sozinh|já estão salvas|desde a primeira resposta/.test(frase), `sem JavaScript prometendo gravação: "${frase}"`);
  const texto = textoVisivel(html).replace(/[ \t]+/g, " ");
  for (const frase of [
    "Eu organizo e escrevo o texto do site: aqui eu preciso da informação, não da redação. Se não souber alguma coisa, deixe em branco. Só as perguntas marcadas como obrigatórias precisam de resposta para seguir.",
    "política de privacidade. Nunca escreva senha aqui.",
    "Sem JavaScript, esta página não salva sozinha e não mostra o que você já salvou: o que você escrever só chega à Varanda quando você apertar Enviar, no fim. Pode enviar assim mesmo: o que ficar em branco não apaga o que você já tinha mandado.",
    "Elas servem só para fazer o site de vocês e são apagadas depois que a garantia acaba, como explica a política de privacidade.",
    "Enviar para a Varanda",
  ]) {
    assert.ok(texto.includes(frase), `falta: "${frase.slice(0, 60)}..."`);
  }
  /* O aviso sem JavaScript é o bloco que só aparece sem ele. */
  assert.match(semScripts(html), /<p class="bf-sem-js-aviso bf-sem-js">Sem JavaScript, esta página não salva sozinha/);
  /* Um imperativo só na página: "me chame", nunca "me chama" (revisão de 25/09/2026). */
  assert.ok(!/Me chama\b/.test(texto), "\"Me chama\" ao lado de \"me chame\"");
  assert.ok(texto.includes("Oi, Fulana. Estas perguntas são o ponto de partida"), "a saudação antes da abertura");
  /* Espanhol: guarda-se "en" um lugar, ou alguém guarda; "con Varanda" é decalque (revisão de 25/09/2026). */
  const es = textosDaClasse((await pagina("negocioES")).html, "bf-so-js");
  assert.ok(es.includes("Varanda guarda lo que escribes desde la primera respuesta, y solo quien tiene este enlace puede abrirlo. Cómo lo cuida Varanda está en la"), "abertura em espanhol");
  assert.ok(es.includes("Varanda ya tiene tus respuestas guardadas. Enviarlas me avisa de que están listas para que las lea."), "aviso do Revisar em espanhol");
  /* Sem primeiro nome: "Oi." e a empresa na frase seguinte. */
  const semNome = textoVisivel((await pagina("semnome")).html);
  assert.match(semNome, /Oi\. Estas perguntas são o ponto de partida do site de vocês\./, "abertura sem primeiro nome nem empresa");
  /* Catalão só na Espanha. */
  assert.ok(textoVisivel((await pagina("negocioES")).html).includes("Puedes responder en castellano o en catalán."));
  assert.ok(!textoVisivel((await pagina("negocioES", "en")).html).includes("catalán"));
  /* "Deixe em branco" sem mais nada contradizia a trava das obrigatórias
     (26/09/2026). A frase nova usa a palavra do rótulo da tela (t.obrigatoria),
     no plural, nos três idiomas. Mutação vista falhando: a frase antiga de
     volta em `textos.ts`. */
  for (const [nome, locale, frase] of [
    ["negocioBR", "pt", "Se não souber alguma coisa, deixe em branco. Só as perguntas marcadas como obrigatórias precisam de resposta para seguir."],
    ["negocioES", "es", "Si no sabes algo, déjalo en blanco. Solo las preguntas marcadas como obligatorias necesitan respuesta para seguir."],
    ["negocioUS", "en", "If you don't know something, leave it blank. Only the questions marked as required need an answer before you move on."],
  ]) {
    assert.ok(textoVisivel((await pagina(nome, locale)).html).replace(/[ \t]+/g, " ").includes(frase), `${locale}: a abertura ainda manda deixar em branco sem ressalva`);
    assert.ok(frase.includes(TEXTOS[locale].obrigatoria), `${locale}: a frase não usa a palavra do rótulo "${TEXTOS[locale].obrigatoria}"`);
  }
});

test("texto: o link da política aponta para a seção do questionário, no idioma da página", async () => {
  for (const [nome, locale] of [
    ["negocioBR", "pt"],
    ["negocioES", "es"],
    ["negocioUS", "en"],
  ]) {
    const { html } = await pagina(nome, locale);
    const alvo = `${DICIONARIOS[locale].privacyPath}#questionario`;
    const links = tags(html, "a").filter((a) => a.at.href === alvo);
    assert.ok(links.length >= 2, `${locale}: a abertura e o Revisar levam a ${alvo} (achei ${links.length})`);
  }
});

/* Revisão de 25/09/2026. A política dizia "a Varanda só começa a ler depois
   do primeiro envio", e antes do envio o estúdio já vê a abertura do link, o
   último salvamento e a etapa em que o rascunho parou. E não contava que o
   site mede visitas, inclusive na página em que a pessoa preenche. */
test("política: conta o acompanhamento antes do envio e a medição de visitas, nos três idiomas", () => {
  const esperado = {
    pt: { antes: /Antes do primeiro envio, a Varanda vê quando o link foi aberto, quando algo foi salvo pela última vez e em que etapa o preenchimento parou/, visitas: /Web Analytics da Cloudflare, sem cookie/ },
    es: { antes: /Antes del primer envío, Varanda ve cuándo se ha abierto el enlace, cuándo se ha guardado algo por última vez y en qué paso se ha quedado el cuestionario/, visitas: /Web Analytics de Cloudflare, sin cookies/ },
    en: { antes: /Before the first submission, Varanda sees when the link was opened, when something was last saved and which step the questionnaire stopped at/, visitas: /Cloudflare Web Analytics, without cookies/ },
  };
  for (const [locale, { antes, visitas }] of Object.entries(esperado)) {
    const secoes = DICIONARIOS[locale].privacidade.secoes;
    const questionario = secoes.find((s) => s.ancora === "questionario");
    assert.match(questionario.texto, antes, `${locale}: o que se vê antes do envio`);
    assert.doesNotMatch(questionario.texto, /só começa a ler|solo empieza a leer|only starts reading/, `${locale}: a frase antiga`);
    assert.match(secoes[4].texto, visitas, `${locale}: a medição de visitas na seção 5`);
    assert.ok(!/[—–]/.test(questionario.texto + secoes[4].texto), `${locale}: travessão`);
  }
});

/* ---------- acessibilidade no HTML do servidor ---------- */
/* Revisão de 25/09/2026. Mutações que derrubam: tirar o `aria-describedby`
   da opção com dica; tirar `bf-sem-js` do topo do cartão; voltar a
   `t.seMarcar` com maiúscula no campo aberto. */

test("acessibilidade: a dica de uma opção é descrição do próprio controle, e o leitor de tela a ouve antes de marcar", async () => {
  const { textoDaOpcao } = await importar("../app/briefing/nucleo.ts");
  for (const nome of ["negocioBR", "negocioES", "negocioUS"]) {
    const locale = LINKS[nome].idioma;
    const c = normalizarContexto(contextoDo(nome));
    const { html } = await pagina(nome);
    const limpo = semScripts(html).replace(/<!--[\s\S]*?-->/g, "");
    const entradas = tags(html, "input");
    let conferidas = 0;
    for (const p of PERGUNTAS.filter((q) => (q.tipo === "unica" || q.tipo === "multipla") && chavesAceitas(c).includes(q.id))) {
      for (const o of opcoesDisponiveis(p, c)) {
        const dica = textoDaOpcao(o, c, locale).dica;
        const id = `c-${p.id.replace(/[^a-z0-9_]/gi, "-")}--${o.id}`;
        const entrada = entradas.find((e) => e.at.id === id);
        assert.ok(entrada, `${nome}: a opção ${id} existe`);
        if (!dica) {
          assert.ok(!entrada.at["aria-describedby"], `${nome}: ${id} sem dica não aponta para nada`);
          continue;
        }
        assert.equal(entrada.at["aria-describedby"], `${id}-dica`, `${nome}: ${id} descrito pela dica`);
        const alvo = limpo.match(new RegExp(`<p[^>]*\\bid="${id}-dica"[^>]*>([\\s\\S]*?)</p>`));
        assert.ok(alvo, `${nome}: o parágrafo ${id}-dica existe`);
        assert.ok(decodificar(alvo[1].replace(/<[^>]+>/g, "")).includes(dica), `${nome}: ${id}-dica traz a dica`);
        conferidas++;
      }
    }
    assert.ok(conferidas >= 10, `${nome}: ${conferidas} dicas de opção conferidas`);
  }
});

test("acessibilidade: com JavaScript a etapa aparece uma vez no topo, e o topo do cartão é só da página sem JavaScript", async () => {
  const { html } = await pagina("negocioBR");
  const topos = tags(html, "div").filter((d) => /\bformulario-topo\b/.test(d.at.class ?? ""));
  assert.equal(topos.length, 10, "nove etapas e o Revisar");
  for (const t of topos) assert.match(t.at.class, /\bbf-sem-js\b/, "o topo do cartão sem bf-sem-js");
  const css = await readFile(new URL("../app/briefing/briefing.css", import.meta.url), "utf8");
  assert.match(css, /\.bf-passo[^{]*\{[^}]*\}/, "a etapa continua na barra");
});

test("acessibilidade: o campo aberto de uma opção diz a condição em minúscula, como as outras condições", async () => {
  for (const [nome, inicio] of [
    ["negocioBR", /^\(se marcar “/],
    ["negocioES", /^\(si eliges «/],
    ["negocioUS", /^\(if you choose ‘/],
  ]) {
    const limpo = semScripts((await pagina(nome)).html).replace(/<!--[\s\S]*?-->/g, "");
    const condicoes = [...limpo.matchAll(/<span class="bf-condicao-abre">([^<]*)<\/span>/g)].map((m) => decodificar(m[1]).trim());
    assert.ok(condicoes.length >= 5, `${nome}: campos abertos`);
    for (const c of condicoes) {
      assert.match(c, inicio, `${nome}: "${c}"`);
      assert.doesNotMatch(c, /:\)$/, `${nome}: dois-pontos dentro do parêntese em "${c}"`);
    }
  }
});

test("acessibilidade: sem hidratação, Continuar e Voltar continuam âncoras para o :target", async () => {
  /* Com o React vivo eles viram <button> (o Tab do Safari não para em link);
     antes da hidratação, e se o JavaScript da página não carregar, a âncora
     é o que troca de etapa pelo CSS. */
  const { html } = await pagina("negocioBR");
  const continuar = tags(html, "a").filter((a) => a.at.class === "botao botao--acento" && /^#etapa-/.test(a.at.href ?? ""));
  assert.equal(continuar.length, 9, "um Continuar por etapa");
  assert.ok(tags(html, "a").some((a) => a.at.class === "botao botao--fantasma" && /^#etapa-/.test(a.at.href ?? "")), "Voltar como âncora");
});

/* ---------- espaço e trava ---------- */
/* O pedido de 26/09/2026: título mais afastado das respostas, em todas as
   perguntas, e Continuar travado com obrigatória em branco. A MEDIDA do
   espaço é do navegador (getBoundingClientRect, Chromium e WebKit, 390 e
   1440); o Node não desenha, então aqui fica a conta que a folha promete,
   lida das regras e dos tokens de verdade.
   Mutações vistas falhando: o recuo de `legend + .bf-fichas` trocado por
   `margin-top` (é a margem que a folga do float engole, e o título volta a
   colar); o `margin-top` da caixa de texto tirado (volta aos 8px); o recuo
   entre perguntas de volta a --e5 (empata com o vão de dentro); a região viva
   tirada da etapa. */

/** As regras de fora de `@media`, seletor por seletor, com os tokens resolvidos. */
async function regrasDaFolha() {
  const base = await readFile(new URL("../app/base.css", import.meta.url), "utf8");
  const tokens = Object.fromEntries([...base.matchAll(/(--e\d):\s*(\d+)px/g)].map((m) => [m[1], Number(m[2])]));
  const folha = (await readFile(new URL("../app/briefing/briefing.css", import.meta.url), "utf8"))
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g, "");
  const regras = new Map();
  for (const m of folha.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const declaracoes = Object.fromEntries(
      m[2]
        .split(";")
        .map((d) => d.split(":"))
        .filter((d) => d.length >= 2)
        .map(([k, ...v]) => [k.trim(), v.join(":").trim()]),
    );
    /* A vírgula dentro de `:is(...)` não separa seletor. */
    for (const bruto of m[1].split(/,(?![^(]*\))/)) {
      const seletor = bruto.trim().replace(/\s+/g, " ");
      regras.set(seletor, { ...regras.get(seletor), ...declaracoes });
    }
  }
  /* var(--eN), e calc de soma e subtração entre eles. */
  const px = (valor) => {
    assert.ok(valor, "a regra esperada não existe na folha");
    const conta = valor.replace(/^calc\((.*)\)$/, "$1").replace(/var\((--e\d)\)/g, (_, t) => String(tokens[t]));
    assert.match(conta, /^[\d\s+-]+$/, `valor fora da escala: ${valor}`);
    return conta.split(/\s+(?=[+-])/).reduce((soma, parte) => soma + Number(parte.replace(/\s+/g, "")), 0);
  };
  return { regras, px, tokens };
}

test("espaço: a resposta nasce a --e5 do título ou da dica, em todos os tipos, e a pergunta seguinte fica mais longe que isso", async () => {
  const { regras, px, tokens } = await regrasDaFolha();
  const r = (seletor) => regras.get(seletor) ?? {};

  /* Campo de texto, parágrafo, e-mail, telefone, endereço e data: grade com
     `gap` e a caixa com margem somada. */
  const gap = px(r(".bf-pergunta.campo").gap);
  assert.equal(gap, tokens["--e2"], "título -> dica no campo de texto");
  assert.equal(gap + px(r(".bf-pergunta.campo > :is(input, textarea)")["margin-top"]), tokens["--e5"], "título ou dica -> caixa de texto");

  /* Escolha única e múltipla: a legend flutua e quem vem logo depois tem
     `clear`. Ali a margem é engolida pela folga, então o espaço TEM de ser
     recuo (padding) de quem vem depois, e não margem. */
  assert.equal(r("fieldset.bf-pergunta > legend").float, "left");
  assert.equal(r("fieldset.bf-pergunta > legend + *").clear, "both");
  assert.equal(px(r("fieldset.bf-pergunta > legend + .bf-fichas")["padding-top"]), tokens["--e5"], "título -> fichas");
  assert.equal(px(r("fieldset.bf-pergunta > legend + .bf-dica")["padding-top"]), tokens["--e2"], "título -> dica na escolha");
  assert.equal(px(r("fieldset.bf-pergunta > .bf-dica + .bf-fichas")["margin-top"]), tokens["--e5"], "dica -> fichas");
  for (const [seletor, decl] of regras) {
    if (/legend \+/.test(seletor)) {
      assert.ok(!("margin-top" in decl) && !("margin-block-start" in decl), `${seletor}: margem logo depois da legend é engolida pela folga do float`);
    }
  }

  /* O vão entre uma pergunta e a próxima continua maior que o de dentro. */
  assert.ok(px(r(".bf-pergunta")["padding-block"]) > tokens["--e5"], "o recuo entre perguntas empatou com o vão entre o título e a resposta");
});

/* Revisão de 26/09/2026. Mutações vistas falhando: a regra
   `.bf-fichas + .bf-erro` tirada (a frase volta a 12 das fichas); a margem
   de baixo da região viva tirada (a frase encosta no fio); o contorno do
   foco do campo inválido tirado (com e sem foco a caixa fica igual); o
   recuo fixo dos links da lista tirado (o ritmo volta a variar). */
test("espaço: a frase de erro fica a --e2 da resposta nos dois tipos, a região viva não encosta no fio, e o foco do campo inválido se distingue", async () => {
  const { regras, px, tokens } = await regrasDaFolha();
  const r = (seletor) => regras.get(seletor) ?? {};
  assert.equal(px(r(".bf-pergunta.campo").gap), tokens["--e2"], "caixa de texto -> erro");
  assert.equal(px(r("fieldset.bf-pergunta > .bf-fichas + .bf-erro")["margin-top"]), tokens["--e2"], "fichas -> erro");

  /* Da frase ao fio, o mesmo que do fio ao botão. */
  const [cima, baixo] = (r(".bf-trava:not(:empty)")["margin-block"] ?? "").split(/\s+(?=var)/).map(px);
  assert.equal(cima, tokens["--e5"], "resposta -> frase da trava");
  assert.equal(baixo + px(r(".bf-navegacao")["margin-top"]), px(r(".bf-navegacao")["padding-top"]), "frase -> fio diferente de fio -> botão");

  /* O campo inválido tem a borda âmbar que o foco usa: o foco dele precisa
     de um sinal que o erro não tem. */
  assert.match(r('.bf-pergunta [aria-invalid="true"]:focus').outline ?? "", /^2px solid var\(--acento\)$/, "foco do campo inválido sem contorno");

  /* Os links da lista do que falta: recuo fixo que leva uma linha aos 44px. */
  assert.match(r(".bf-faltam :is(a, button)")["padding-block"] ?? "", /^calc\(\(var\(--alvo-toque\) - 1lh\) \/ 2\)$/, "links da lista sem recuo fixo");
});

test("trava: cada etapa tem a região viva da contagem, vazia no servidor, e nenhum campo leva required", async () => {
  for (const nome of ["negocioBR", "negocioES", "negocioUS"]) {
    const { html } = await pagina(nome);
    const limpo = semScripts(html);
    const etapas = [...limpo.matchAll(/<section[^>]*class="bf-etapa formulario[^"]*"[^>]*>/g)].length;
    const regioes = [...limpo.matchAll(/<p class="bf-trava bf-so-js" role="status">([\s\S]*?)<\/p>/g)].map((m) => m[1].replace(/<!--[\s\S]*?-->/g, ""));
    assert.equal(etapas, 9, `${nome}: nove etapas`);
    assert.equal(regioes.length, 9, `${nome}: uma região viva por etapa`);
    for (const texto of regioes) assert.equal(texto, "", `${nome}: a região nasce vazia`);
    /* Ver o comentário do <form>: required nativo prenderia quem está sem
       JavaScript (rascunho que a página não mostra, condicionais todas à
       mostra) e falharia calado numa etapa escondida pelo :target. */
    for (const c of campos(formulario(html).miolo)) assert.ok(!("required" in c.at), `${nome}: ${c.at.name ?? c.tipo} com required`);
  }
  /* E os três idiomas têm a frase do erro e a contagem, com plural certo. */
  const PLURAL = /\b(perguntas|preguntas|questions)\b/;
  for (const locale of ["pt", "es", "en"]) {
    const t = TEXTOS[locale];
    assert.ok(t.erros.obrigatoria.length > 10, `${locale}: frase do erro`);
    assert.doesNotMatch(t.faltamNaEtapa(1), PLURAL, `${locale}: singular com palavra do plural`);
    assert.match(t.faltamNaEtapa(3), PLURAL, `${locale}: plural`);
    assert.notEqual(t.faltamNaEtapa(2), t.faltamNaEtapa(3), `${locale}: a contagem não muda com o número`);
  }
});

/* ---------- pacote ---------- */
/* Mutação que derrubou este grupo: `INDICE_DO_PACOTE` com o Negócio
   apontando para o cartão do Essencial (M8). */

test("pacote: 'O que vocês contrataram' mostra o nome e os itens do cartão do site, sem preço", async () => {
  const INDICE = { essencial: 0, negocio: 1, profissional: 2 };
  for (const nome of ["essencialBR", "negocioBR", "profissionalBR", "negocioES", "profissionalUS"]) {
    const locale = LINKS[nome].idioma;
    const cartao = DICIONARIOS[locale].investimento.pacotes[INDICE[LINKS[nome].pacote]];
    const { html } = await pagina(nome);
    const bloco = semScripts(html).match(/<section class="bf-contratado"[\s\S]*?<\/section>/)?.[0];
    assert.ok(bloco, `${nome}: sem o bloco do pacote`);
    const itens = [...bloco.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => decodificar(m[1]));
    assert.deepEqual(itens, [...cartao.items], `${nome}: itens do pacote`);
    assert.ok(decodificar(bloco).includes(TEXTOS[locale].pacote(cartao.name)), `${nome}: nome do pacote`);
    assert.ok(!/R\$|€|US\$|\$\s?\d/.test(decodificar(bloco)), `${nome}: preço no bloco`);
  }
  const { html } = await pagina("profissionalBR");
  assert.match(textoVisivel(html), /Catálogo com filtros/, "a capacidade combinada");
  assert.match(textoVisivel(html), /Páginas ou seções combinadas\n?8/, "as páginas combinadas");
});

/* ---------- telas ---------- */
/* Mutação que derrubou este grupo: a tela de encerrado desenhando o texto do
   fora do ar (M9). */

test("telas: encerrado, vencido, fechado, fora do ar e recebido, cada uma com o seu texto e o WhatsApp", async () => {
  const wa = /href="https:\/\/wa\.me\/\d+\?text=/;
  for (const [nome, status, texto] of [
    ["encerrado", 410, "Este link foi encerrado."],
    ["vencido", 410, "Este link foi encerrado."],
    ["fechado", 200, "Suas respostas estão guardadas. A partir daqui, qualquer mudança vem pelo WhatsApp, e eu digo antes se ela muda prazo ou preço."],
  ]) {
    const { status: s, html } = await pagina(nome, "pt");
    assert.equal(s, status, nome);
    assert.ok(textoVisivel(html).includes(texto), `${nome}: texto`);
    assert.match(html, wa, `${nome}: WhatsApp`);
    assert.equal(tags(html, "form").length, 0, `${nome}: sem formulário`);
  }
  painel.falhar = true;
  try {
    const { status, html } = await pagina("negocioBR", "pt");
    assert.equal(status, 503);
    const t = textoVisivel(html).replace(/\s+/g, " ");
    assert.ok(t.includes("O formulário está fora do ar agora. O que você já salvou continua guardado. Tente de novo em alguns minutos ou me chame no WhatsApp."));
    assert.match(html, wa, "fora do ar: WhatsApp");
  } finally {
    painel.falhar = false;
  }
  const { status, html } = await pagina("enviado", "pt", "&enviado=1");
  assert.equal(status, 200);
  const t = textoVisivel(html).replace(/\s+/g, " ");
  assert.ok(
    t.includes(
      "Recebido. Eu leio tudo e te respondo com o que ficou claro e o que ainda falta. O prazo do site começa no dia útil seguinte ao que eu confirmar, por escrito, que as respostas, os arquivos e os acessos chegaram completos. Até lá, dá para voltar a este link, mudar e enviar de novo.",
    ),
    "recebido: texto da ESPEC",
  );
  assert.match(html, /href="mailto:varandaestudioweb@gmail\.com"/, "recebido: o e-mail do estúdio");
  assert.match(html, wa, "recebido: o WhatsApp do estúdio");
  assert.match(t, /Documento/, "recebido: a instrução do Documento");
});

test("telas: com JavaScript a página mostra uma etapa por vez desde a primeira pintura", async () => {
  const { html } = await pagina("negocioBR");
  const etapas = tags(html, "section").filter((s) => /\bbf-etapa\b/.test(s.at.class ?? ""));
  assert.equal(etapas.length, 10, "nove etapas e o Revisar");
  assert.equal(etapas.filter((s) => /\batual\b/.test(s.at.class)).length, 1, "uma etapa atual");
  assert.ok(/\batual\b/.test(etapas[0].at.class), "a atual é a primeira");
  const css = await readFile(new URL("../app/briefing/briefing.css", import.meta.url), "utf8");
  assert.match(css, /\.tem-js \.bf-etapa:not\(\.atual\)\s*\{\s*display:\s*none/, "a regra que esconde as outras etapas");
  /* E a classe entra no <head>, antes da primeira pintura. */
  assert.match(html.slice(0, html.indexOf("</head>")), /classList\.add\('tem-js'\)/, "tem-js no head");
});
