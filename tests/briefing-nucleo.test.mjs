import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

/**
 * O núcleo do questionário de projeto, testado sem build.
 *
 * **Por que este arquivo não passa pelo `dist/`.** Os outros testes importam o
 * Worker compilado; este importa `app/briefing/nucleo.ts` direto, porque o
 * Node 24 lê TypeScript com sintaxe apagável. É o que deixa testar o código
 * que de fato saneia e monta a leitura (e não uma cópia dele), e em segundos.
 *
 * **Todo teste aqui foi visto falhando** com o código quebrado de propósito
 * antes de valer como guarda: um teste que nunca falhou pode estar medindo
 * outra coisa, ou nada.
 *
 * Os nomes começam pelo grupo ("visibilidade:", "sanear:", "leitura:",
 * "esquema:") para a falha dizer de cara qual contrato quebrou.
 */

const nucleo = await import(new URL("../app/briefing/nucleo.ts", import.meta.url).href);
const { ETAPAS, VERSAO, LIMITES } = await import(new URL("../app/briefing/perguntas.ts", import.meta.url).href);
const congelada = JSON.parse(await readFile(new URL("./briefing-ids.json", import.meta.url), "utf8"));

const {
  PERGUNTAS,
  perguntaPorId,
  paisDe,
  contextoPadrao,
  normalizarContexto,
  visivel,
  estadoDaResposta,
  etapasVisiveis,
  obrigatoriasEmBranco,
  obrigatoriasEmBrancoDaEtapa,
  opcoesDisponiveis,
  opcoesTravadas,
  textoDaPergunta,
  textoDaOpcao,
  avisosDaEtapa,
  condicaoParaQuemResponde,
  sanear,
  sanearUrlencoded,
  sanearCampo,
  juntar,
  telefoneE164,
  valorInicial,
  montarLeitura,
  estimarMinutos,
  respostasComErro,
  tamanhoEmBytes,
  excedeTeto,
  LIMITE_RESPOSTAS_BYTES,
  LIMITE_LEITURA_BYTES,
} = nucleo;

/* Contexto de link, como o painel devolve. */
function ctx(extra = {}) {
  return { ...contextoPadrao(), ...extra };
}
const BR = ctx();
const BR_NEGOCIO = ctx({ pacote: "negocio", paginas: 6 });
const ES = ctx({ idioma: "es", pais: "ES", moeda: "EUR" });
const ES_PRO = ctx({ idioma: "es", pais: "ES", pacote: "profissional", capacidade: "catalogo", moeda: "EUR" });
const PRO_INTEGRACAO = ctx({ pacote: "profissional", capacidade: "integracao" });

function p(id) {
  const pergunta = perguntaPorId(id);
  assert.ok(pergunta, `a pergunta ${id} existe`);
  return pergunta;
}

function respostasDe(resultado) {
  assert.ok("respostas" in resultado, `esperava respostas, veio ${JSON.stringify(resultado)}`);
  return resultado.respostas;
}

/* ================================================================
   Visibilidade: pacote, país e condição
   ================================================================ */

test("visibilidade: pacote decide se a pergunta existe para o link", () => {
  const sucesso = p("objetivo.sucesso");
  assert.equal(visivel(sucesso, {}, BR), false, "Essencial não pergunta o que o pacote não trata");
  assert.equal(visivel(sucesso, {}, BR_NEGOCIO), true);
  assert.equal(visivel(sucesso, {}, ctx({ pacote: "profissional" })), true);

  /* Opção por pacote: "Outro idioma" é capacidade do Profissional, e oferecer
     no Negócio seria vender o que o pacote não tem. */
  const extras = p("funcoes.extras");
  assert.equal(visivel(extras, {}, BR), false);
  assert.ok(!opcoesDisponiveis(extras, BR_NEGOCIO).some((o) => o.id === "idioma"));
  assert.ok(opcoesDisponiveis(extras, PRO_INTEGRACAO).some((o) => o.id === "idioma"));
  const secoes = opcoesDisponiveis(p("conteudo.secoes"), BR).map((o) => o.id);
  assert.ok(!secoes.includes("blog") && !secoes.includes("vagas"));
});

test("visibilidade: país decide dados fiscais e opções locais", () => {
  assert.equal(paisDe("br"), "BR");
  assert.equal(paisDe("ES"), "ES");
  assert.equal(paisDe("PT"), "OUTRO");
  assert.equal(paisDe(undefined), "OUTRO");

  const registro = p("empresa.registro");
  assert.equal(visivel(registro, {}, ES), true);
  assert.equal(visivel(registro, {}, BR), false);
  assert.equal(visivel(registro, {}, ctx({ pais: "PT" })), false);
  const domicilio = p("empresa.domicilio");
  assert.equal(visivel(domicilio, {}, ctx({ pais: "PT" })), true, "Portugal cai em OUTRO e vê o domicílio");
  assert.equal(visivel(domicilio, {}, BR), false);

  /* IVA só existe fora do Brasil, e só se houver preço publicado. */
  const imposto = p("oferta.imposto");
  assert.equal(visivel(imposto, { "oferta.precos": "todos" }, ES), true);
  assert.equal(visivel(imposto, { "oferta.precos": "todos" }, BR), false);

  const pagamentoBR = opcoesDisponiveis(p("local.pagamento"), BR).map((o) => o.id);
  const pagamentoES = opcoesDisponiveis(p("local.pagamento"), ES).map((o) => o.id);
  assert.ok(pagamentoBR.includes("pix") && !pagamentoBR.includes("bizum"));
  assert.ok(pagamentoES.includes("bizum") && !pagamentoES.includes("pix") && !pagamentoES.includes("vale"));
});

test("visibilidade: inclui, em única e em múltipla", () => {
  const endereco = p("empresa.endereco_publico");
  assert.equal(visivel(endereco, {}, BR), false);
  assert.equal(visivel(endereco, { "empresa.como_compra": ["entrega"] }, BR), false);
  assert.equal(visivel(endereco, { "empresa.como_compra": ["entrega", "vem"] }, BR), true);

  const regioes = p("empresa.regioes");
  assert.equal(visivel(regioes, { "empresa.alcance": "regiao" }, BR), true);
  assert.equal(visivel(regioes, { "empresa.alcance": "pais" }, BR), false);
});

test("visibilidade: naoInclui exige resposta", () => {
  const doQue = p("fotos.do_que");
  assert.equal(visivel(doQue, {}, BR), false, "sem saber se há foto, não pergunta de quê");
  assert.equal(visivel(doQue, { "fotos.tem": "muitas" }, BR), true);
  assert.equal(visivel(doQue, { "fotos.tem": "nenhuma" }, BR), false);

  const detalhes = p("funcoes.detalhes");
  assert.equal(visivel(detalhes, {}, BR_NEGOCIO), false);
  assert.equal(visivel(detalhes, { "funcoes.extras": ["nenhuma"] }, BR_NEGOCIO), false);
  assert.equal(visivel(detalhes, { "funcoes.extras": ["catalogo"] }, BR_NEGOCIO), true);
  /* No Profissional, "Nenhuma outra" ao lado da capacidade travada não pode
     esconder a pergunta sobre a capacidade que o pacote inclui. */
  assert.equal(visivel(detalhes, { "funcoes.extras": ["nenhuma"] }, ES_PRO), true);
});

test("visibilidade: mínimo de marcadas", () => {
  const traducao = p("conteudo.traducao");
  assert.equal(visivel(traducao, { "conteudo.idiomas": ["pt_br"] }, BR), false);
  assert.equal(visivel(traducao, { "conteudo.idiomas": ["pt_br", "en"] }, BR), true);
});

test("visibilidade: todas e alguma", () => {
  const eventos = p("local.eventos");
  assert.equal(visivel(eventos, { "empresa.como_compra": ["vem"] }, BR), false);
  assert.equal(visivel(eventos, { "publico.tipo": "pessoas" }, BR), false);
  assert.equal(visivel(eventos, { "empresa.como_compra": ["vem"], "publico.tipo": "os_dois" }, BR), true);

  const orcamento = p("objetivo.orcamento");
  assert.equal(visivel(orcamento, {}, BR), false);
  assert.equal(visivel(orcamento, { "objetivo.acao": "orcamento" }, BR), true);
  assert.equal(visivel(orcamento, { "objetivo.servir": ["orcamento"] }, BR), true);
  assert.equal(visivel(orcamento, { "empresa.como_compra": ["orcamento"] }, BR), true);
});

test("visibilidade: pergunta pendurada em outra oculta também some", () => {
  /* O cliente marca "vem até o endereço", diz que o endereço aparece, e
     depois desmarca. A resposta "sim" continua guardada, mas o campo do
     endereço não pode ficar na tela pendurado nela. */
  const respostas = { "empresa.como_compra": ["entrega"], "empresa.endereco_publico": "sim" };
  assert.equal(visivel(p("empresa.endereco"), respostas, BR), false);
  assert.equal(visivel(p("empresa.endereco"), { ...respostas, "empresa.como_compra": ["vem"] }, BR), true);
});

test("visibilidade: capacidade travada do Profissional conta como marcada", () => {
  assert.deepEqual(opcoesTravadas(p("funcoes.extras"), PRO_INTEGRACAO), ["integracao"]);
  assert.deepEqual(opcoesTravadas(p("funcoes.extras"), BR_NEGOCIO), []);
  assert.equal(visivel(p("funcoes.sentido"), {}, PRO_INTEGRACAO), true, "a integração do pacote já pede o sentido");
  assert.equal(visivel(p("funcoes.sentido"), {}, BR_NEGOCIO), false);
});

test("visibilidade: etapas visíveis e obrigatórias em branco", () => {
  assert.equal(etapasVisiveis({}, BR).length, 9);
  assert.deepEqual(obrigatoriasEmBranco({}, BR), [
    "empresa.nome",
    "empresa.o_que_faz",
    "empresa.como_compra",
    "aprovacao.responsavel",
    "objetivo.servir",
    "objetivo.acao",
    "oferta.itens",
    "fotos.tem",
  ]);
  /* 74 e 77 só são obrigatórias quando aparecem. */
  const comFoto = obrigatoriasEmBranco({ "fotos.tem": "algumas" }, BR);
  assert.ok(comFoto.includes("fotos.autor") && comFoto.includes("fotos.pessoas"));
  assert.ok(!obrigatoriasEmBranco({ "fotos.tem": "nenhuma" }, BR).includes("fotos.autor"));
});

/* A régua da trava do Continuar (26/09/2026). O comportamento na tela (a
   etapa não muda, o erro aparece, o foco vai para a primeira) é conferido no
   navegador; aqui fica a decisão de QUAIS perguntas travam cada etapa.
   Mutações vistas falhando: o recorte pela etapa tirado (a etapa 1 travaria
   pelas obrigatórias das outras); a régua trocada por "obrigatória da etapa
   com `valorDe === null`", sem olhar visibilidade (a condicional escondida
   das fotos passa a travar). */
test("trava: cada etapa trava só pelas próprias obrigatórias em branco e visíveis", () => {
  assert.deepEqual(obrigatoriasEmBrancoDaEtapa("empresa", {}, BR), ["empresa.nome", "empresa.o_que_faz", "empresa.como_compra"]);
  assert.deepEqual(obrigatoriasEmBrancoDaEtapa("contato", {}, BR), ["aprovacao.responsavel"], "a etapa 2 travou pelas da etapa 1");
  assert.deepEqual(obrigatoriasEmBrancoDaEtapa("publico", {}, BR), [], "etapa sem obrigatória nunca trava");
  assert.deepEqual(obrigatoriasEmBrancoDaEtapa("nao-existe", {}, BR), []);

  /* Respondeu, libera; espaço em branco não é resposta. */
  const empresa = { "empresa.nome": "Casa", "empresa.o_que_faz": "   ", "empresa.como_compra": ["vem"] };
  assert.deepEqual(obrigatoriasEmBrancoDaEtapa("empresa", empresa, BR), ["empresa.o_que_faz"]);
  assert.deepEqual(obrigatoriasEmBrancoDaEtapa("empresa", { ...empresa, "empresa.o_que_faz": "Pães" }, BR), []);

  /* A condicional só trava quando aparece. */
  assert.deepEqual(obrigatoriasEmBrancoDaEtapa("arquivos", {}, BR), ["fotos.tem"]);
  assert.deepEqual(obrigatoriasEmBrancoDaEtapa("arquivos", { "fotos.tem": "nenhuma" }, BR), []);
  assert.deepEqual(obrigatoriasEmBrancoDaEtapa("arquivos", { "fotos.tem": "algumas" }, BR), ["fotos.autor", "fotos.pessoas"]);

  /* "Não sei" libera, na única e na múltipla só com ele marcado. */
  assert.deepEqual(obrigatoriasEmBrancoDaEtapa("arquivos", { "fotos.tem": "algumas", "fotos.autor": ["nao_sei"], "fotos.pessoas": "nao_sei" }, BR), []);

  /* Opção que o link não mostra não conta como resposta. */
  assert.deepEqual(obrigatoriasEmBrancoDaEtapa("empresa", { ...empresa, "empresa.o_que_faz": "Pães", "empresa.como_compra": ["inventada"] }, BR), ["empresa.como_compra"]);
});

/* "Outro" sem o "Qual?" numa obrigatória (decisão de 26/09/2026): conta como
   em branco na régua da trava, do Revisar e do servidor, e o alvo do que
   falta é o campo aberto. O estado da resposta NÃO muda (a leitura e o
   exportador dependem dele). Mutações vistas falhando: a cláusula do campo
   aberto tirada de `obrigatoriasEmBranco` (o "Outro" vazio passa); a regra
   aplicada também às não obrigatórias (`objetivo.canais_hoje` passa a
   faltar); o `trim` tirado de `abertaVazia` (o "Qual?" só com espaço passa);
   `chaveDoQueFalta` devolvendo sempre o id (o alvo deixa de ser o campo). */
test("trava: 'Outro' marcado sem o 'Qual?' é obrigatória em branco, só nas obrigatórias, e o alvo é o campo aberto", () => {
  const { abertaVazia, chaveDoQueFalta, ehChaveAberta } = nucleo;
  const servir = perguntaPorId("objetivo.servir");
  const acao = perguntaPorId("objetivo.acao");
  const canais = perguntaPorId("objetivo.canais_hoje");
  assert.ok(servir.obrigatoria && acao.obrigatoria && !canais.obrigatoria, "o esquema mudou: os três casos deixam de medir o que medem");

  /* Múltipla obrigatória: sozinho, junto de outra, e com o texto só de espaço. */
  for (const [nome, respostas] of [
    ["sozinho", { "objetivo.servir": ["outro"] }],
    ["junto de outra", { "objetivo.servir": ["whatsapp", "outro"] }],
    ["com espaço", { "objetivo.servir": ["outro"], "objetivo.servir.outro": "   " }],
  ]) {
    assert.ok(obrigatoriasEmBrancoDaEtapa("objetivo", respostas, BR).includes("objetivo.servir"), `múltipla, ${nome}: não travou`);
    assert.ok(obrigatoriasEmBranco(respostas, BR).includes("objetivo.servir"), `múltipla, ${nome}: o servidor deixaria enviar`);
    assert.equal(estadoDaResposta(servir, respostas, BR), "respondida", `múltipla, ${nome}: o estado da leitura mudou`);
    assert.equal(abertaVazia(servir, respostas, BR), "outro");
    assert.equal(chaveDoQueFalta("objetivo.servir", respostas, BR), "objetivo.servir.outro", `múltipla, ${nome}: o alvo não é o campo aberto`);
  }
  /* Com o texto, libera; sem o "Outro" marcado, o campo não importa. */
  assert.ok(!obrigatoriasEmBranco({ "objetivo.servir": ["outro"], "objetivo.servir.outro": "Feira de bairro" }, BR).includes("objetivo.servir"));
  assert.ok(!obrigatoriasEmBranco({ "objetivo.servir": ["whatsapp"] }, BR).includes("objetivo.servir"));
  assert.equal(chaveDoQueFalta("objetivo.servir", {}, BR), "objetivo.servir", "em branco de verdade: o alvo é a pergunta");

  /* Única obrigatória. */
  assert.ok(obrigatoriasEmBranco({ "objetivo.acao": "outro" }, BR).includes("objetivo.acao"), "única: não travou");
  assert.equal(chaveDoQueFalta("objetivo.acao", { "objetivo.acao": "outro" }, BR), "objetivo.acao.outro");
  assert.ok(!obrigatoriasEmBranco({ "objetivo.acao": "outro", "objetivo.acao.outro": "Mandar áudio" }, BR).includes("objetivo.acao"));

  /* Não obrigatória com "Outro" vazio: não trava nada. */
  const semTexto = { "objetivo.canais_hoje": ["outro"] };
  assert.equal(abertaVazia(canais, semTexto, BR), "outro", "a função vale para qualquer pergunta");
  assert.ok(!obrigatoriasEmBranco(semTexto, BR).includes("objetivo.canais_hoje"), "pergunta não obrigatória travou pelo 'Outro' vazio");

  /* A chave do campo aberto é reconhecida; outras não. */
  assert.ok(ehChaveAberta("objetivo.servir.outro"));
  assert.ok(!ehChaveAberta("objetivo.servir") && !ehChaveAberta("objetivo.servir.whatsapp") && !ehChaveAberta("inventada.outro"));
});

/* O pré-preenchimento que o HTML do servidor pode trazer (26/09/2026): só
   do contexto, só o que o rascunho não tem. Mutações vistas falhando: o
   `ler(...) === undefined` tirado de `prefillDoServidor` (o nome corrigido
   no rascunho voltaria a nascer com o do cadastro por cima); o `responsavel`
   do cadastro aceito em `valorDoContexto` (dado de `inicial` no HTML). */
test("prefill do servidor: só nome da empresa e idiomas, do contexto, e só o que o rascunho não tem", () => {
  const { prefillDoServidor, valorDoContexto } = nucleo;
  const c = ctx({ empresa: "Padaria Teste", idiomas_site: ["pt_br"], pacote: "negocio" });
  assert.deepEqual(prefillDoServidor({}, c), ["empresa.nome", "conteudo.idiomas"]);
  assert.equal(valorDoContexto(perguntaPorId("empresa.nome"), c), "Padaria Teste");
  assert.deepEqual(valorDoContexto(perguntaPorId("conteudo.idiomas"), c), ["pt_br"]);
  /* Nada que venha de `inicial`: e-mail, CNPJ, responsável, Instagram, site, cidade. */
  for (const id of ["contato.email", "empresa.id_fiscal", "preenchimento.quem", "contato.redes", "site_atual.endereco", "empresa.regioes"]) {
    assert.equal(valorDoContexto(perguntaPorId(id), c), null, `${id} pré-preenche no servidor`);
  }
  /* Chave no rascunho, mesmo com outro valor: não volta. */
  assert.deepEqual(prefillDoServidor({ "empresa.nome": "Padaria Teste Ltda" }, c), ["conteudo.idiomas"]);
  /* Sem o dado no contexto, nada. */
  assert.deepEqual(prefillDoServidor({}, ctx({ empresa: null, idiomas_site: [] })), []);
});

/* A lista do envio sem JavaScript recusado avisa das obrigatórias que a
   resposta vai abrir (revisão de 26/09/2026). Mutações vistas falhando: o
   filtro de obrigatória tirado, e a comparação com a pergunta citada
   quebrada. A cadeia (obrigatória que depende de condicional que depende
   da resposta) não tem caso nas perguntas de hoje, e por isso não é
   afirmada aqui. */
test("trava: as obrigatórias que dependem de uma resposta, na ordem do questionário", () => {
  assert.deepEqual(nucleo.obrigatoriasQueDependemDe("fotos.tem"), ["fotos.autor", "fotos.pessoas"]);
  assert.deepEqual(nucleo.obrigatoriasQueDependemDe("empresa.nome"), [], "pergunta sem dependente");
  /* Cada uma que ela devolve é obrigatória, some com a resposta em branco e
     aparece com alguma resposta: é o que torna o aviso verdadeiro. */
  for (const id of nucleo.obrigatoriasQueDependemDe("fotos.tem")) {
    const p = nucleo.perguntaPorId(id);
    assert.ok(p.obrigatoria, `${id} não é obrigatória`);
    assert.equal(nucleo.visivel(p, {}, BR), false, `${id} já aparece com a resposta em branco`);
    assert.equal(nucleo.visivel(p, { "fotos.tem": "algumas" }, BR), true, `${id} não aparece com a resposta dada`);
  }
  /* Nenhuma obrigatória de cadeia fica de fora: toda obrigatória condicional
     aparece como dependente de alguma pergunta. */
  const todas = new Set(nucleo.PERGUNTAS.flatMap((p) => nucleo.obrigatoriasQueDependemDe(p.id)));
  for (const p of nucleo.PERGUNTAS) if (p.obrigatoria && p.mostrarSe && !p.obsoleta) assert.ok(todas.has(p.id), `${p.id} ficou fora`);
});

/* ================================================================
   Sanear (JSON)
   ================================================================ */

test("sanear: __proto__ e constructor não entram, e a saída não tem protótipo", () => {
  const entrada = JSON.parse('{"__proto__": {"poluido": 1}, "constructor": {"prototype": {"x": 1}}, "empresa.nome": "Casa"}');
  const saida = respostasDe(sanear(entrada, BR));
  assert.equal(Object.getPrototypeOf(saida), null);
  assert.deepEqual(Object.keys(saida), ["empresa.nome"]);
  assert.equal(Object.hasOwn(saida, "__proto__"), false);
  assert.equal({}.poluido, undefined);
});

test("sanear: chave que o esquema não conhece é ignorada", () => {
  const saida = respostasDe(
    sanear({ "hack.campo": "x", "empresa.nome.extra": "y", "empresa.material.sim": "z", _outro: 1, "empresa.nome": "Casa" }, BR),
  );
  assert.deepEqual(Object.keys(saida), ["empresa.nome"]);
});

test("sanear: raiz que não é objeto é erro de JSON", () => {
  assert.deepEqual(sanear([], BR), { erro: "json", campo: "" });
  assert.deepEqual(sanear(null, BR), { erro: "json", campo: "" });
  assert.deepEqual(sanear("texto", BR), { erro: "json", campo: "" });
});

test("sanear: opção fora da lista é descartada", () => {
  const saida = respostasDe(
    sanear(
      {
        "empresa.alcance": "lua",
        "empresa.como_compra": ["vem", "teleporte", 3, null],
        "local.pagamento": ["pix", "dinheiro"],
        "publico.tipo": ["pessoas"],
      },
      ES,
    ),
  );
  assert.equal(Object.hasOwn(saida, "empresa.alcance"), false);
  assert.deepEqual(saida["empresa.como_compra"], ["vem"]);
  assert.deepEqual(saida["local.pagamento"], ["dinheiro"], "Pix não existe num link da Espanha");
  assert.equal(Object.hasOwn(saida, "publico.tipo"), false, "única não aceita lista");
});

test("sanear: pergunta de outro país ou pacote é descartada", () => {
  const saida = respostasDe(sanear({ "empresa.registro": "tomo 1", "objetivo.sucesso": "vender mais" }, BR));
  assert.deepEqual(Object.keys(saida), []);
});

test("sanear: múltipla acima do máximo fica no máximo, na ordem do esquema", () => {
  const saida = respostasDe(sanear({ "objetivo.servir": ["google", "outro", "whatsapp", "trabalhos", "orcamento"] }, BR));
  assert.deepEqual(saida["objetivo.servir"], ["whatsapp", "orcamento", "trabalhos"]);
});

test("sanear: opção exclusiva não convive com outra", () => {
  const junto = respostasDe(sanear({ "publico.particular": ["nada", "idosos"] }, BR));
  assert.deepEqual(junto["publico.particular"], ["idosos"], "entre 'nada' e uma resposta concreta, fica a concreta");
  const so = respostasDe(sanear({ "publico.particular": ["nada"] }, BR));
  assert.deepEqual(so["publico.particular"], ["nada"]);

  /* No Profissional a capacidade é travada: "Nenhuma outra" convive com ela,
     e ela volta mesmo que o navegador não mande. */
  const pro = respostasDe(sanear({ "funcoes.extras": ["nenhuma"] }, ES_PRO));
  assert.deepEqual(pro["funcoes.extras"], ["catalogo", "nenhuma"]);
  const pro2 = respostasDe(sanear({ "funcoes.extras": ["nenhuma", "loja"] }, ES_PRO));
  assert.deepEqual(pro2["funcoes.extras"], ["catalogo", "loja"]);
});

test("sanear: URL só http e https", () => {
  for (const perigosa of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<script>x</script>", "vbscript:x", "file:///c:/x", "https://user:senha@site.com"]) {
    assert.deepEqual(sanear({ "site_atual.endereco": perigosa }, BR), { erro: "url", campo: "site_atual.endereco" }, perigosa);
  }
  assert.equal(respostasDe(sanear({ "site_atual.endereco": "meusite.com.br" }, BR))["site_atual.endereco"], "https://meusite.com.br/");
  assert.equal(respostasDe(sanear({ "oferta.lista_link": "HTTP://Cardapio.com/Menu" }, BR))["oferta.lista_link"], "http://cardapio.com/Menu");
});

test("sanear: texto acima do limite é erro de campo, nunca corte", () => {
  const cheio = "a".repeat(LIMITES.paragrafo);
  assert.equal(respostasDe(sanear({ "oferta.itens": cheio }, BR))["oferta.itens"], cheio, "no limite passa inteiro");
  assert.deepEqual(sanear({ "oferta.itens": cheio + "b" }, BR), { erro: "longo", campo: "oferta.itens" });
  assert.deepEqual(sanear({ "empresa.nome": "x".repeat(LIMITES.curto + 1) }, BR), { erro: "longo", campo: "empresa.nome" });
  /* O campo que uma opção abre também tem limite, e o erro aponta para ele. */
  assert.deepEqual(sanear({ "objetivo.servir": ["outro"], "objetivo.servir.outro": "x".repeat(LIMITES.curto + 1) }, BR), {
    erro: "longo",
    campo: "objetivo.servir.outro",
  });
});

test("sanear: telefone vira E.164 pelo país do link", () => {
  const br = respostasDe(sanear({ "contato.whatsapp": "(11) 91234-5678", "contato.telefone": "011 4123.4567" }, BR));
  assert.equal(br["contato.whatsapp"], "+5511912345678", "Brasil sem +55 ganha o código");
  assert.equal(br["contato.telefone"], "+551141234567", "o zero de longa distância sai");
  const es = respostasDe(sanear({ "contato.whatsapp": "+34 612 345 678", "contato.telefone": "93 123 45 67" }, ES));
  assert.equal(es["contato.whatsapp"], "+34612345678");
  assert.equal(es["contato.telefone"], "+34931234567", "Espanha sem +34 ganha o código");

  assert.deepEqual(sanear({ "contato.whatsapp": "1234" }, BR), { erro: "telefone", campo: "contato.whatsapp" });
  assert.deepEqual(sanear({ "contato.whatsapp": "(11) 91234-5678" }, ES), { erro: "telefone", campo: "contato.whatsapp" }, "celular brasileiro sem + num link da Espanha");
  assert.deepEqual(sanear({ "contato.whatsapp": "7700 900123" }, ctx({ pais: "GB" })), { erro: "telefone", campo: "contato.whatsapp" });
  assert.equal(telefoneE164("+44 7700 900123", "GB"), "+447700900123");
  assert.equal(telefoneE164("0034 612 345 678", "ES"), "+34612345678");
  assert.equal(telefoneE164("+55 11 1234", "BR"), null);
  assert.equal(telefoneE164("+34 61234567", "ES"), null);
});

test("sanear: controle removido, NFC, quebra de linha normalizada", () => {
  const bruto = "  Cafe\u0301\u0000\u0007 bom\r\nlinha\ttab\u202E\u200B fim \r";
  const limpo = respostasDe(sanear({ "empresa.o_que_faz": bruto }, BR))["empresa.o_que_faz"];
  assert.equal(limpo, "Café bom\nlinha\ttab\u200B fim");
  assert.equal(limpo.normalize("NFC"), limpo);
  assert.equal(limpo.slice(0, 4), "Caf\u00e9", "o acento vem composto, um caractere só");
});

test("sanear: data AAAA-MM-DD válida", () => {
  assert.equal(respostasDe(sanear({ "prazo.data": "2026-12-01" }, BR))["prazo.data"], "2026-12-01");
  assert.deepEqual(sanear({ "prazo.data": "2026-02-30" }, BR), { erro: "data", campo: "prazo.data" });
  assert.deepEqual(sanear({ "prazo.data": "01/12/2026" }, BR), { erro: "data", campo: "prazo.data" });
});

test("sanear: meta-chaves _etapa e _conferido", () => {
  const ok = respostasDe(sanear({ _etapa: 3, _conferido: true }, BR));
  assert.equal(ok._etapa, 3);
  assert.equal(ok._conferido, true);
  const ruim = respostasDe(sanear({ _etapa: 12, _conferido: "true" }, BR));
  assert.equal(Object.hasOwn(ruim, "_etapa"), false);
  assert.equal(Object.hasOwn(ruim, "_conferido"), false);
});

test("sanear: saneado de novo não muda (a junção depende disso)", () => {
  const primeira = respostasDe(
    sanear(
      {
        "empresa.nome": " Casa ",
        "contato.whatsapp": "(11) 91234-5678",
        "site_atual.endereco": "casa.com.br",
        "objetivo.servir": ["google", "outro", "whatsapp", "trabalhos"],
        "objetivo.servir.outro": "vender marmita",
        "prazo.data": "2026-12-01",
        _etapa: 4,
      },
      BR,
    ),
  );
  assert.deepEqual({ ...respostasDe(sanear({ ...primeira }, BR)) }, { ...primeira });
});

test("sanear: campo avulso para o formulário conferir antes de gravar", () => {
  assert.deepEqual(sanearCampo("contato.whatsapp", "(11) 9", BR), { erro: "telefone" });
  assert.deepEqual(sanearCampo("aprovacao.opinam.sim", "a sócia", BR), { valor: "a sócia" });
  assert.deepEqual(sanearCampo("aprovacao.opinam.nao", "x", BR), { valor: null }, "opção sem campo aberto");
});

/* ================================================================
   Sanear (sem JavaScript)
   ================================================================ */

test("urlencoded: múltipla repetida vira lista, campo vazio não entra", () => {
  const params = new URLSearchParams(
    "empresa.como_compra=vem&empresa.como_compra=entrega&empresa.como_compra=&empresa.nome=Casa+Teste&oferta.itens=&__proto__=x&_conferido=1",
  );
  const saida = respostasDe(sanearUrlencoded(params, BR));
  assert.deepEqual(saida["empresa.como_compra"], ["vem", "entrega"]);
  assert.equal(saida["empresa.nome"], "Casa Teste");
  assert.equal(Object.hasOwn(saida, "oferta.itens"), false, "vazio no envio sem JS quer dizer 'não mexi'");
  assert.equal(saida._conferido, true);
  assert.equal(Object.getPrototypeOf(saida), null);
});

test("urlencoded: capacidade travada volta mesmo sem vir no formulário", () => {
  /* Caixa desabilitada não é enviada pelo navegador. */
  const saida = respostasDe(sanearUrlencoded(new URLSearchParams("funcoes.extras=loja"), ES_PRO));
  assert.deepEqual(saida["funcoes.extras"], ["catalogo", "loja"]);
});

test("urlencoded: juntar mantém o salvo e o envio vence", () => {
  const salvo = { "empresa.nome": "Antigo", "oferta.itens": "pão\nbolo", _etapa: 5, "chave.estranha": "x" };
  const novo = respostasDe(sanearUrlencoded(new URLSearchParams("empresa.nome=Novo&oferta.itens="), BR));
  const junto = juntar(salvo, novo, BR);
  assert.equal(junto["empresa.nome"], "Novo");
  assert.equal(junto["oferta.itens"], "pão\nbolo");
  assert.equal(junto._etapa, 5);
  assert.equal(Object.hasOwn(junto, "chave.estranha"), false);
  assert.equal(Object.getPrototypeOf(junto), null);
});

/* ================================================================
   Leitura
   ================================================================ */

const INICIAL = {
  empresa: "Casa Teste",
  responsavel: "Ana Souza",
  email: "contato@casateste.com.br",
  telefone: "(11) 91234-5678",
  cnpj: null,
  instagram: "@casateste",
  site: "casateste.com.br",
  cidade: "São Bernardo",
};

function item(leitura, id) {
  const achado = leitura.itens.find((i) => i.id === id);
  assert.ok(achado, `item ${id} na leitura`);
  return achado;
}

test("leitura: os cinco estados", () => {
  const respostas = {
    "empresa.nome": "Casa Teste",
    "empresa.alcance": "pais",
    "empresa.regioes": "Diadema", // respondida e depois a condição caiu
    "aprovacao.acompanha": "nao_sei",
  };
  const leitura = montarLeitura(respostas, BR, INICIAL, "pt");
  assert.equal(item(leitura, "empresa.material").estado, "em_branco");
  assert.equal(item(leitura, "aprovacao.acompanha").estado, "nao_sei");
  assert.equal(item(leitura, "empresa.endereco").estado, "oculta");
  assert.equal(item(leitura, "empresa.regioes").estado, "fora_da_condicao");
  assert.equal(item(leitura, "empresa.regioes").condicao_cumprida, false);
  assert.equal(item(leitura, "empresa.regioes").valor, "Diadema");
  assert.equal(item(leitura, "empresa.alcance").estado, "respondida");

  const c = leitura.contagem;
  assert.equal(c.respondidas + c.nao_sei + c.em_branco + c.ocultas + c.fora_da_condicao, PERGUNTAS.length);
  assert.equal(c.fora_da_condicao, 1);
  assert.equal(c.nao_sei, 1);
  assert.ok(c.obrigatorias_em_branco.includes("empresa.o_que_faz"));
  assert.ok(!c.obrigatorias_em_branco.includes("empresa.nome"));
});

test("leitura: origem painel quando o valor é o inicial e o Revisar não foi conferido", () => {
  const respostas = {
    "empresa.nome": "Casa Teste", // igual ao inicial
    "contato.recados": "email",
    "contato.email": "contato@casateste.com.br", // igual ao inicial
    "site_atual.existe": "site",
    "site_atual.endereco": "https://casateste.com.br/", // o inicial saneado dá o mesmo
    "preenchimento.quem": "Ana Souza, sócia", // mudou
  };
  const semConferir = montarLeitura(respostas, BR, INICIAL, "pt");
  assert.equal(item(semConferir, "empresa.nome").origem, "painel");
  assert.equal(item(semConferir, "contato.email").origem, "painel");
  assert.equal(item(semConferir, "site_atual.endereco").origem, "painel");
  assert.equal(item(semConferir, "preenchimento.quem").origem, "cliente");
  assert.equal(item(semConferir, "empresa.o_que_faz").origem, "cliente");
  assert.deepEqual(semConferir.contagem.prefill_sem_conferir, ["empresa.nome", "contato.email", "site_atual.endereco"]);
  assert.equal(semConferir.conferido, false);

  const conferida = montarLeitura({ ...respostas, _conferido: true }, BR, INICIAL, "pt");
  assert.equal(item(conferida, "empresa.nome").origem, "cliente");
  assert.deepEqual(conferida.contagem.prefill_sem_conferir, []);
  assert.equal(conferida.conferido, true);

  /* Pré-marcados que não vêm da ficha do cliente também contam como painel:
     os idiomas da proposta e a capacidade travada do Profissional. */
  const pro = ctx({ pacote: "profissional", capacidade: "catalogo", idiomas_site: ["pt_br", "en"] });
  const doPainel = montarLeitura({ "conteudo.idiomas": ["pt_br", "en"] }, pro, INICIAL, "pt");
  assert.equal(item(doPainel, "conteudo.idiomas").origem, "painel");
  assert.equal(item(doPainel, "funcoes.extras").origem, "painel");
  assert.deepEqual(item(doPainel, "funcoes.extras").valor, ["catalogo"]);
});

/* Revisão ponta a ponta de 25/09/2026: o pré-preenchimento punha o valor do
   cadastro em perguntas que a condição esconde (a cidade em
   `empresa.regioes`, o e-mail em `contato.email`, o site em
   `site_atual.endereco`), e a leitura marcava as três como "respondida fora
   da condição". O /briefing transforma isso em PENDENTE com contradição, e
   quem criou a contradição foi o formulário, não o cliente. Mutação que
   derruba: tirar o `soDoPainel` de `montarLeitura`. */
test("leitura: valor do cadastro numa pergunta que nunca apareceu conta como oculta", () => {
  const respostas = {
    "empresa.regioes": INICIAL.cidade,
    "contato.email": INICIAL.email,
    "site_atual.endereco": "https://casateste.com.br/", // o site do cadastro, saneado
  };
  for (const conferido of [false, true]) {
    const leitura = montarLeitura({ ...respostas, _conferido: conferido }, BR, INICIAL, "pt");
    for (const id of Object.keys(respostas)) {
      const i = item(leitura, id);
      assert.equal(i.estado, "oculta", `${id} (conferido ${conferido})`);
      assert.equal(i.valor, null, `${id}: sem valor`);
      assert.equal(i.valor_legivel_pt, null, `${id}: sem valor legível`);
      assert.equal(i.condicao_cumprida, false, `${id}: condição`);
      assert.equal(i.origem, "cliente", `${id}: origem`);
    }
    assert.equal(leitura.contagem.fora_da_condicao, 0, `nenhuma fora da condição (conferido ${conferido})`);
    assert.deepEqual(leitura.contagem.prefill_sem_conferir, []);
    const c = leitura.contagem;
    assert.equal(c.respondidas + c.nao_sei + c.em_branco + c.ocultas + c.fora_da_condicao, PERGUNTAS.length);
  }
  /* Com a condição cumprida, o mesmo valor é resposta, e do painel enquanto o
     Revisar não for conferido. */
  const visivel = montarLeitura({ ...respostas, "empresa.alcance": "cidade" }, BR, INICIAL, "pt");
  assert.equal(item(visivel, "empresa.regioes").estado, "respondida");
  assert.equal(item(visivel, "empresa.regioes").valor, INICIAL.cidade);
  assert.equal(item(visivel, "empresa.regioes").origem, "painel");
  /* E o que o CLIENTE escreveu antes de a condição cair continua fora dela:
     é a contradição de verdade, que o teste dos cinco estados já cobre com
     "Diadema". */
  const escrito = montarLeitura({ "empresa.regioes": "Diadema e Mauá" }, BR, INICIAL, "pt");
  assert.equal(item(escrito, "empresa.regioes").estado, "fora_da_condicao");
});

test("leitura: aprovacao.responsavel nunca vem preenchida", () => {
  assert.equal(p("aprovacao.responsavel").prefill, undefined);
  assert.equal(valorInicial(p("aprovacao.responsavel"), BR, INICIAL), null);
  assert.equal(valorInicial(p("preenchimento.quem"), BR, INICIAL), "Ana Souza");
});

test("leitura: formato, ordem e textos", () => {
  const respostas = {
    "empresa.alcance": "pais",
    "objetivo.servir": ["whatsapp", "outro"],
    "objetivo.servir.outro": "vender marmita",
    "objetivo.acao": "whatsapp",
    "objetivo.acao.outro": "texto de opção desmarcada",
    "prazo.tem": "sim",
    "prazo.data": "2026-10-15",
    "empresa.o_que_faz": "Espetos na brasa.",
  };
  const agora = new Date("2026-09-25T12:00:00Z");
  const leitura = montarLeitura(respostas, ES, INICIAL, "es", { agora });
  assert.equal(leitura.versao, VERSAO);
  assert.equal(leitura.gerada_em, "2026-09-25T12:00:00.000Z");
  assert.equal(leitura.locale, "es");
  assert.deepEqual(Object.keys(leitura.contexto), ["idioma", "pais", "pacote", "capacidade", "paginas", "idiomas_site", "moeda"]);
  assert.equal(leitura.itens.length, PERGUNTAS.length);
  leitura.itens.forEach((it, i) => assert.equal(it.n, i + 1));
  assert.equal(item(leitura, "final.observacoes").etapa, 9);
  assert.equal(item(leitura, "empresa.nome").etapa_titulo_pt, "A empresa");

  /* Pergunta em pt para quem lê, e a que o cliente viu, no idioma e na variante do país. */
  const fiscal = item(leitura, "empresa.nome_fiscal");
  assert.equal(fiscal.pergunta_pt, "Nome oficial");
  assert.match(fiscal.pergunta_mostrada, /^Nombre fiscal: la razón social/);

  /* Escolha legível em pt, com o rótulo neutro (nunca o nome do país). */
  const alcance = item(leitura, "empresa.alcance");
  assert.equal(alcance.valor_legivel_pt, "No país todo");
  assert.ok(alcance.opcoes.some((o) => o.id === "estado" && o.rotulo_pt === "No estado ou comunidade autônoma"));
  assert.equal(item(leitura, "objetivo.servir").valor_legivel_pt, "Trazer pedidos e conversas no WhatsApp; Outro");
  assert.deepEqual(item(leitura, "objetivo.servir").abertos, { outro: "vender marmita" });
  assert.equal(item(leitura, "objetivo.acao").abertos, undefined, "texto de opção desmarcada não entra");
  assert.equal(item(leitura, "prazo.data").valor_legivel_pt, "15 out 2026");
  assert.equal(item(leitura, "empresa.o_que_faz").valor_legivel_pt, null, "texto livre fica só em valor");
  assert.equal(item(leitura, "empresa.o_que_faz").opcoes, undefined);

  /* Opções só as do contexto. */
  const pagamento = item(leitura, "local.pagamento").opcoes.map((o) => o.id);
  assert.ok(pagamento.includes("bizum") && !pagamento.includes("pix"));

  /* Condição em português, com pacote e país quando for o caso. */
  assert.equal(item(leitura, "empresa.endereco_publico").condicao, "empresa.como_compra inclui vem");
  assert.equal(item(leitura, "objetivo.sucesso").condicao, "pacote negocio ou profissional");
  assert.equal(item(leitura, "oferta.imposto").condicao, "país ES ou OUTRO e oferta.precos é todos ou alguns");
  assert.equal(item(leitura, "empresa.nome").condicao, null);

  /* Vai para o banco como JSON: nada pode se perder na ida e volta. */
  assert.deepEqual(JSON.parse(JSON.stringify(leitura)), leitura);
});

test("leitura: o peso fixo da leitura, e por que o Worker mede os dois tetos", () => {
  /* A leitura leva o texto do cliente uma vez só (valor_legivel_pt é null em
     texto livre) mais uns 69 KB fixos de enunciados e opções. Com respostas
     perto de 131072 bytes, ela passa de 196608: é por isso que o Worker usa
     `excedeTeto` e não só o tamanho das respostas. Este teto de 72 KB segura
     o peso fixo de crescer sem ninguém ver. */
  const pro = ctx({ idioma: "es", pais: "ES", pacote: "profissional", capacidade: "integracao", paginas: 6 });
  const fixo = tamanhoEmBytes(montarLeitura({}, pro, INICIAL, "es"));
  assert.ok(fixo < 72000, `peso fixo da leitura: ${fixo} bytes`);
  assert.ok(fixo + LIMITE_RESPOSTAS_BYTES > LIMITE_LEITURA_BYTES, "se isto falhar, a medição da leitura ficou folgada e o comentário acima envelheceu");

  assert.equal(excedeTeto({ "empresa.nome": "Casa" }, montarLeitura({ "empresa.nome": "Casa" }, pro, INICIAL, "es")), null);
  assert.equal(excedeTeto({ "oferta.itens": "x".repeat(LIMITE_RESPOSTAS_BYTES) }, {}), "respostas");
  assert.equal(excedeTeto({}, { x: "x".repeat(LIMITE_LEITURA_BYTES) }), "leitura");
});

/* ================================================================
   Esquema: ids, textos e integridade
   ================================================================ */

const ID_PERGUNTA = /^[a-z0-9_]+\.[a-z0-9_]+$/;
const ID_OPCAO = /^[a-z0-9_]+$/;

test("esquema: 123 perguntas em nove etapas", () => {
  assert.equal(PERGUNTAS.length, 123);
  assert.deepEqual(
    ETAPAS.map((e) => e.id),
    ["empresa", "contato", "objetivo", "publico", "oferta", "provas", "arquivos", "site", "acessos"],
  );
  assert.match(VERSAO, /^\d{4}-\d{2}-\d{2}\.\d+$/);
  assert.deepEqual(LIMITES, { curto: 300, paragrafo: 5000, email: 254, telefone: 32, url: 500, data: 10 });
});

test("esquema: ids únicos, um ponto só, sem colisão com os campos abertos", () => {
  const ids = PERGUNTAS.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length, "id repetido");
  for (const id of ids) assert.match(id, ID_PERGUNTA);
  const abertos = new Set();
  for (const q of PERGUNTAS) {
    const opcoes = (q.opcoes ?? []).map((o) => o.id);
    assert.equal(new Set(opcoes).size, opcoes.length, `opção repetida em ${q.id}`);
    for (const o of q.opcoes ?? []) {
      assert.match(o.id, ID_OPCAO, `${q.id}.${o.id}`);
      if (!o.abre) continue;
      const chave = `${q.id}.${o.id}`;
      assert.ok(!ids.includes(chave) && !abertos.has(chave), `colisão em ${chave}`);
      abertos.add(chave);
    }
  }
  for (const meta of ["_etapa", "_conferido"]) assert.ok(!ids.includes(meta));
});

test("esquema: ids iguais aos da lista congelada", () => {
  /* Um id publicado nunca some nem muda de nome. Pergunta nova entra aqui E
     no arquivo congelado, de propósito, para ninguém criar id sem perceber. */
  const atual = Object.fromEntries(PERGUNTAS.map((q) => [q.id, (q.opcoes ?? []).map((o) => o.id)]));
  for (const [id, opcoes] of Object.entries(congelada.perguntas)) {
    assert.ok(Object.hasOwn(atual, id), `id congelado sumiu: ${id}`);
    for (const o of opcoes) assert.ok(atual[id].includes(o), `opção congelada sumiu: ${id} → ${o}`);
  }
  assert.deepEqual(atual, congelada.perguntas);
});

test("esquema: toda pergunta tem ficha, e só das seções que existem", () => {
  const secoes = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "3.direitos", "anexoA", "anexoB"]);
  for (const q of PERGUNTAS) {
    assert.ok(Array.isArray(q.ficha) && q.ficha.length > 0, `${q.id} sem ficha`);
    for (const f of q.ficha) assert.ok(secoes.has(f), `${q.id}: ficha ${f} não existe`);
  }
});

test("esquema: obrigatórias são as dez da especificação", () => {
  assert.deepEqual(
    PERGUNTAS.filter((q) => q.obrigatoria).map((q) => q.id),
    [
      "empresa.nome",
      "empresa.o_que_faz",
      "empresa.como_compra",
      "aprovacao.responsavel",
      "objetivo.servir",
      "objetivo.acao",
      "oferta.itens",
      "fotos.tem",
      "fotos.autor",
      "fotos.pessoas",
    ],
  );
});

test("esquema: toda condição aponta para pergunta anterior e para opção que existe", () => {
  const posicao = new Map(PERGUNTAS.map((q, i) => [q.id, i]));
  function conferir(c, dona) {
    if ("todas" in c) return c.todas.forEach((d) => conferir(d, dona));
    if ("alguma" in c) return c.alguma.forEach((d) => conferir(d, dona));
    const ref = perguntaPorId(c.pergunta);
    assert.ok(ref, `${dona.id} cita ${c.pergunta}, que não existe`);
    assert.ok(posicao.get(ref.id) < posicao.get(dona.id), `${dona.id} depende de ${ref.id}, que vem depois`);
    assert.ok(ref.tipo === "unica" || ref.tipo === "multipla", `${dona.id} depende de texto livre`);
    const opcoes = new Set((ref.opcoes ?? []).map((o) => o.id));
    for (const o of c.inclui ?? c.naoInclui ?? []) assert.ok(opcoes.has(o), `${dona.id}: ${ref.id} não tem a opção ${o}`);
    if ("minimo" in c) assert.equal(ref.tipo, "multipla", `${dona.id}: mínimo só em múltipla`);
  }
  for (const q of PERGUNTAS) if (q.mostrarSe) conferir(q.mostrarSe, q);
  for (const q of PERGUNTAS) {
    if (q.max !== undefined) {
      assert.equal(q.tipo, "multipla", `${q.id}: max só em múltipla`);
      assert.ok(q.max < q.opcoes.length);
    }
    if (q.tipo === "unica" || q.tipo === "multipla") assert.ok(q.opcoes?.length >= 2, `${q.id} sem opções`);
    else assert.equal(q.opcoes, undefined, `${q.id}: texto livre com opções`);
  }
});

/* Todo Texto do esquema, com o caminho, para a falha dizer onde está. */
function todosOsTextos() {
  const achados = [];
  function andar(valor, caminho) {
    if (!valor || typeof valor !== "object") return;
    const chaves = Object.keys(valor);
    if (chaves.length === 3 && ["pt", "es", "en"].every((k) => typeof valor[k] === "string")) {
      achados.push({ caminho, texto: valor });
      return;
    }
    for (const k of chaves) andar(valor[k], `${caminho}.${k}`);
  }
  andar(ETAPAS, "ETAPAS");
  return achados;
}

/* A mesma contagem pela estrutura declarada, campo a campo. Se o caminhador
   genérico acima perder um ramo, as duas contas divergem. */
function contarTextosPelaEstrutura() {
  let n = 0;
  const conta = (t) => {
    if (t) n++;
  };
  const variantes = (v, campos) => {
    for (const k of Object.keys(v ?? {})) for (const c of campos) conta(v[k][c]);
  };
  for (const e of ETAPAS) {
    conta(e.titulo);
    conta(e.aviso);
    for (const a of e.avisos ?? []) conta(a.texto);
    for (const q of e.perguntas) {
      conta(q.rotulo);
      conta(q.dica);
      conta(q.exemplo);
      variantes(q.variante, ["rotulo", "dica", "exemplo"]);
      for (const o of q.opcoes ?? []) {
        conta(o.rotulo);
        conta(o.abre);
        conta(o.dica);
        variantes(o.variante, ["rotulo", "dica"]);
      }
    }
  }
  return n;
}

test("esquema: nenhum texto com travessão, e nenhum vazio", () => {
  const textos = todosOsTextos();
  assert.equal(textos.length, contarTextosPelaEstrutura(), "o caminhador perdeu algum ramo");
  for (const { caminho, texto } of textos) {
    for (const l of ["pt", "es", "en"]) {
      assert.ok(texto[l].trim() !== "", `${caminho}.${l} vazio`);
      assert.doesNotMatch(texto[l], /[\u2014\u2013]/, `${caminho}.${l}: ${texto[l]}`);
    }
  }
});

test("esquema: espanhol sem 'usted', na voz de tú e vosotros", () => {
  for (const { caminho, texto } of todosOsTextos()) assert.doesNotMatch(texto.es, /\busted(es)?\b/i, `${caminho}.es: ${texto.es}`);
});

test("esquema: nenhum rótulo pt de opção cita país", () => {
  const PAISES = /\b(Brasil|Espanha|Portugal|Estados Unidos|EUA|Reino Unido|Inglaterra|França|Itália|Alemanha|Argentina|México|Catalunha)\b/i;
  for (const q of PERGUNTAS) {
    /* Em `conteudo.idiomas` os nomes são de IDIOMA ("Português do Brasil"),
       não de lugar, e a leitura precisa deles assim. */
    if (q.id === "conteudo.idiomas") continue;
    for (const o of q.opcoes ?? []) {
      const rotulos = [o.rotulo, ...Object.values(o.variante ?? {}).map((v) => v.rotulo).filter(Boolean)];
      for (const r of rotulos) assert.doesNotMatch(r.pt, PAISES, `${q.id} → ${o.id}: ${r.pt}`);
    }
  }
});

test("esquema: 'Não sei' tem sempre o mesmo id e o mesmo sentido", () => {
  for (const q of PERGUNTAS) {
    for (const o of q.opcoes ?? []) {
      if (/n[ãa]o sei$/i.test(o.rotulo.pt)) assert.equal(o.id, "nao_sei", `${q.id}: "${o.rotulo.pt}" com id ${o.id}`);
      if (o.id === "nao_sei") assert.match(o.rotulo.pt, /^(Ainda n|N)ão sei$/, `${q.id}`);
    }
  }
});

test("esquema: marcadores só nas variantes, e sempre resolvidos na tela", () => {
  const MARCADOR = /\[[A-Z_]+\]/g;
  for (const { caminho, texto } of todosOsTextos()) {
    for (const l of ["pt", "es", "en"]) {
      for (const m of texto[l].match(MARCADOR) ?? []) {
        assert.ok(["[PAGINAS]", "[CAPACIDADE]"].includes(m), `${caminho}: marcador ${m}`);
        assert.match(caminho, /\.variante\./, `${caminho}: marcador fora de variante não tem para onde cair`);
      }
    }
  }
  const contextos = [];
  for (const pacote of ["essencial", "negocio", "profissional"]) {
    for (const pais of ["BR", "ES", "PT"]) {
      for (const extra of [{}, { capacidade: "conteudo", paginas: 6 }]) contextos.push(normalizarContexto({ pacote, pais, ...extra }));
    }
  }
  for (const c of contextos) {
    for (const l of ["pt", "es", "en"]) {
      for (const q of PERGUNTAS) {
        const t = textoDaPergunta(q, c, l);
        for (const s of [t.rotulo, t.dica, t.exemplo]) if (s) assert.doesNotMatch(s, /\[[A-Z_]+\]/, `${q.id} em ${c.pacote}/${c.pais}/${l}`);
        for (const o of opcoesDisponiveis(q, c)) assert.ok(textoDaOpcao(o, c, l).rotulo);
      }
      for (const e of ETAPAS) for (const a of avisosDaEtapa(e, c, l)) assert.doesNotMatch(a, /\[[A-Z_]+\]/);
    }
  }
  const pro = normalizarContexto({ pacote: "profissional", capacidade: "catalogo", paginas: 6 });
  assert.match(textoDaPergunta(p("funcoes.extras"), pro, "pt").dica, /a que combinamos: Catálogo com filtros\./);
  assert.match(textoDaPergunta(p("conteudo.secoes"), pro, "en").dica, /up to 6 pages/);
  assert.equal(textoDaPergunta(p("conteudo.secoes"), ctx({ pacote: "negocio" }), "pt").dica, p("conteudo.secoes").dica.pt, "sem páginas cai no texto base");
});

test("esquema: variantes de país aparecem no país certo", () => {
  assert.equal(textoDaPergunta(p("contato.whatsapp"), BR, "pt").rotulo, "WhatsApp que vai receber os clientes pelo site, com DDD.");
  assert.match(textoDaPergunta(p("contato.whatsapp"), ES, "es").rotulo, /\+34 612 345 678/);
  assert.equal(textoOpcao("entrega.como", "apps", BR, "pt"), "Pelos aplicativos (iFood, Keeta, 99Food)");
  assert.equal(textoOpcao("entrega.como", "apps", ES, "es"), "Por las apps (Glovo, Uber Eats, Just Eat)");
  assert.equal(textoOpcao("empresa.alcance", "estado", BR, "pt"), "No estado");
  assert.equal(textoOpcao("empresa.alcance", "pais", ES, "es"), "En toda España");
  assert.deepEqual(avisosDaEtapa(ETAPAS[7], BR, "pt").length, 1, "o aviso do Essencial");
  assert.deepEqual(avisosDaEtapa(ETAPAS[7], BR_NEGOCIO, "pt").length, 0);
  assert.match(avisosDaEtapa(ETAPAS[6], ES, "es")[0], /En España/);
});

test("esquema: condição escrita para quem responde, na página sem JavaScript", () => {
  assert.equal(condicaoParaQuemResponde(p("empresa.nome"), BR, "pt"), null);
  assert.equal(condicaoParaQuemResponde(p("empresa.endereco"), BR, "pt"), "se respondeu “Sim”");
  assert.equal(condicaoParaQuemResponde(p("empresa.endereco_publico"), ES, "es"), "si has marcado «Viene a nuestro local»");
  assert.equal(
    condicaoParaQuemResponde(p("empresa.regioes"), BR, "pt"),
    "se respondeu “Só na nossa cidade”, “Na região” ou “No estado”",
    "o rótulo é o que o link mostra, com a variante do país",
  );
  assert.equal(condicaoParaQuemResponde(p("fotos.do_que"), BR, "en"), "if you answered anything other than ‘None’");
  assert.equal(
    condicaoParaQuemResponde(p("local.eventos"), BR, "pt"),
    "se marcou “Vem até o nosso endereço” e se respondeu “Pessoas” ou “Os dois”",
  );
  assert.match(condicaoParaQuemResponde(p("conteudo.traducao"), BR, "pt"), /^se marcou pelo menos 2 opções em “Em que idioma/);
  /* Toda condicional tem frase nos três idiomas, sem travessão e sem aspas vazias. */
  for (const c of [BR, ES_PRO, ctx({ pacote: "negocio", pais: "PT" })]) {
    for (const l of ["pt", "es", "en"]) {
      for (const q of PERGUNTAS.filter((x) => x.mostrarSe)) {
        const frase = condicaoParaQuemResponde(q, c, l);
        assert.ok(frase && frase.length > 10, `${q.id} ${l}`);
        assert.doesNotMatch(frase, /[—–]|“”|«»|‘’/, `${q.id} ${l}: ${frase}`);
      }
    }
  }
});

function textoOpcao(perguntaId, opcaoId, c, l) {
  return textoDaOpcao(p(perguntaId).opcoes.find((o) => o.id === opcaoId), c, l).rotulo;
}

test("esquema: todo exemplo de telefone passa na validação do próprio formulário", () => {
  for (const q of PERGUNTAS.filter((x) => x.tipo === "telefone")) {
    for (const [pais, v] of Object.entries(q.variante ?? {})) {
      if (!v.exemplo) continue;
      const codigo = pais === "OUTRO" ? "GB" : pais;
      assert.ok(telefoneE164(v.exemplo.pt, codigo), `${q.id} (${pais}): ${v.exemplo.pt}`);
    }
  }
});

test("esquema: o esquema é congelado", () => {
  assert.throws(() => {
    ETAPAS[0].titulo.pt = "outro";
  }, TypeError);
  assert.throws(() => {
    ETAPAS[0].perguntas.push({});
  }, TypeError);
});

/* ================================================================
   Contexto e estimativa
   ================================================================ */

test("contexto: o que vem do painel é conferido campo a campo", () => {
  const c = normalizarContexto({
    idioma: "fr",
    pais: "pt",
    pacote: "negocio",
    capacidade: "catalogo",
    paginas: 6,
    idiomas_site: '["pt_br","es"]',
    moeda: "EUR",
    empresa: " Casa ",
    primeiro_nome: "",
  });
  assert.deepEqual(c, {
    idioma: "pt",
    pais: "PT",
    pacote: "negocio",
    capacidade: null, // capacidade só existe no Profissional
    paginas: 6,
    idiomas_site: ["pt_br", "es"],
    moeda: "EUR",
    empresa: "Casa",
    primeiro_nome: null,
  });
  assert.deepEqual(normalizarContexto(null), contextoPadrao());
  assert.equal(contextoPadrao().pacote, "essencial");
});

test("estimativa: minutos de 5 em 5, e pacote maior leva mais", () => {
  const essencial = estimarMinutos(BR);
  const profissional = estimarMinutos(ctx({ pacote: "profissional", capacidade: "integracao" }));
  assert.equal(essencial % 5, 0);
  assert.ok(essencial >= 5);
  assert.ok(profissional > essencial);
  assert.ok(estimarMinutos(BR, { "fotos.tem": "muitas", "empresa.como_compra": ["vem", "entrega"] }) >= essencial);
});

/* Revisão de 25/09/2026: a abertura prometia "uns 30 minutos" no Essencial e
   "uns 35" no Negócio, porque a conta, feita sem respostas, só pesava as
   perguntas sem condição. Pela régua da própria ESPEC, quem responde de
   verdade vê 84 perguntas no Essencial (40 minutos) e 92 no Negócio (50).
   Mutação que derruba: voltar a somar só as visíveis. */
test("estimativa: as condicionais que existem no link contam, com metade do peso enquanto não aparecem", () => {
  assert.ok(estimarMinutos(BR) >= 40, `Essencial prometeria ${estimarMinutos(BR)} minutos, e o percurso real leva uns 40`);
  assert.ok(estimarMinutos(BR_NEGOCIO) >= 50, `Negócio prometeria ${estimarMinutos(BR_NEGOCIO)} minutos, e o percurso real leva uns 50`);
  /* Pergunta de outro pacote não pesa: o Essencial continua abaixo do Negócio. */
  assert.ok(estimarMinutos(BR) < estimarMinutos(BR_NEGOCIO));
});

/* ================================================================
   Revisar: o que precisa de ajuste antes de enviar
   ================================================================ */

/* Revisão de 25/09/2026: um WhatsApp "123" mostrava erro só na própria etapa;
   o Revisar dava o número como certo, o Enviar ficava ligado e o painel
   recebia o campo em branco. Mutação que derruba: `respostasComErro`
   devolvendo lista vazia, ou sem conferir visibilidade. */
test("revisar: resposta visível com formato inválido entra na lista de ajuste, na ordem do formulário", () => {
  assert.equal(typeof respostasComErro, "function", "o núcleo expõe respostasComErro");
  const base = { "empresa.nome": "Casa", "contato.whatsapp": "123", "contato.telefone": "", "site_atual.endereco": "javascript:alert(1)" };
  /* site_atual.endereco está oculta (site_atual.existe sem resposta): não entra, porque a pessoa não tem onde corrigir. */
  assert.deepEqual(respostasComErro(base, BR), [{ chave: "contato.whatsapp", erro: "telefone" }]);
  assert.deepEqual(respostasComErro({ ...base, "site_atual.existe": "site" }, BR), [
    { chave: "contato.whatsapp", erro: "telefone" },
    { chave: "site_atual.endereco", erro: "url" },
  ]);
  assert.deepEqual(respostasComErro({ "contato.whatsapp": "(11) 91234-5678", "empresa.nome": "Casa" }, BR), []);
  /* O campo que uma opção abre só conta com a opção marcada. */
  const longo = "x".repeat(LIMITES.curto + 1);
  assert.deepEqual(respostasComErro({ "aprovacao.opinam": "sim", "aprovacao.opinam.sim": longo }, BR), [{ chave: "aprovacao.opinam.sim", erro: "longo" }]);
  assert.deepEqual(respostasComErro({ "aprovacao.opinam": "nao", "aprovacao.opinam.sim": longo }, BR), []);
  /* Pergunta que não existe para o link não entra (dados fiscais da Espanha num link do Brasil). */
  assert.deepEqual(respostasComErro({ "empresa.registro": "x".repeat(LIMITES.curto + 1) }, BR), []);
});

/* ================================================================
   Voz e promessa dos textos (revisão de 25/09/2026)
   ================================================================ */

function textosDoEsquema() {
  const saida = [];
  const juntar = (x) => {
    if (!x) return;
    if (typeof x.pt === "string") saida.push(x.pt, x.es, x.en);
  };
  for (const etapa of ETAPAS) {
    juntar(etapa.titulo);
    juntar(etapa.aviso);
    for (const a of etapa.avisos ?? []) juntar(a.texto);
    for (const q of etapa.perguntas) {
      juntar(q.rotulo);
      juntar(q.dica);
      juntar(q.exemplo);
      for (const v of Object.values(q.variante ?? {})) for (const campo of Object.values(v)) juntar(campo);
      for (const o of q.opcoes ?? []) {
        juntar(o.rotulo);
        juntar(o.dica);
        juntar(o.abre);
        for (const v of Object.values(o.variante ?? {})) for (const campo of Object.values(v)) juntar(campo);
      }
    }
  }
  return saida;
}

test("esquema: quem fala com o cliente é uma pessoa só, e não 'o estúdio' em terceira pessoa (decisão 12)", () => {
  const terceira = /é o estúdio|trabalho do estúdio|es el estudio|trabajo del estudio|The studio is|studio's work/;
  const achados = textosDoEsquema().filter((s) => terceira.test(s));
  assert.deepEqual(achados, []);
});

test("esquema: nenhuma frase promete o que o contrato não diz", () => {
  const todos = textosDoEsquema();
  /* A garantia de 30 dias cobre defeito; mudança de conteúdo é paga desde a publicação (contrato 7.1 e 7.2). */
  assert.ok(!todos.some((s) => /Depois dos 30 dias de garantia, cada mudança|Después de los 30 días de garantía, cada cambio|After the 30-day warranty, each change/.test(s)), "garantia como se cobrisse mudança");
  /* Não existe conversa de início no processo: existe a primeira apresentação (manual, e contrato 3.2). */
  assert.ok(!todos.some((s) => /conversa do começo|reunión de arranque|kick-off call/.test(s)), "conversa de início que o processo não tem");
  /* "Eu mesmo" supõe que quem responde é homem. */
  assert.equal(textoDaOpcao(p("dados.texto").opcoes.find((o) => o.id === "eu"), BR, "pt").rotulo, "Eu reviso");
});

test("estado: estadoDaResposta bate com a leitura", () => {
  const respostas = { "fotos.tem": "muitas", "fotos.autor": ["nao_sei"], "dados.recebe": ["curriculo", "nao_sei"] };
  assert.equal(estadoDaResposta(p("fotos.autor"), respostas, BR), "nao_sei");
  assert.equal(estadoDaResposta(p("dados.recebe"), respostas, BR), "respondida", "'Não sei' junto de outra resposta diz alguma coisa");
  assert.equal(estadoDaResposta(p("fotos.pessoas"), respostas, BR), "em_branco");
  assert.equal(estadoDaResposta(p("fotos.falta"), respostas, BR), "oculta");
});
