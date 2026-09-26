/**
 * O núcleo do questionário: o que aparece, o que se guarda e como a resposta
 * vira leitura.
 *
 * Puro de propósito: sem React, sem `cloudflare:workers`, sem acesso a rede.
 * O mesmo código roda em três lugares (o Worker, que saneia e monta a leitura;
 * o formulário, que decide o que desenhar; e os testes, pelo Node 24 direto)
 * e é por rodar igual nos três que a tela e o servidor nunca discordam sobre
 * qual pergunta estava visível.
 *
 * **O que o servidor confia e o que não confia.** Tudo que chega do navegador
 * passa por `sanear`, que percorre as PERGUNTAS e nunca as chaves da entrada:
 * uma chave que o esquema não conhece simplesmente não é lida. A saída nasce
 * de `Object.create(null)`, então nem `__proto__` vindo de `JSON.parse` tem
 * como trocar protótipo de nada.
 *
 * **Texto do cliente nunca é cortado.** Acima do limite, o saneamento devolve
 * erro de campo (o Worker responde 422) e o navegador mostra no próprio campo.
 * Cortar em silêncio perderia exatamente o trecho literal que não se pode
 * inventar depois.
 */
import { CAPACIDADE_OPCAO, ETAPAS, LIMITES, PERGUNTA_DA_CAPACIDADE, VERSAO } from "./perguntas.ts";
import type { Capacidade, Condicao, Etapa, Locale, Opcao, Pacote, Pais, Pergunta, Texto, Tipo } from "./perguntas.ts";

/* ---------- Tipos do contrato ---------- */

export type Estado = "respondida" | "nao_sei" | "em_branco" | "oculta" | "fora_da_condicao";
export type Origem = "cliente" | "painel";

/** O contexto do link, como o painel devolve em `abrir` (ESPEC 2.4). */
export interface Contexto {
  idioma: Locale;
  pais: string; // ISO 3166-1 alfa-2 como veio do painel (BR, ES, PT, US...)
  pacote: Pacote;
  capacidade: Capacidade | null;
  paginas: number | null;
  idiomas_site: string[];
  moeda: string;
  empresa: string | null;
  primeiro_nome: string | null;
}

/** O que o painel já sabe do cliente, para pré-preencher e marcar a origem. */
export interface Inicial {
  empresa: string | null;
  responsavel: string | null;
  email: string | null;
  telefone: string | null;
  cnpj: string | null;
  instagram: string | null;
  site: string | null;
  cidade: string | null;
}

export type ValorResposta = string | string[];
/** Chave → valor. As meta-chaves são `_etapa` (1 a 9) e `_conferido` (booleano). */
export type Respostas = Record<string, string | string[] | number | boolean>;

export type ErroCampo = "longo" | "telefone" | "url" | "data";
export type ResultadoSanear = { respostas: Respostas } | { erro: ErroCampo | "json"; campo: string };

export interface ItemLeitura {
  id: string;
  etapa: number;
  etapa_titulo_pt: string;
  n: number;
  pergunta_pt: string;
  pergunta_mostrada: string;
  tipo: Tipo;
  obrigatoria: boolean;
  ficha: string[];
  condicao: string | null;
  condicao_cumprida: boolean;
  estado: Estado;
  origem: Origem;
  opcoes?: { id: string; rotulo_pt: string }[];
  valor: ValorResposta | null;
  valor_legivel_pt: string | null;
  abertos?: Record<string, string>;
}

export interface Leitura {
  versao: string;
  gerada_em: string;
  locale: Locale;
  contexto: Pick<Contexto, "idioma" | "pais" | "pacote" | "capacidade" | "paginas" | "idiomas_site" | "moeda">;
  conferido: boolean;
  itens: ItemLeitura[];
  contagem: {
    respondidas: number;
    nao_sei: number;
    em_branco: number;
    ocultas: number;
    fora_da_condicao: number;
    obrigatorias_em_branco: string[];
    prefill_sem_conferir: string[];
  };
}

/* Os tetos em bytes UTF-8 que o painel aplica (ESPEC 2.2). Ficam aqui para o
   Worker medir antes de chamar o painel com o mesmo número. */
export const LIMITE_RESPOSTAS_BYTES = 131072;
export const LIMITE_LEITURA_BYTES = 196608;

const LOCALES: readonly Locale[] = ["pt", "es", "en"];
const PACOTES: readonly Pacote[] = ["essencial", "negocio", "profissional"];
const CAPACIDADES = Object.keys(CAPACIDADE_OPCAO) as Capacidade[];
const MESES_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/* ---------- Índice das perguntas ---------- */

interface Indexada {
  pergunta: Pergunta;
  etapa: number;
  n: number;
}

const INDICE: Indexada[] = [];
const POR_ID = new Map<string, Indexada>();
ETAPAS.forEach((etapa, i) => {
  for (const pergunta of etapa.perguntas) {
    const item = { pergunta, etapa: i + 1, n: INDICE.length + 1 };
    INDICE.push(item);
    POR_ID.set(pergunta.id, item);
  }
});

/** Todas as perguntas da versão, na ordem do formulário (n = posição + 1). */
export const PERGUNTAS: readonly Pergunta[] = Object.freeze(INDICE.map((i) => i.pergunta));

export function perguntaPorId(id: string): Pergunta | undefined {
  return POR_ID.get(id)?.pergunta;
}

/** Número da etapa (1 a 9) em que a pergunta mora, ou null. */
export function etapaDaPergunta(id: string): number | null {
  return POR_ID.get(id)?.etapa ?? null;
}

/** A chave do campo que uma opção com `abre` mostra. */
export function chaveAberta(perguntaId: string, opcaoId: string): string {
  return `${perguntaId}.${opcaoId}`;
}

/* ---------- Contexto ---------- */

export function paisDe(codigo: unknown): Pais {
  const c = typeof codigo === "string" ? codigo.trim().toUpperCase() : "";
  if (c === "BR") return "BR";
  if (c === "ES") return "ES";
  return "OUTRO";
}

/**
 * Link sem projeto não deveria existir (o painel exige um). Se aparecer, o
 * formulário cai no Essencial, que é o pacote que menos oferece: nunca mostra
 * como incluído o que talvez não esteja.
 */
export function contextoPadrao(): Contexto {
  return {
    idioma: "pt",
    pais: "BR",
    pacote: "essencial",
    capacidade: null,
    paginas: null,
    idiomas_site: [],
    moeda: "BRL",
    empresa: null,
    primeiro_nome: null,
  };
}

/**
 * Confere o contexto que veio do painel campo a campo. O painel é nosso, mas o
 * contrato atravessa dois repositórios, e um campo que mudar de forma lá não
 * pode virar exceção aqui no meio de um envio.
 */
export function normalizarContexto(bruto: unknown): Contexto {
  const base = contextoPadrao();
  if (!ehObjeto(bruto)) return base;
  const b = bruto as Record<string, unknown>;
  const idioma = LOCALES.includes(b.idioma as Locale) ? (b.idioma as Locale) : base.idioma;
  const pais = typeof b.pais === "string" && /^[A-Za-z]{2}$/.test(b.pais.trim()) ? b.pais.trim().toUpperCase() : base.pais;
  const pacote = PACOTES.includes(b.pacote as Pacote) ? (b.pacote as Pacote) : base.pacote;
  const capacidade = pacote === "profissional" && CAPACIDADES.includes(b.capacidade as Capacidade) ? (b.capacidade as Capacidade) : null;
  const paginas = typeof b.paginas === "number" && Number.isInteger(b.paginas) && b.paginas > 0 && b.paginas < 1000 ? b.paginas : null;
  let idiomas: unknown = b.idiomas_site;
  if (typeof idiomas === "string") {
    try {
      idiomas = JSON.parse(idiomas);
    } catch {
      idiomas = [];
    }
  }
  const idiomas_site = Array.isArray(idiomas) ? idiomas.filter((x): x is string => typeof x === "string" && /^[a-z_]{2,12}$/.test(x)) : [];
  const moeda = typeof b.moeda === "string" && /^[A-Z]{3}$/.test(b.moeda) ? b.moeda : base.moeda;
  const texto = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
  return { idioma, pais, pacote, capacidade, paginas, idiomas_site, moeda, empresa: texto(b.empresa), primeiro_nome: texto(b.primeiro_nome) };
}

export function normalizarInicial(bruto: unknown): Inicial {
  const b = ehObjeto(bruto) ? (bruto as Record<string, unknown>) : {};
  const texto = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v : null);
  return {
    empresa: texto(b.empresa),
    responsavel: texto(b.responsavel),
    email: texto(b.email),
    telefone: texto(b.telefone),
    cnpj: texto(b.cnpj),
    instagram: texto(b.instagram),
    site: texto(b.site),
    cidade: texto(b.cidade),
  };
}

/* ---------- O que cabe no contexto ---------- */

/* Pacote e país decidem se a pergunta EXISTE para este link. Condição decide
   se ela aparece agora. São camadas diferentes: resposta a pergunta que não
   existe para o link é descartada; resposta a pergunta fora da condição é
   guardada, porque o cliente pode voltar atrás. */
function cabeNoContexto(p: { pacotes?: Pacote[]; paises?: Pais[] }, ctx: Contexto): boolean {
  if (p.pacotes && !p.pacotes.includes(ctx.pacote)) return false;
  if (p.paises && !p.paises.includes(paisDe(ctx.pais))) return false;
  return true;
}

/** As opções que este link mostra, na ordem do esquema. */
export function opcoesDisponiveis(p: Pergunta, ctx: Contexto): Opcao[] {
  return (p.opcoes ?? []).filter((o) => cabeNoContexto(o, ctx));
}

/**
 * As opções que vêm marcadas e não desmarcam: no Profissional, a capacidade
 * combinada em `funcoes.extras`. Ela já está no pacote, então o formulário a
 * mostra marcada e o saneamento a devolve sempre que a pergunta chegar.
 */
export function opcoesTravadas(p: Pergunta, ctx: Contexto): string[] {
  if (p.id !== PERGUNTA_DA_CAPACIDADE || ctx.pacote !== "profissional" || !ctx.capacidade) return [];
  const id = CAPACIDADE_OPCAO[ctx.capacidade];
  return opcoesDisponiveis(p, ctx).some((o) => o.id === id) ? [id] : [];
}

/* ---------- Textos resolvidos para a tela ---------- */

function substituir(texto: string, ctx: Contexto, locale: Locale): string | null {
  let s = texto;
  if (s.includes("[PAGINAS]")) {
    if (ctx.paginas === null) return null;
    s = s.split("[PAGINAS]").join(String(ctx.paginas));
  }
  if (s.includes("[CAPACIDADE]")) {
    const nome = ctx.capacidade ? rotuloDaCapacidade(ctx.capacidade, locale) : null;
    if (!nome) return null;
    s = s.split("[CAPACIDADE]").join(nome);
  }
  return s;
}

function resolverCampo(p: Pergunta, campo: "rotulo" | "dica" | "exemplo", ctx: Contexto, locale: Locale): string | null {
  /* Pacote antes de país, e o base por último. Texto com marcador que o link
     não sabe preencher é pulado, e por isso o texto base nunca tem marcador. */
  const candidatos: (Texto | undefined)[] = [p.variante?.[ctx.pacote]?.[campo], p.variante?.[paisDe(ctx.pais)]?.[campo], p[campo]];
  for (const c of candidatos) {
    if (!c) continue;
    const s = substituir(c[locale], ctx, locale);
    if (s !== null) return s;
  }
  return null;
}

/** Rótulo, dica e exemplo da pergunta como este link mostra, no `locale` pedido. */
export function textoDaPergunta(p: Pergunta, ctx: Contexto, locale: Locale): { rotulo: string; dica: string | null; exemplo: string | null } {
  return {
    rotulo: resolverCampo(p, "rotulo", ctx, locale) ?? p.rotulo[locale],
    dica: resolverCampo(p, "dica", ctx, locale),
    exemplo: resolverCampo(p, "exemplo", ctx, locale),
  };
}

/** Rótulo, dica (mostrada quando marcada) e o texto do campo que ela abre. */
export function textoDaOpcao(o: Opcao, ctx: Contexto, locale: Locale): { rotulo: string; dica: string | null; abre: string | null } {
  const v = o.variante;
  const pais = paisDe(ctx.pais);
  const rotulo = v?.[ctx.pacote]?.rotulo ?? v?.[pais]?.rotulo ?? o.rotulo;
  const dica = v?.[ctx.pacote]?.dica ?? v?.[pais]?.dica ?? o.dica;
  return { rotulo: rotulo[locale], dica: dica ? dica[locale] : null, abre: o.abre ? o.abre[locale] : null };
}

/** Avisos da etapa que valem para este link, já no idioma. */
export function avisosDaEtapa(etapa: Etapa, ctx: Contexto, locale: Locale): string[] {
  const saida: string[] = [];
  if (etapa.aviso) saida.push(etapa.aviso[locale]);
  for (const a of etapa.avisos ?? []) if (cabeNoContexto(a, ctx)) saida.push(a.texto[locale]);
  return saida;
}

const PALAVRAS_DA_CONDICAO: Record<
  Locale,
  { respondeu: string; marcou: string; diferente: string; outraQue: string; minimo: string; e: string; ou: string; abre: string; fecha: string }
> = {
  pt: {
    respondeu: "se respondeu",
    marcou: "se marcou",
    diferente: "se respondeu algo diferente de",
    outraQue: "se marcou alguma opção que não seja",
    minimo: "se marcou pelo menos [N] opções em",
    e: "e",
    ou: "ou",
    abre: "“",
    fecha: "”",
  },
  es: {
    respondeu: "si has respondido",
    marcou: "si has marcado",
    diferente: "si has respondido algo distinto de",
    outraQue: "si has marcado alguna opción que no sea",
    minimo: "si has marcado al menos [N] opciones en",
    e: "y",
    ou: "o",
    abre: "«",
    fecha: "»",
  },
  en: {
    respondeu: "if you answered",
    marcou: "if you ticked",
    diferente: "if you answered anything other than",
    outraQue: "if you ticked anything other than",
    minimo: "if you ticked at least [N] options in",
    e: "and",
    ou: "or",
    abre: "‘",
    fecha: "’",
  },
};

/**
 * A condição da pergunta escrita para quem responde, no idioma da página:
 * "se respondeu “Sim”", "si has marcado «Viene a nuestro local»". É o que a
 * página sem JavaScript põe entre parênteses ao lado de cada condicional, já
 * que ali todas aparecem de uma vez. Pacote e país ficam de fora: pergunta que
 * não existe para o link nem é desenhada. Sem condição, devolve null.
 */
export function condicaoParaQuemResponde(p: Pergunta, ctx: Contexto, locale: Locale): string | null {
  if (!p.mostrarSe) return null;
  const w = PALAVRAS_DA_CONDICAO[locale];
  const citar = (s: string) => `${w.abre}${s}${w.fecha}`;
  const lista = (itens: string[], conjuncao: string) =>
    itens.length <= 1 ? itens.join("") : `${itens.slice(0, -1).join(", ")} ${conjuncao} ${itens[itens.length - 1]}`;
  const escrever = (c: Condicao): string => {
    if ("todas" in c) return lista(c.todas.map(escrever), w.e);
    if ("alguma" in c) return lista(c.alguma.map(escrever), w.ou);
    const ref = perguntaPorId(c.pergunta);
    if (!ref) return "";
    const rotulos = (ids: string[]) =>
      opcoesDisponiveis(ref, ctx)
        .filter((o) => ids.includes(o.id))
        .map((o) => citar(textoDaOpcao(o, ctx, locale).rotulo));
    const multipla = ref.tipo === "multipla";
    if ("inclui" in c) return `${multipla ? w.marcou : w.respondeu} ${lista(rotulos(c.inclui), w.ou)}`;
    if ("naoInclui" in c) return `${multipla ? w.outraQue : w.diferente} ${lista(rotulos(c.naoInclui), w.ou)}`;
    return `${w.minimo.replace("[N]", String(c.minimo))} ${citar(textoDaPergunta(ref, ctx, locale).rotulo)}`;
  };
  return escrever(p.mostrarSe);
}

/** O nome da capacidade do Profissional, o mesmo da opção que ela trava. */
export function rotuloDaCapacidade(capacidade: Capacidade, locale: Locale): string | null {
  const opcao = perguntaPorId(PERGUNTA_DA_CAPACIDADE)?.opcoes?.find((o) => o.id === CAPACIDADE_OPCAO[capacidade]);
  return opcao ? opcao.rotulo[locale] : null;
}

/* ---------- Valor, visibilidade e estado ---------- */

function ehObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function ler(respostas: unknown, chave: string): unknown {
  return ehObjeto(respostas) && Object.hasOwn(respostas, chave) ? respostas[chave] : undefined;
}

/**
 * O valor que vale para esta pergunta neste link, ou null se não há resposta.
 * Opção que o link não mostra é ignorada, a travada entra sempre, e pergunta
 * que não existe para o link (pacote ou país) não tem valor.
 */
export function valorDe(p: Pergunta, respostas: unknown, ctx: Contexto): ValorResposta | null {
  if (!cabeNoContexto(p, ctx)) return null;
  const bruto = ler(respostas, p.id);
  if (p.tipo === "unica") {
    return typeof bruto === "string" && opcoesDisponiveis(p, ctx).some((o) => o.id === bruto) ? bruto : null;
  }
  if (p.tipo === "multipla") {
    const marcadas = new Set<string>(Array.isArray(bruto) ? bruto.filter((x): x is string => typeof x === "string") : []);
    for (const id of opcoesTravadas(p, ctx)) marcadas.add(id);
    const ids = opcoesDisponiveis(p, ctx)
      .map((o) => o.id)
      .filter((id) => marcadas.has(id));
    return ids.length ? ids : null;
  }
  return typeof bruto === "string" && bruto.trim() !== "" ? bruto : null;
}

function avaliar(c: Condicao, respostas: unknown, ctx: Contexto, pilha: Set<string>): boolean {
  if ("todas" in c) return c.todas.every((d) => avaliar(d, respostas, ctx, pilha));
  if ("alguma" in c) return c.alguma.some((d) => avaliar(d, respostas, ctx, pilha));
  const ref = perguntaPorId(c.pergunta);
  if (!ref) return false;
  /* A pergunta citada só conta se estiver visível. Sem isso, marcar "vem até
     o endereço", responder que o endereço aparece e depois desmarcar deixaria
     o campo do endereço à mostra, pendurado numa resposta que sumiu da tela. */
  const v = visivelComPilha(ref, respostas, ctx, pilha) ? valorDe(ref, respostas, ctx) : null;
  if (v === null) return false;
  const lista = Array.isArray(v) ? v : [v];
  if ("inclui" in c) return lista.some((x) => c.inclui.includes(x));
  if ("naoInclui" in c) return !lista.some((x) => c.naoInclui.includes(x));
  return lista.length >= c.minimo;
}

function visivelComPilha(p: Pergunta, respostas: unknown, ctx: Contexto, pilha: Set<string>): boolean {
  if (p.obsoleta) return false;
  if (!cabeNoContexto(p, ctx)) return false;
  if (!p.mostrarSe) return true;
  /* Guarda contra condição circular: o esquema de hoje não tem nenhuma, e se
     um dia tiver, a pergunta some em vez de travar o Worker num laço. */
  if (pilha.has(p.id)) return false;
  pilha.add(p.id);
  try {
    return avaliar(p.mostrarSe, respostas, ctx, pilha);
  } finally {
    pilha.delete(p.id);
  }
}

/** A pergunta aparece para este link, com estas respostas? (pacote, país e condição) */
export function visivel(p: Pergunta, respostas: unknown, ctx: Contexto): boolean {
  return visivelComPilha(p, respostas, ctx, new Set());
}

export function estadoDaResposta(p: Pergunta, respostas: unknown, ctx: Contexto): Estado {
  const valor = valorDe(p, respostas, ctx);
  if (!visivel(p, respostas, ctx)) return valor === null ? "oculta" : "fora_da_condicao";
  if (valor === null) return "em_branco";
  if (p.tipo === "unica" && valor === "nao_sei") return "nao_sei";
  /* Na múltipla, "Não sei" só vira estado quando é a única marcada; junto de
     outras, a resposta diz alguma coisa e conta como respondida. */
  if (p.tipo === "multipla" && Array.isArray(valor) && valor.length === 1 && valor[0] === "nao_sei") return "nao_sei";
  return "respondida";
}

/** As etapas com alguma pergunta visível: só elas contam no "Etapa 3 de 9". */
export function etapasVisiveis(respostas: unknown, ctx: Contexto): Etapa[] {
  return ETAPAS.filter((e) => e.perguntas.some((p) => visivel(p, respostas, ctx)));
}

/** Ids das obrigatórias visíveis e em branco, na ordem do formulário. */
export function obrigatoriasEmBranco(respostas: unknown, ctx: Contexto): string[] {
  return PERGUNTAS.filter((p) => p.obrigatoria && estadoDaResposta(p, respostas, ctx) === "em_branco").map((p) => p.id);
}

/* ---------- Saneamento ---------- */

/* Controle C0 e C1 menos \t e \n, e os controles de direção de texto, que
   deixariam a leitura no painel mostrar uma coisa e conter outra. */
const CONTROLES = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F‪-‮⁦-⁩]/g;

/** NFC, quebras de linha em \n, sem caractere de controle além de \n e \t, e sem espaço nas pontas. */
export function limparTexto(bruto: string): string {
  let s = bruto;
  /* Surrogate solto (possível em JSON) vira U+FFFD antes de qualquer conta. */
  if (typeof s.toWellFormed === "function") s = s.toWellFormed();
  s = s.replace(/\r\n?/g, "\n").normalize("NFC").replace(CONTROLES, "");
  return s.trim();
}

/**
 * Telefone para E.164 ("+5511912345678").
 *
 * Aceita "+" (ou "00") e de 8 a 15 dígitos, ignorando espaço, ponto, hífen e
 * parênteses. Sem prefixo internacional, o país do link decide: no Brasil,
 * 10 ou 11 dígitos com DDD (e o zero de longa distância na frente, se vier);
 * na Espanha, 9 dígitos. Nos outros países não há como adivinhar, então o
 * número precisa vir com o código. Inválido devolve null, e quem chama
 * transforma em erro de campo: número nunca é descartado em silêncio, porque
 * é justamente o que recebe os clientes do site.
 */
export function telefoneE164(texto: unknown, pais: Pais | string): string | null {
  if (typeof texto !== "string") return null;
  const limpo = texto.replace(/[\s.\-() ]/g, "");
  if (limpo === "") return null;
  let internacional = false;
  let digitos = limpo;
  if (digitos.startsWith("+")) {
    internacional = true;
    digitos = digitos.slice(1);
  } else if (digitos.startsWith("00")) {
    internacional = true;
    digitos = digitos.slice(2);
  }
  if (!/^\d+$/.test(digitos)) return null;
  const grupo = paisDe(pais);
  if (!internacional) {
    /* Sem "+", o número tem que caber no país do link: o nacional ganha o
       código, e o que já vier com o código fica. Qualquer outro tamanho é
       recusado, senão um celular brasileiro digitado num link da Espanha
       viraria, calado, um número dos Estados Unidos. */
    if (grupo === "BR") {
      if (/^0\d{10,11}$/.test(digitos)) digitos = digitos.slice(1);
      if (/^\d{10,11}$/.test(digitos)) digitos = `55${digitos}`;
      else if (!/^55\d{10,11}$/.test(digitos)) return null;
    } else if (grupo === "ES") {
      if (/^\d{9}$/.test(digitos)) digitos = `34${digitos}`;
      else if (!/^34\d{9}$/.test(digitos)) return null;
    } else {
      return null;
    }
  }
  if (digitos.length < 8 || digitos.length > 15 || digitos.startsWith("0")) return null;
  /* Os dois países que o estúdio atende têm tamanho fixo: um dígito a mais ou
     a menos é erro de digitação, e vale avisar agora. */
  if (digitos.startsWith("55") && !/^55[1-9]{2}\d{8,9}$/.test(digitos)) return null;
  if (digitos.startsWith("34") && digitos.length !== 11) return null;
  return `+${digitos}`;
}

/** O número da ficha do painel, se ele passar para E.164; é o "É este?" do formulário. */
export function sugestaoDeTelefone(inicial: unknown, ctx: Contexto): string | null {
  return telefoneE164(normalizarInicial(inicial).telefone, ctx.pais);
}

function urlSegura(s: string): string | null {
  let bruto = s;
  if (!/^https?:\/\//i.test(bruto)) {
    /* Qualquer outro esquema (javascript:, data:, mailto:, ftp:) é recusado; o
       que vier sem esquema nenhum ganha https://, que é como as pessoas
       escrevem endereço ("meusite.com.br"). */
    if (/^[a-z][a-z0-9+.-]*:/i.test(bruto)) return null;
    bruto = `https://${bruto}`;
  }
  let url: URL;
  try {
    url = new URL(bruto);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (!url.hostname || url.username || url.password) return null;
  return url.href;
}

function dataValida(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return ano >= 2000 && ano <= 2100 && d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

type ResultadoCampo = { valor: ValorResposta | null } | { erro: ErroCampo };

function sanearTextoTipado(tipo: Tipo, bruto: unknown, ctx: Contexto): ResultadoCampo {
  if (typeof bruto !== "string") return { valor: null };
  const s = limparTexto(bruto);
  if (s === "") return { valor: null };
  const limite = LIMITES[tipo as keyof typeof LIMITES] ?? LIMITES.curto;
  if (s.length > limite) return { erro: "longo" };
  if (tipo === "telefone") {
    const e164 = telefoneE164(s, ctx.pais);
    return e164 ? { valor: e164 } : { erro: "telefone" };
  }
  if (tipo === "url") {
    const url = urlSegura(s);
    if (!url) return { erro: "url" };
    return url.length > LIMITES.url ? { erro: "longo" } : { valor: url };
  }
  if (tipo === "data") return dataValida(s) ? { valor: s } : { erro: "data" };
  return { valor: s };
}

function sanearEscolha(p: Pergunta, bruto: unknown, ctx: Contexto): ValorResposta | null {
  const disponiveis = opcoesDisponiveis(p, ctx);
  if (p.tipo === "unica") {
    /* Opção fora da lista (inclusive a de outro país ou pacote) é descartada. */
    return typeof bruto === "string" && disponiveis.some((o) => o.id === bruto) ? bruto : null;
  }
  const lista = Array.isArray(bruto) ? bruto : typeof bruto === "string" ? [bruto] : [];
  const pedidas = new Set(lista.filter((x): x is string => typeof x === "string"));
  const travadas = opcoesTravadas(p, ctx);
  let marcadas = disponiveis.filter((o) => pedidas.has(o.id) || travadas.includes(o.id));
  /* Exclusiva junto de outra marcada só acontece sem JavaScript (no navegador
     com JS uma desmarca a outra). Entre "Nada disso" e uma resposta concreta,
     fica a concreta, que é a que informa alguma coisa. A travada não conta
     como "outra": "Nenhuma outra" ao lado da capacidade do pacote é válido. */
  const concretas = marcadas.filter((o) => !o.exclusiva && !travadas.includes(o.id));
  if (concretas.length > 0) {
    marcadas = marcadas.filter((o) => !o.exclusiva);
  } else {
    const primeiraExclusiva = marcadas.find((o) => o.exclusiva);
    if (primeiraExclusiva) marcadas = marcadas.filter((o) => o === primeiraExclusiva || travadas.includes(o.id));
  }
  if (p.max && marcadas.length > p.max) {
    /* Acima do máximo fica a ordem do esquema, sem nunca tirar a travada. */
    const fixas = marcadas.filter((o) => travadas.includes(o.id));
    const livres = marcadas.filter((o) => !travadas.includes(o.id)).slice(0, Math.max(0, p.max - fixas.length));
    marcadas = disponiveis.filter((o) => fixas.includes(o) || livres.includes(o));
  }
  return marcadas.length ? marcadas.map((o) => o.id) : null;
}

/**
 * Saneia um campo só, pela chave: id de pergunta ou `${pergunta}.${opcao}` de
 * uma opção com `abre`. É o mesmo caminho do `sanear`, exposto para o
 * formulário conferir um campo antes de gravar e mostrar o erro no lugar certo.
 * Chave que não existe para este link devolve `{ valor: null }`.
 */
export function sanearCampo(chave: string, bruto: unknown, ctx: Contexto): ResultadoCampo {
  const p = perguntaPorId(chave);
  if (p) {
    if (!cabeNoContexto(p, ctx)) return { valor: null };
    if (p.tipo === "unica" || p.tipo === "multipla") return { valor: sanearEscolha(p, bruto, ctx) };
    return sanearTextoTipado(p.tipo, bruto, ctx);
  }
  const ponto = chave.lastIndexOf(".");
  const dona = ponto > 0 ? perguntaPorId(chave.slice(0, ponto)) : undefined;
  if (!dona || !cabeNoContexto(dona, ctx)) return { valor: null };
  const opcao = opcoesDisponiveis(dona, ctx).find((o) => o.id === chave.slice(ponto + 1));
  if (!opcao?.abre) return { valor: null };
  return sanearTextoTipado("curto", bruto, ctx);
}

function sanearObjeto(entrada: Record<string, unknown>, ctx: Contexto): ResultadoSanear {
  const saida: Respostas = Object.create(null);
  /* O laço é sobre o ESQUEMA. Uma chave da entrada que não é pergunta nem
     campo aberto nem meta-chave nunca é lida. */
  for (const p of PERGUNTAS) {
    if (!cabeNoContexto(p, ctx)) continue;
    if (Object.hasOwn(entrada, p.id)) {
      const r = sanearCampo(p.id, entrada[p.id], ctx);
      if ("erro" in r) return { erro: r.erro, campo: p.id };
      if (r.valor !== null) saida[p.id] = r.valor;
    }
    for (const o of opcoesDisponiveis(p, ctx)) {
      if (!o.abre) continue;
      const chave = chaveAberta(p.id, o.id);
      if (!Object.hasOwn(entrada, chave)) continue;
      const r = sanearCampo(chave, entrada[chave], ctx);
      if ("erro" in r) return { erro: r.erro, campo: chave };
      if (r.valor !== null) saida[chave] = r.valor;
    }
  }
  if (Object.hasOwn(entrada, "_etapa")) {
    const bruto = entrada._etapa;
    const n = typeof bruto === "number" ? bruto : typeof bruto === "string" && /^\d{1,2}$/.test(bruto.trim()) ? Number(bruto) : NaN;
    if (Number.isInteger(n) && n >= 1 && n <= ETAPAS.length) saida._etapa = n;
  }
  if (Object.hasOwn(entrada, "_conferido") && typeof entrada._conferido === "boolean") {
    saida._conferido = entrada._conferido;
  }
  return { respostas: saida };
}

/**
 * Saneia o JSON do navegador (`respostas` do corpo do PUT ou do POST).
 * Devolve `{ respostas }` ou o primeiro erro de campo, `{ erro, campo }`.
 * Raiz que não é objeto devolve `{ erro: "json", campo: "" }`.
 */
export function sanear(entrada: unknown, ctx: Contexto): ResultadoSanear {
  if (!ehObjeto(entrada)) return { erro: "json", campo: "" };
  return sanearObjeto(entrada, ctx);
}

const VERDADEIRO = new Set(["1", "on", "true", "sim", "si", "yes"]);

/**
 * Saneia o envio sem JavaScript (`application/x-www-form-urlencoded`).
 *
 * Múltipla chega como a mesma chave repetida, então é lida com `getAll`.
 * Campo vazio NÃO entra na saída: no envio sem JavaScript a página não mostra
 * o que já estava salvo, e um campo em branco ali quer dizer "não mexi", nunca
 * "apague". Quem junta com o rascunho é `juntar`.
 */
export function sanearUrlencoded(params: URLSearchParams, ctx: Contexto): ResultadoSanear {
  const entrada: Record<string, unknown> = Object.create(null);
  for (const p of PERGUNTAS) {
    if (!cabeNoContexto(p, ctx)) continue;
    if (p.tipo === "multipla") {
      const valores = params.getAll(p.id).filter((v) => v.trim() !== "");
      if (valores.length) entrada[p.id] = valores;
    } else {
      const v = params.get(p.id);
      if (v !== null && v.trim() !== "") entrada[p.id] = v;
    }
    for (const o of opcoesDisponiveis(p, ctx)) {
      if (!o.abre) continue;
      const chave = chaveAberta(p.id, o.id);
      const v = params.get(chave);
      if (v !== null && v.trim() !== "") entrada[chave] = v;
    }
  }
  if (params.has("_conferido")) {
    entrada._conferido = params.getAll("_conferido").some((v) => VERDADEIRO.has(v.trim().toLowerCase()));
  }
  const etapa = params.get("_etapa");
  if (etapa !== null) entrada._etapa = etapa;
  return sanearObjeto(entrada, ctx);
}

/**
 * Junta o rascunho salvo com um envio que só traz o que mudou (o envio sem
 * JavaScript). O que veio no envio vence; o resto fica como estava. Só
 * atravessam as chaves que este link aceita, e a saída nasce sem protótipo.
 */
export function juntar(base: unknown, novo: Respostas, ctx: Contexto): Respostas {
  const saida: Respostas = Object.create(null);
  for (const chave of chavesAceitas(ctx)) {
    if (Object.hasOwn(novo, chave)) saida[chave] = novo[chave];
    else if (ehObjeto(base) && Object.hasOwn(base, chave)) saida[chave] = base[chave] as Respostas[string];
  }
  return saida;
}

/** Toda chave que este link aceita: ids, campos abertos e as duas meta-chaves. */
export function chavesAceitas(ctx: Contexto): string[] {
  const chaves: string[] = [];
  for (const p of PERGUNTAS) {
    if (!cabeNoContexto(p, ctx)) continue;
    chaves.push(p.id);
    for (const o of opcoesDisponiveis(p, ctx)) if (o.abre) chaves.push(chaveAberta(p.id, o.id));
  }
  chaves.push("_etapa", "_conferido");
  return chaves;
}

/** Tamanho em bytes UTF-8 do JSON, a mesma conta que o painel faz. */
export function tamanhoEmBytes(valor: unknown): number {
  return new TextEncoder().encode(JSON.stringify(valor)).length;
}

/**
 * Qual teto do painel o envio passaria, ou null se cabe nos dois.
 *
 * **O Worker precisa medir os dois, e não só as respostas.** A leitura carrega
 * uns 69 KB fixos (enunciados, opções e nomes de campo das 123 perguntas),
 * então com as respostas perto de 131072 bytes ela passa de 196608. Medido em
 * 25/09/2026, com todas as condições abertas: 126593 bytes de respostas deram
 * 194988 de leitura, 1,6 KB abaixo do teto. Sem esta conta, o painel recusaria
 * o envio depois do clique em Enviar; com ela, o Worker responde 413 antes.
 */
export function excedeTeto(respostas: unknown, leitura: unknown): "respostas" | "leitura" | null {
  if (tamanhoEmBytes(respostas) > LIMITE_RESPOSTAS_BYTES) return "respostas";
  if (tamanhoEmBytes(leitura) > LIMITE_LEITURA_BYTES) return "leitura";
  return null;
}

/* ---------- Pré-preenchimento ---------- */

/**
 * O valor com que a pergunta abre quando o rascunho ainda não tem a chave, já
 * saneado (o mesmo que a gravação produziria). É também a régua da origem na
 * leitura: resposta igual a isto, sem o passo Revisar conferido, veio do
 * painel e não do cliente. `aprovacao.responsavel` não tem `prefill`, e é de
 * propósito: quem recebeu o link não é, só por isso, quem decide.
 */
export function valorInicial(p: Pergunta, ctx: Contexto, inicial: unknown): ValorResposta | null {
  if (!cabeNoContexto(p, ctx)) return null;
  if (p.prefill === "idiomas_site") {
    const r = sanearCampo(p.id, ctx.idiomas_site, ctx);
    return "valor" in r ? r.valor : null;
  }
  const travadas = opcoesTravadas(p, ctx);
  if (travadas.length) return travadas;
  if (!p.prefill) return null;
  const bruto = normalizarInicial(inicial)[p.prefill];
  if (bruto === null) return null;
  const r = sanearCampo(p.id, bruto, ctx);
  return "valor" in r ? r.valor : null;
}

/* ---------- Leitura ---------- */

function listaPt(ids: string[], conjuncao: "ou" | "e"): string {
  if (ids.length <= 1) return ids.join("");
  return `${ids.slice(0, -1).join(", ")} ${conjuncao} ${ids[ids.length - 1]}`;
}

function descreverCondicao(c: Condicao): string {
  if ("todas" in c) return c.todas.map((d) => envolver(d)).join(" e ");
  if ("alguma" in c) return c.alguma.map((d) => envolver(d)).join(" ou ");
  const multipla = perguntaPorId(c.pergunta)?.tipo === "multipla";
  if ("inclui" in c) return `${c.pergunta} ${multipla ? "inclui" : "é"} ${listaPt(c.inclui, "ou")}`;
  if ("naoInclui" in c) return `${c.pergunta} respondida e ${multipla ? "sem" : "diferente de"} ${listaPt(c.naoInclui, "e")}`;
  return `${c.pergunta} com pelo menos ${c.minimo} marcadas`;
}

function envolver(c: Condicao): string {
  const s = descreverCondicao(c);
  return "todas" in c || "alguma" in c ? `(${s})` : s;
}

/* A condição inteira em português, com pacote e país: é o que explica, na
   leitura, por que uma pergunta ficou oculta. Os ids ficam como estão, porque
   são eles que a conferência mecânica procura. */
function descreverVisibilidade(p: Pergunta): string | null {
  const partes: string[] = [];
  if (p.obsoleta) partes.push("pergunta obsoleta");
  if (p.pacotes) partes.push(`pacote ${listaPt(p.pacotes, "ou")}`);
  if (p.paises) partes.push(`país ${listaPt(p.paises, "ou")}`);
  if (p.mostrarSe) partes.push(partes.length ? envolver(p.mostrarSe) : descreverCondicao(p.mostrarSe));
  return partes.length ? partes.join(" e ") : null;
}

/** "2026-10-15" vira "15 out 2026", que não se confunde entre dd/mm e mm/dd. */
export function dataLegivelPt(aaaaMmDd: string): string | null {
  if (!dataValida(aaaaMmDd)) return null;
  const [ano, mes, dia] = aaaaMmDd.split("-").map(Number);
  return `${dia} ${MESES_PT[mes - 1]} ${ano}`;
}

function iguais(a: ValorResposta, b: ValorResposta): boolean {
  if (typeof a === "string" || typeof b === "string") return a === b;
  return a.length === b.length && a.every((x) => b.includes(x));
}

/**
 * Monta a leitura (ESPEC 5): TODAS as perguntas da versão, respondidas ou
 * não, com estado, origem e condição. É o que o painel guarda por envio e o
 * que o comando de exportar lê; nenhum dos dois precisa conhecer o esquema.
 *
 * `valor_legivel_pt` só existe para escolha e data. Para texto livre ele é
 * null e o texto está em `valor`: repetir o texto dobraria o tamanho da
 * leitura, e ela tem teto de bytes no painel.
 *
 * `locale` é o idioma em que o formulário foi MOSTRADO (o da URL), que pode
 * ser outro que o do link.
 */
export function montarLeitura(
  respostas: unknown,
  ctx: Contexto,
  inicial: unknown,
  locale: Locale,
  opcoes: { agora?: Date } = {},
): Leitura {
  const idioma: Locale = LOCALES.includes(locale) ? locale : "pt";
  const conferido = ler(respostas, "_conferido") === true;
  const contagem: Leitura["contagem"] = {
    respondidas: 0,
    nao_sei: 0,
    em_branco: 0,
    ocultas: 0,
    fora_da_condicao: 0,
    obrigatorias_em_branco: [],
    prefill_sem_conferir: [],
  };
  const itens: ItemLeitura[] = [];

  for (const { pergunta: p, etapa, n } of INDICE) {
    const inicialDaPergunta = valorInicial(p, ctx, inicial);
    const cumprida = visivel(p, respostas, ctx);
    const guardado = valorDe(p, respostas, ctx);
    /* O valor do CADASTRO numa pergunta que a condição esconde não é
       resposta: o cliente nunca viu a pergunta. Os rascunhos gravados antes de
       25/09/2026 trazem isso (o pré-preenchimento não olhava a condição), e o
       /briefing leria "respondida fora da condição" como contradição que o
       cliente criou. Conta como oculta, sem valor. O que o cliente escreveu e
       depois escondeu, mudando outra resposta, continua fora da condição. */
    const soDoPainel = !cumprida && guardado !== null && inicialDaPergunta !== null && iguais(guardado, inicialDaPergunta);
    const valor = soDoPainel ? null : guardado;
    const estado: Estado = soDoPainel ? "oculta" : estadoDaResposta(p, respostas, ctx);
    const origem: Origem = valor !== null && inicialDaPergunta !== null && !conferido && iguais(valor, inicialDaPergunta) ? "painel" : "cliente";
    const disponiveis = opcoesDisponiveis(p, ctx);
    const escolha = p.tipo === "unica" || p.tipo === "multipla";

    let legivel: string | null = null;
    if (valor !== null && escolha) {
      const ids = Array.isArray(valor) ? valor : [valor];
      legivel = ids.map((id) => disponiveis.find((o) => o.id === id)?.rotulo.pt ?? id).join("; ");
    } else if (valor !== null && p.tipo === "data" && typeof valor === "string") {
      legivel = dataLegivelPt(valor);
    }

    const item: ItemLeitura = {
      id: p.id,
      etapa,
      etapa_titulo_pt: ETAPAS[etapa - 1].titulo.pt,
      n,
      pergunta_pt: p.rotulo.pt,
      pergunta_mostrada: textoDaPergunta(p, ctx, idioma).rotulo,
      tipo: p.tipo,
      obrigatoria: p.obrigatoria === true,
      ficha: [...p.ficha],
      condicao: descreverVisibilidade(p),
      condicao_cumprida: cumprida,
      estado,
      origem,
      valor: valor === null ? null : Array.isArray(valor) ? [...valor] : valor,
      valor_legivel_pt: legivel,
    };
    if (escolha) item.opcoes = disponiveis.map((o) => ({ id: o.id, rotulo_pt: o.rotulo.pt }));
    if (valor !== null && escolha) {
      const marcadas = Array.isArray(valor) ? valor : [valor];
      const abertos: Record<string, string> = {};
      for (const o of disponiveis) {
        if (!o.abre || !marcadas.includes(o.id)) continue;
        const texto = ler(respostas, chaveAberta(p.id, o.id));
        if (typeof texto === "string" && texto.trim() !== "") abertos[o.id] = texto;
      }
      if (Object.keys(abertos).length) item.abertos = abertos;
    }
    itens.push(item);

    if (estado === "respondida") contagem.respondidas++;
    else if (estado === "nao_sei") contagem.nao_sei++;
    else if (estado === "em_branco") contagem.em_branco++;
    else if (estado === "oculta") contagem.ocultas++;
    else contagem.fora_da_condicao++;
    if (estado === "em_branco" && p.obrigatoria) contagem.obrigatorias_em_branco.push(p.id);
    if (origem === "painel") contagem.prefill_sem_conferir.push(p.id);
  }

  return {
    versao: VERSAO,
    gerada_em: (opcoes.agora ?? new Date()).toISOString(),
    locale: idioma,
    contexto: {
      idioma: ctx.idioma,
      pais: ctx.pais,
      pacote: ctx.pacote,
      capacidade: ctx.capacidade,
      paginas: ctx.paginas,
      idiomas_site: [...ctx.idiomas_site],
      moeda: ctx.moeda,
    },
    conferido,
    itens,
    contagem,
  };
}

/* ---------- Estimativa de tempo ---------- */

const SEGUNDOS_POR_TIPO: Record<Tipo, number> = {
  unica: 12,
  multipla: 12,
  data: 15,
  curto: 30,
  email: 30,
  telefone: 30,
  url: 30,
  paragrafo: 75,
};

/**
 * Minutos para responder, arredondado para cima de 5 em 5. É estimativa, e a
 * tela diz "uns N minutos".
 *
 * Soma as perguntas visíveis E as condicionais que existem para o link, estas
 * com metade do peso enquanto não aparecem. A tela chama sem respostas, e
 * somar só as visíveis pesava apenas as perguntas sem condição: a abertura
 * prometia 30 minutos no Essencial para um percurso que, pela mesma régua,
 * leva uns 40 (revisão de 25/09/2026, com três percursos de cliente). Metade
 * do peso é heurística: ninguém vê todas as condicionais, e quase todo mundo
 * vê boa parte delas.
 */
export function estimarMinutos(ctx: Contexto, respostas: unknown = {}): number {
  let segundos = 0;
  for (const p of PERGUNTAS) {
    if (p.obsoleta || !cabeNoContexto(p, ctx)) continue;
    if (visivel(p, respostas, ctx)) segundos += SEGUNDOS_POR_TIPO[p.tipo];
    else if (p.mostrarSe) segundos += SEGUNDOS_POR_TIPO[p.tipo] / 2;
  }
  return Math.max(5, Math.ceil(segundos / 60 / 5) * 5);
}

/* ---------- O que precisa de ajuste antes de enviar ---------- */

/**
 * As respostas VISÍVEIS que o saneamento recusaria (telefone, endereço,
 * data, texto acima do limite), na ordem do formulário, com o erro de cada
 * uma. É o que o Revisar mostra e o que trava o Enviar.
 *
 * Sem isto, o formulário mandava no lugar do inválido o último valor que o
 * servidor confirmou, ou nada, e a tela dizia "Recebido." com o campo em
 * branco no painel (revisão de 25/09/2026, com um WhatsApp "123"). Pergunta
 * oculta fica de fora, porque ali a pessoa não tem onde corrigir; o campo que
 * uma opção abre só conta com a opção marcada.
 */
export function respostasComErro(respostas: unknown, ctx: Contexto): { chave: string; erro: ErroCampo }[] {
  const saida: { chave: string; erro: ErroCampo }[] = [];
  const conferir = (chave: string) => {
    const bruto = ler(respostas, chave);
    if (typeof bruto === "string" ? bruto.trim() === "" : !Array.isArray(bruto) || bruto.length === 0) return;
    const r = sanearCampo(chave, bruto, ctx);
    if ("erro" in r) saida.push({ chave, erro: r.erro });
  };
  for (const p of PERGUNTAS) {
    if (!visivel(p, respostas, ctx)) continue;
    conferir(p.id);
    const marcadas = valorDe(p, respostas, ctx);
    const lista = marcadas === null ? [] : Array.isArray(marcadas) ? marcadas : [marcadas];
    for (const o of opcoesDisponiveis(p, ctx)) if (o.abre && lista.includes(o.id)) conferir(chaveAberta(p.id, o.id));
  }
  return saida;
}
