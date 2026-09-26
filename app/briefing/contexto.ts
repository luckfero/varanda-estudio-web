/**
 * O que o Worker conta à página do questionário, e como a página lê.
 *
 * **Por que um cabeçalho, e não `cloudflare:workers`.** Só o Worker fala com o
 * painel. Ele chama `abrir()`, decide o código HTTP e passa o resultado à
 * página num cabeçalho interno da própria requisição, que a página lê com
 * `headers()` de `next/headers`. Nenhum arquivo de `app/` importa
 * `cloudflare:workers`: os testes importam `dist/server/index.js` no Node, e
 * o Node recusa esse esquema de import, derrubando a suíte inteira.
 *
 * **Por que base64url.** Valor de cabeçalho só aceita Latin-1. Nome de empresa
 * com aspas curvas, acento fora do Latin-1 ou emoji faz `headers.set` lançar
 * erro no meio do render. O JSON vai em UTF-8, e os bytes em base64url.
 *
 * **O cabeçalho que chega de fora é apagado no Worker**, em toda requisição,
 * antes de qualquer outra coisa. Sem isso, qualquer um mandaria um estado
 * inventado para a página.
 *
 * As respostas salvas NÃO vão aqui: com JavaScript, elas chegam por
 * `GET /api/briefing`. O cabeçalho leva só o que a página precisa para
 * escolher a tela e pré-preencher.
 *
 * Puro, como o núcleo: roda no Worker, na página e nos testes do Node.
 */
import { ehChaveAberta, normalizarContexto, normalizarInicial, perguntaPorId } from "./nucleo.ts";
import type { Contexto, Inicial } from "./nucleo.ts";
import type { Locale } from "./perguntas.ts";

/** O nome do cabeçalho interno. Minúsculo, que é como `Headers` devolve. */
export const CABECALHO_BRIEFING = "x-varanda-briefing";

/** 16 bytes em base64url sem `=`, como o painel gera (ESPEC 2.2). */
export const REGEX_CHAVE = /^[A-Za-z0-9_-]{22}$/;

/**
 * Os estados que chegam à página. Os cinco primeiros são os do painel; o
 * último é do Worker, quando o painel não respondeu. `invalido` nunca chega:
 * nesse caso o Worker serve a página de erro do site, e a desta rota nem roda.
 */
export type EstadoDaPagina = "aberto" | "enviado" | "fechado" | "encerrado" | "vencido" | "fora_do_ar";

const ESTADOS: readonly EstadoDaPagina[] = ["aberto", "enviado", "fechado", "encerrado", "vencido", "fora_do_ar"];

export interface DadosDaPagina {
  estado: EstadoDaPagina;
  chave: string | null;
  /** Só em aberto, enviado e fechado. */
  contexto: Contexto | null;
  /** Só em aberto e enviado: o fechado é só leitura e não pré-preenche nada. */
  inicial: Inicial | null;
  /** Para a tela de recebido, que sai do estado do servidor e nunca só da URL. */
  enviado_em: string | null;
  /**
   * As obrigatórias em branco no rascunho, só quando a página volta de um
   * envio sem JavaScript recusado (`?faltam=1`). O Worker calcula do que o
   * painel guardou, e não da URL: a URL só pede para mostrar. Ausente nos
   * outros casos. Cada item é o id da pergunta ou, no caso do "Outro" sem
   * o "Qual?", a chave do campo aberto vazio (`chaveDoQueFalta`), que é para
   * onde o link da lista leva.
   */
  faltam?: string[];
  /**
   * As perguntas que o HTML do servidor traz pré-preenchidas com o valor do
   * CONTEXTO (`prefillDoServidor`): as que o rascunho não tem. Só os ids; o
   * valor a página tira do próprio contexto, então nada que não esteja na
   * página entra por aqui. Ausente quando não há nenhuma.
   */
  prefill?: string[];
}

/** A tela que a página desenha. */
export type Tela = "formulario" | "recebido" | "fechado" | "encerrado" | "fora_do_ar";

const LOCALES: readonly Locale[] = ["pt", "es", "en"];

export function ehLocale(valor: unknown): valor is Locale {
  return LOCALES.includes(valor as Locale);
}

/** `/briefing`, `/es/briefing` ou `/en/briefing`. */
export function enderecoDaPagina(locale: Locale): string {
  return locale === "pt" ? "/briefing" : `/${locale}/briefing`;
}

/**
 * O endereço da API para esta chave, com o idioma da PÁGINA.
 *
 * O idioma vai na URL porque a API não tem outro jeito de saber de onde veio
 * o envio: a página manda `Referrer-Policy: no-referrer`, então não chega
 * `Referer`. Ele decide o idioma da leitura (`pergunta_mostrada`) e para qual
 * das três páginas o envio sem JavaScript volta. Sem ele, vale o do link.
 */
export function enderecoDaApi(chave: string, locale: Locale): string {
  return `/api/briefing?chave=${encodeURIComponent(chave)}&idioma=${locale}`;
}

function paraBase64Url(bytes: Uint8Array): string {
  let binario = "";
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function deBase64Url(texto: string): Uint8Array {
  const base64 = texto.replaceAll("-", "+").replaceAll("_", "/");
  const binario = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
}

/** O valor do cabeçalho, pronto para `headers.set`. */
export function codificarCabecalho(dados: DadosDaPagina): string {
  return paraBase64Url(new TextEncoder().encode(JSON.stringify(dados)));
}

/* Teto generoso: contexto e inicial somam poucas centenas de bytes. Um valor
   maior que isto não veio do Worker. */
const TETO_DO_CABECALHO = 16384;

/**
 * Lê o cabeçalho e confere campo a campo. Qualquer coisa fora do formato
 * devolve null, e a página trata null como "este endereço não existe".
 */
export function lerCabecalho(valor: string | null | undefined): DadosDaPagina | null {
  if (typeof valor !== "string" || valor.length === 0 || valor.length > TETO_DO_CABECALHO) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(valor)) return null;
  let bruto: unknown;
  try {
    bruto = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(deBase64Url(valor)));
  } catch {
    return null;
  }
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return null;
  const b = bruto as Record<string, unknown>;
  if (!ESTADOS.includes(b.estado as EstadoDaPagina)) return null;
  const estado = b.estado as EstadoDaPagina;
  const chave = typeof b.chave === "string" && REGEX_CHAVE.test(b.chave) ? b.chave : null;
  const editavel = estado === "aberto" || estado === "enviado";
  /* Formulário sem chave não teria para onde gravar. */
  if (editavel && chave === null) return null;
  return {
    estado,
    chave,
    contexto: editavel || estado === "fechado" ? normalizarContexto(b.contexto) : null,
    inicial: editavel ? normalizarInicial(b.inicial) : null,
    enviado_em: typeof b.enviado_em === "string" ? b.enviado_em : null,
    ...(editavel && Array.isArray(b.faltam)
      ? { faltam: b.faltam.filter((id): id is string => typeof id === "string" && (perguntaPorId(id) !== undefined || ehChaveAberta(id))) }
      : {}),
    ...(editavel && Array.isArray(b.prefill)
      ? { prefill: b.prefill.filter((id): id is string => typeof id === "string" && perguntaPorId(id)?.prefill !== undefined) }
      : {}),
  };
}

/* O painel grava com `datetime('now')` do SQLite: "AAAA-MM-DD HH:MM:SS", em
   UTC e sem fuso escrito. Aceita também ISO 8601, por segurança. */
function instante(texto: string | null): number | null {
  if (!texto) return null;
  const sqlite = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(texto);
  const ms = Date.parse(sqlite ? `${texto.replace(" ", "T")}Z` : texto);
  return Number.isFinite(ms) ? ms : null;
}

/** Janela da tela de recebido (ESPEC 3.2). */
export const JANELA_DO_RECEBIDO_MS = 10 * 60 * 1000;

/**
 * O envio aconteceu nos últimos 10 minutos. Um minuto de folga para frente
 * cobre relógio de máquina adiantado; mais que isso não é envio recente.
 */
export function enviadoRecente(enviado_em: string | null, agora: Date): boolean {
  const ms = instante(enviado_em);
  if (ms === null) return false;
  const diferenca = agora.getTime() - ms;
  return diferenca <= JANELA_DO_RECEBIDO_MS && diferenca >= -60 * 1000;
}

/**
 * A tela, a partir do estado do servidor.
 *
 * **O recebido exige as duas coisas:** o `?enviado=1` que o Worker põe no 303
 * do envio sem JavaScript E um `enviado_em` de agora há pouco. Só a URL não
 * basta, porque qualquer um monta a URL e veria "Recebido" sem ter enviado. Só
 * o estado também não, porque quem reabre o link logo depois de enviar quer o
 * formulário para mudar alguma coisa, e não a confirmação de novo.
 */
export function decidirTela(dados: DadosDaPagina, pedido: { enviado?: boolean; agora?: Date } = {}): Tela {
  switch (dados.estado) {
    case "aberto":
      return "formulario";
    case "enviado":
      return pedido.enviado === true && enviadoRecente(dados.enviado_em, pedido.agora ?? new Date()) ? "recebido" : "formulario";
    case "fechado":
      return "fechado";
    case "encerrado":
    case "vencido":
      return "encerrado";
    default:
      return "fora_do_ar";
  }
}
