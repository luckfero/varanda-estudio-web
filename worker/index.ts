/** Ponto de entrada do Worker da Cloudflare. */
import handler from "vinext/server/app-router-entry";
import {
  CABECALHO_BRIEFING,
  REGEX_CHAVE,
  codificarCabecalho,
  ehLocale,
  enderecoDaPagina,
  type DadosDaPagina,
} from "../app/briefing/contexto.ts";
import {
  excedeTeto,
  juntar,
  montarLeitura,
  normalizarContexto,
  normalizarInicial,
  chaveDoQueFalta,
  obrigatoriasEmBranco,
  prefillDoServidor,
  sanear,
  sanearUrlencoded,
  type Contexto,
  type Respostas,
} from "../app/briefing/nucleo.ts";
import { VERSAO, type Locale } from "../app/briefing/perguntas.ts";

/**
 * As duas chamadas que o painel expõe ao site (ESPEC 2.4). É um Service
 * Binding e não o D1: ver o comentário de `services` no `wrangler.jsonc`.
 * Tudo que volta daqui é conferido antes de usar, porque o contrato atravessa
 * dois repositórios publicados em momentos diferentes.
 */
interface BriefingPublico {
  abrir(token: string, opcoes?: { marcar?: boolean }): Promise<unknown>;
  salvar(token: string, dados: unknown): Promise<unknown>;
}

/* `DB` e `IMAGES` estavam declarados aqui desde o modelo inicial e não
   existiam como binding no `wrangler.jsonc`: a rota `/_vinext/image` chamava
   `env.IMAGES` e derrubava o worker, que respondia 500 sem nenhum dos
   cabeçalhos do site. Nenhuma imagem da página passa por aquela rota.

   `BRIEFING` e `BRIEFING_ATIVO` são do questionário de projeto, e os dois são
   opcionais aqui de propósito: os testes das seis rotas rodam sem eles, e o
   questionário desligado não pode depender de binding nenhum. */
interface Env {
  ASSETS: Fetcher;
  BRIEFING?: BriefingPublico;
  BRIEFING_ATIVO?: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

/**
 * A lista de diretivas da política de conteúdo, escrita UMA vez.
 *
 * O site todo a manda como política que bloqueia (ver `securityHeaders`), e
 * as rotas do questionário também. Uma constante só é o que garante que as
 * duas nunca divergem.
 */
const DIRETIVAS_CSP = [
  "default-src 'self'",
  /* `static.cloudflareinsights.com` NÃO É SCRIPT NOSSO, e é por isso que ele
     precisa estar escrito aqui.

     A borda da Cloudflare injeta `<script src="https://static.cloudflareinsights
     .com/beacon.min.js/...">` em TODA resposta HTML deste site. Ele não passa
     pelo repositório, não aparece em nenhum arquivo do projeto e não some com
     build nenhum: quem o coloca é a camada que hospeda, depois de o worker já
     ter respondido.

     Medido em 09/09/2026: ele **só** aparece quando a página é pedida com o
     cabeçalho `accept: text/html`. Auditoria por `curl` seco não vê a tag, e
     foi por isso que ele passou meses sem ser notado.

     Sem esta linha, `script-src 'self'` bloqueia o beacon, e com a política
     valendo isso mata a analítica EM SILÊNCIO, sem erro visível para quem
     publicou. É por esta linha que a analítica continua viva.

     `connect-src` leva `cloudflareinsights.com` (sem o `static.`) como rede de
     segurança. Medido em 25/09/2026 nos dois motores: com o `version` que a
     borda põe no snippet, a medição sai por POST para `/cdn-cgi/rum` na
     própria origem, que o `'self'` cobre. Um snippet sem `version` mandaria
     para `cloudflareinsights.com`, e a borda troca o snippet sem passar por
     este repositório. */
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://cloudflareinsights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders: Record<string, string> = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  /* Um ano. Começou em um dia, em 2026-08-10, de propósito: quem memoriza
     esta ordem é o navegador do visitante, não o servidor, e parar de enviar
     o cabeçalho **não** apaga a memória de quem já recebeu. O prazo curto era
     rede de segurança enquanto o redirecionamento não estava comprovado.

     Subiu para um ano em 2026-08-17, depois de uma semana no ar e de 20 em 20
     amostras dos quatro sites respondendo 301 em HTTP puro e 200 em HTTPS.

     Sem `includeSubDomains` e sem `preload`, e as duas ausências são decisão.
     O primeiro estenderia a regra a todo subdomínio abaixo deste host,
     inclusive os que ainda não existem. O segundo é irreversível na prática:
     sai de uma lista embutida no navegador, não de um cabeçalho que a gente
     controla, e voltar atrás leva meses. */
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  /* A POLÍTICA VALE, e bloqueia. Ela passou de relatório para valendo em
     25/09/2026, depois de uma conferência em
     produção nas seis rotas e nos 404, em Chromium e WebKit, no computador e
     no celular, com a política simulada valendo: zero violação, analítica
     saindo, o ponteiro baixando e as ilustrações animando. Relatório sem
     `report-to` também não trazia dado nenhum, e o WebKit escrevia um erro de
     console em toda página por causa dele (era o que derrubava a varredura de
     Safari do GitHub desde 14/09).

     `'unsafe-inline'` em script e estilo enquanto o vinext não emitir nonce: a
     página traz o payload RSC, o JSON-LD e a linha da classe `tem-js` como
     script embutido, e há atributos `style=` na marcação.

     Nenhum bundle publicado fala com origem de fora. As duas exceções em
     `script-src` e `connect-src` são da própria borda que hospeda o site, e
     estão explicadas onde aparecem. `form-action` não alcança o formulário de
     contato, que faz `preventDefault` e abre o WhatsApp por `window.open`.

     AGORA ELA BLOQUEIA: ligar Rocket Loader, Email Obfuscation, Zaraz ou
     Turnstile na zona da Cloudflare, ou acrescentar script, fonte ou imagem de
     outra origem, exige rever esta lista ANTES, senão a peça nova some em
     silêncio. As rotas do questionário usam a mesma lista, com mais
     cabeçalhos próprios: ver `comCabecalhosDoBriefing`. */
  "Content-Security-Policy": DIRETIVAS_CSP,
};

/* Arquivos de configuração da Cloudflare que não são página: sem esta lista,
   `/_headers` cai no renderizador e responde 200 com corpo vazio e sem
   Content-Type, o que é resposta incoerente que scanner marca e cache guarda. */
const CAMINHOS_DE_CONFIGURACAO = new Set(["/_headers", "/_redirects", "/.assetsignore"]);

/**
 * AS SEIS PÁGINAS QUE EXISTEM DE FATO. Tudo que não estiver aqui é 404.
 *
 * A lista existe porque o app ganhou rota coringa em 09/09/2026, para servir
 * a página de erro com a cara do site nos três idiomas. Rota coringa que
 * responde 200 é um **soft 404**: o buscador trata endereço inexistente como
 * conteúdo válido e o indexa. É a regra 9.3 do protocolo.
 *
 * **Por que o ajuste mora aqui e não no app.** No vinext, `notFound()` com
 * `app/not-found.tsx` acerta o código HTTP e PERDE os metadados: nem
 * `metadata` nem `generateMetadata` daquele arquivo são aplicados, e a página
 * sai com o título e o `index, follow` do layout. Escrever `<title>` no JSX
 * também não resolve, porque as do layout continuam lá e o navegador usa a
 * primeira. A saída que funciona, e que o Nascente já usa, é esta: a rota
 * coringa responde 200 com a página certa e o worker troca o código.
 *
 * **Esta lista e as rotas do app são duas fontes da mesma verdade.** Página
 * nova no app precisa ser acrescentada aqui, senão ela nasce respondendo 404
 * com o conteúdo certo, que é o pior dos dois mundos. Há teste cobrando as
 * seis em 200 e caminhos inválidos em 404.
 *
 * **As três páginas do questionário ficam de fora de propósito.** Elas não são
 * página pública: o código delas (200, 404, 410 ou 503) é decidido antes, pelo
 * bloco do briefing, a partir do que o painel responde para a chave. Pôr
 * `/briefing` aqui faria o endereço sem chave responder 200.
 */
const ROTAS_QUE_EXISTEM = new Set([
  "/",
  "/privacidade",
  "/en",
  "/en/privacy",
  "/es",
  "/es/privacidad",
]);

function ehRotaQueExiste(pathname: string): boolean {
  /* A barra final é normalizada por precaução, não por necessidade: medido,
     `/en/`, `/es/` e `/privacidade/` respondem **308** para a versão sem
     barra, e o 308 sai do próprio vinext antes de chegar aqui. Esta linha
     custa nada e evita que uma mudança futura naquele redirecionamento
     transforme as seis páginas de verdade em 404 com o conteúdo certo, que é
     o tipo de defeito que ninguém procura. */
  const semBarraFinal = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return ROTAS_QUE_EXISTEM.has(semBarraFinal);
}

/**
 * Troca 200 por 404 quando o caminho não existe, preservando corpo e
 * cabeçalhos.
 *
 * As três condições são todas necessárias, e cada uma protege uma coisa:
 *
 * - **status 200**: redirecionamento e erro já saem com o código deles.
 * - **`text/html`**: o cartão de link (`image/png`), o `robots.txt`
 *   (`text/plain`), o sitemap (`application/xml`) e o payload RSC
 *   (`text/x-component`) não são página e não podem virar 404 por morarem
 *   fora da lista.
 * - **fora da lista**: as seis páginas de verdade passam intactas.
 */
function comCodigoDeNaoEncontrado(resposta: Response): Response {
  return new Response(resposta.body, {
    status: 404,
    statusText: resposta.statusText,
    headers: resposta.headers,
  });
}

function naoEncontrado(): Response {
  return withSecurityHeaders(
    new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    }),
  );
}

/**
 * Descobre se a requisição chegou sem criptografia.
 *
 * Duas fontes porque errar aqui derruba o site: dizer "é http" numa
 * requisição que já é HTTPS faz o worker redirecionar para um endereço que
 * ele vai julgar http de novo — laço infinito, site fora do ar.
 *
 * `CF-Visitor` tem prioridade sobre o endereço: numa borda que já terminou o
 * TLS, a URL chega como https mesmo quando o visitante veio de http.
 *
 * `localhost` fica **de fora**, e não é detalhe: o desenvolvimento roda em
 * `http://localhost:5180` e os testes chamam o worker com `http://localhost`.
 * Sem esta saída, todo `npm run dev` viraria um redirecionamento para um
 * HTTPS que não existe na máquina.
 */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

/** O domínio do site, sem `www`. Ver o redirecionamento dentro de `fetch`. */
const APEX = "varandaestudioweb.com";

function arrivedWithoutTls(request: Request, url: URL): boolean {
  if (LOCAL_HOSTS.has(url.hostname) || url.hostname.endsWith(".local")) return false;

  const visitor = request.headers.get("CF-Visitor");
  if (visitor) {
    try {
      return JSON.parse(visitor).scheme === "http";
    } catch {
      /* Cabeçalho ilegível: cai para o endereço, abaixo. */
    }
  }
  return url.protocol === "http:";
}

function withSecurityHeaders(response: Response): Response {
  const securedResponse = new Response(response.body, response);
  for (const [name, value] of Object.entries(securityHeaders)) {
    securedResponse.headers.set(name, value);
  }
  return securedResponse;
}

/* ==========================================================================
   O QUESTIONÁRIO DE PROJETO: `/briefing?chave=...` (e `/es/`, `/en/`) e
   `/api/briefing?chave=...`. Especificação em
   `estudio/briefing-proprio/ESPEC.md`, seções 3.1 a 3.4.

   Quem fala com o painel é SÓ este arquivo. A página recebe o resultado num
   cabeçalho interno (ver `app/briefing/contexto.ts`), e nenhum arquivo de
   `app/` importa `cloudflare:workers`, porque os testes importam o build no
   Node e o Node recusa aquele esquema de import.
   ========================================================================== */

/**
 * Tira da requisição o cabeçalho que só este Worker pode escrever.
 *
 * Vale para TODA requisição, e não só para as rotas do questionário, porque
 * existe mais de um endereço que chega à mesma página: o roteador do vinext
 * decodifica o caminho antes de casar a rota, e `/%62riefing` vira
 * `/briefing` lá dentro sem passar pelo bloco abaixo, que olha o caminho como
 * ele chega. Sem esta limpeza, quem mandasse o cabeçalho pronto por um desses
 * caminhos escolheria o estado e o contexto que a página desenha.
 *
 * A requisição que chega é imutável, daí a cópia.
 */
function semCabecalhoInterno(request: Request): Request {
  const limpa = new Request(request);
  limpa.headers.delete(CABECALHO_BRIEFING);
  return limpa;
}

/* A regex é a da ESPEC 3.2, com o `.rsc`: o vinext pede a mesma rota com esse
   sufixo na navegação do cliente e no `router.refresh()`, e sem ele aqui o
   pedido cairia no caminho genérico sem o estado. */
const PAGINA_DO_BRIEFING = /^\/(?:(es|en)\/)?briefing(\.rsc)?$/;
const API_DO_BRIEFING = "/api/briefing";

type RotaDoBriefing = { tipo: "pagina"; locale: Locale } | { tipo: "api" };

function rotaDoBriefing(pathname: string): RotaDoBriefing | null {
  if (pathname === API_DO_BRIEFING) return { tipo: "api" };
  const achado = PAGINA_DO_BRIEFING.exec(pathname);
  if (!achado) return null;
  return { tipo: "pagina", locale: (achado[1] ?? "pt") as Locale };
}

/**
 * Os cabeçalhos das rotas do questionário, aplicados DEPOIS dos do site.
 *
 * - `private, no-store`: a página e a API levam dado de uma empresa só. Nada
 *   aqui pode ficar em cache compartilhado nem no disco do navegador.
 * - `X-Robots-Tag`: além da meta na head, que não existe na resposta da API.
 * - `no-referrer` no lugar do `strict-origin-when-cross-origin` do site: o
 *   endereço da página carrega a chave, e nenhum link que sai daqui (o do
 *   WhatsApp, por exemplo) pode levá-la junto.
 * - A política de conteúdo BLOQUEIA aqui, com a mesma lista do site. As
 *   rotas do questionário nasceram bloqueando antes do resto do site (em modo
 *   relatório, um script injetado levaria as respostas para qualquer origem);
 *   desde 25/09/2026 o site inteiro bloqueia também, e as duas linhas abaixo
 *   ficam para esta garantia não depender do que o site faz.
 */
function comCabecalhosDoBriefing(resposta: Response): Response {
  const saida = withSecurityHeaders(resposta);
  saida.headers.set("Cache-Control", "private, no-store");
  saida.headers.set("X-Robots-Tag", "noindex, nofollow");
  saida.headers.set("Referrer-Policy", "no-referrer");
  saida.headers.delete("Content-Security-Policy-Report-Only");
  saida.headers.set("Content-Security-Policy", DIRETIVAS_CSP);
  return saida;
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/* O painel guarda o rascunho como texto JSON. O contrato diz que ele chega
   como objeto, mas conferir custa uma linha. */
function comoObjeto(valor: unknown): Record<string, unknown> {
  if (typeof valor === "string") {
    try {
      valor = JSON.parse(valor);
    } catch {
      return {};
    }
  }
  return ehObjeto(valor) ? valor : {};
}

function textoOuNulo(valor: unknown): string | null {
  return typeof valor === "string" ? valor : null;
}

/**
 * O que pode ir para o log quando uma chamada ao painel falha.
 *
 * Só o tipo e a mensagem do erro, curtos, e com a chave apagada caso o erro a
 * traga: o log do Worker fica guardado na Cloudflare e a chave é a senha do
 * questionário. O corpo da requisição nunca chega aqui.
 */
function mensagemSegura(erro: unknown, chave: string): string {
  const bruta = erro instanceof Error ? `${erro.name}: ${erro.message}` : typeof erro;
  const limpa = chave ? bruta.split(chave).join("[chave]") : bruta;
  return limpa.slice(0, 200);
}

const ESTADOS_DO_PAINEL = ["invalido", "encerrado", "vencido", "fechado", "aberto", "enviado"];

/**
 * `abrir` com a rede de segurança da ESPEC: exceção, binding ausente ou
 * resposta fora do contrato 1 devolvem null, e quem chama responde 503.
 */
async function abrirNoPainel(env: Env, chave: string, marcar: boolean): Promise<Record<string, unknown> | null> {
  let bruto: unknown;
  try {
    if (!env.BRIEFING) throw new Error("binding BRIEFING ausente");
    bruto = await env.BRIEFING.abrir(chave, { marcar });
  } catch (erro) {
    console.error("briefing: abrir falhou", mensagemSegura(erro, chave));
    return null;
  }
  if (ehObjeto(bruto) && bruto.contrato === 1 && ESTADOS_DO_PAINEL.includes(bruto.estado as string)) {
    /* Em aberto e enviado a revisão é a trava otimista: sem ela não há como
       gravar sem apagar o que outro aparelho gravou. */
    const editavel = bruto.estado === "aberto" || bruto.estado === "enviado";
    const revisao = bruto.revisao;
    if (!editavel || (typeof revisao === "number" && Number.isInteger(revisao) && revisao >= 0)) return bruto;
  }
  console.error("briefing: abrir falhou", "resposta fora do contrato 1");
  return null;
}

async function salvarNoPainel(env: Env, chave: string, dados: unknown): Promise<Record<string, unknown> | null> {
  try {
    if (!env.BRIEFING) throw new Error("binding BRIEFING ausente");
    /* A cópia por JSON NÃO é enfeite. O RPC do workerd só serializa objeto de
       protótipo `Object` (ou `Array`), e o saneamento cria as respostas com
       `Object.create(null)` de propósito, para `__proto__` vindo do navegador
       não trocar protótipo de nada (ver `nucleo.ts`). Sem a cópia, a chamada
       lança `DataCloneError` antes de chegar ao painel e TODA gravação vira
       503: foi o que a revisão ponta a ponta de 25/09/2026 achou, com os dois
       Workers ligados por binding de verdade. No Node o `structuredClone`
       aceita objeto sem protótipo, e por isso o painel falso dos testes
       precisa recusar como o workerd recusa. */
    const resultado = await env.BRIEFING.salvar(chave, JSON.parse(JSON.stringify(dados)));
    if (ehObjeto(resultado)) return resultado;
    console.error("briefing: salvar falhou", "resposta fora do contrato 1");
  } catch (erro) {
    console.error("briefing: salvar falhou", mensagemSegura(erro, chave));
  }
  return null;
}

/* ---------- A página ---------- */

/**
 * A página de erro do site, no idioma da rota, com 404 de verdade.
 *
 * É a mesma que qualquer endereço inexistente recebe: renderiza
 * `/briefing/nao-existe` (ou `/es/...`, `/en/...`), que cai na coringa do
 * idioma, e troca o código. Sempre em HTML, mesmo quando o pedido era `.rsc`:
 * o cliente do vinext, ao receber resposta que não é 200 num pedido `.rsc`,
 * navega de verdade para o endereço sem o sufixo, e aí recebe este HTML.
 */
async function paginaDeErro(url: URL, locale: Locale, env: Env, ctx: ExecutionContext): Promise<Response> {
  const destino = new URL(`${enderecoDaPagina(locale)}/nao-existe`, url.origin);
  const resposta = await handler.fetch(new Request(destino, { headers: { accept: "text/html" } }), env, ctx);
  return comCodigoDeNaoEncontrado(resposta);
}

/**
 * Renderiza a página do questionário com o estado no cabeçalho interno.
 *
 * O app responde 200 e quem decide o código é o Worker (410, 503), como na
 * página de erro. Redirecionamento ou erro do próprio render passam como
 * vieram.
 */
async function renderizarComEstado(
  request: Request,
  dados: DadosDaPagina,
  status: number,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const pedido = new Request(request);
  pedido.headers.set(CABECALHO_BRIEFING, codificarCabecalho(dados));
  const resposta = await handler.fetch(pedido, env, ctx);
  return new Response(resposta.body, {
    status: resposta.status === 200 ? status : resposta.status,
    headers: resposta.headers,
  });
}

async function atenderPagina(request: Request, url: URL, locale: Locale, env: Env, ctx: ExecutionContext): Promise<Response> {
  const metodo = request.method.toUpperCase();
  if (metodo !== "GET" && metodo !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  /* Chave fora do formato não chega ao painel: é 404 direto, com a página de
     erro. Economiza uma chamada por tentativa às cegas. */
  const chave = url.searchParams.get("chave");
  if (chave === null || !REGEX_CHAVE.test(chave)) return paginaDeErro(url, locale, env, ctx);

  /* `marcar: false`: a prévia de link do WhatsApp e os filtros de e-mail fazem
     GET nesta URL sem ninguém ter aberto. Quem marca a abertura é o
     JavaScript da página, pela API. */
  const aberto = await abrirNoPainel(env, chave, false);
  if (aberto === null) {
    const fora = await renderizarComEstado(
      request,
      { estado: "fora_do_ar", chave, contexto: null, inicial: null, enviado_em: null },
      503,
      env,
      ctx,
    );
    fora.headers.set("Retry-After", "300");
    return fora;
  }

  /* O idioma da página é o da URL, mesmo quando o link foi gerado em outro:
     quem abriu `/en/briefing` com um link em português lê em inglês, sem
     redirecionamento. O do link continua no contexto, para a leitura. */
  switch (aberto.estado) {
    case "invalido":
      return paginaDeErro(url, locale, env, ctx);
    case "encerrado":
    case "vencido":
      return renderizarComEstado(
        request,
        { estado: aberto.estado, chave, contexto: null, inicial: null, enviado_em: null },
        410,
        env,
        ctx,
      );
    case "fechado":
      return renderizarComEstado(
        request,
        { estado: "fechado", chave, contexto: normalizarContexto(aberto.contexto), inicial: null, enviado_em: null },
        200,
        env,
        ctx,
      );
    default: {
      const contexto = normalizarContexto(aberto.contexto);
      const rascunho = comoObjeto(aberto.respostas);
      /* A volta do envio sem JavaScript recusado (ver `enviarSemJavaScript`).
         A lista sai do rascunho que o painel acabou de devolver, com a mesma
         régua do envio; o `?faltam=1` só pede para mostrar, e quem monta a
         URL à mão vê no máximo a verdade sobre o próprio rascunho. O "Outro"
         sem o "Qual?" vai como a chave do campo aberto, para o link levar a
         ele e não às opções. */
      const faltam =
        url.searchParams.get("faltam") === "1" ? obrigatoriasEmBranco(rascunho, contexto).map((id) => chaveDoQueFalta(id, rascunho, contexto)) : null;
      /* O que o HTML pode trazer preenchido do contexto (o nome da empresa):
         só as perguntas que o rascunho ainda não tem. Com a chave no
         rascunho o campo nasce vazio, que no envio sem JavaScript quer dizer
         "não mexi", e o valor salvo fica. */
      const prefill = prefillDoServidor(rascunho, contexto);
      return renderizarComEstado(
        request,
        {
          estado: aberto.estado as "aberto" | "enviado",
          chave,
          contexto,
          inicial: normalizarInicial(aberto.inicial),
          enviado_em: textoOuNulo(aberto.enviado_em),
          ...(faltam?.length ? { faltam } : {}),
          ...(prefill.length ? { prefill } : {}),
        },
        200,
        env,
        ctx,
      );
    }
  }
}

/* ---------- A API ---------- */

/* 256 KB de corpo. As respostas saneadas têm teto próprio de 128 KB (o do
   painel), medido depois; este é o teto da leitura do corpo, que protege a
   memória do isolate antes de qualquer parse. */
const TETO_DO_CORPO = 262144;

function respostaJson(status: number, corpo: unknown, extras: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extras },
  });
}

/* Mesmo Retry-After da página fora do ar: o formulário espera por ele antes
   de tentar de novo, com o rascunho guardado no aparelho. */
function indisponivel(): Response {
  return respostaJson(503, { erro: "indisponivel" }, { "Retry-After": "300" });
}

function erroDoEstado(estado: unknown): Response | null {
  if (estado === "invalido") return respostaJson(404, { erro: "chave" });
  if (estado === "encerrado" || estado === "vencido" || estado === "fechado") return respostaJson(410, { erro: estado });
  return null;
}

/**
 * A mesma origem, conferida pelos dois cabeçalhos que o navegador escreve.
 *
 * É defesa a mais: não há cookie nem sessão, então só grava quem tem a chave.
 *
 * **`Origin: null` passa quando `Sec-Fetch-Site` diz `same-origin`, e só
 * assim.** Medido em 25/09/2026 no Chromium 153 e no WebKit 26.6: com a
 * página em `Referrer-Policy: no-referrer`, o POST do formulário nativo (o
 * envio sem JavaScript) sai com `Origin: null`, e é o que a especificação do
 * Fetch manda fazer. O `fetch` do JavaScript manda a origem de verdade. Pela
 * regra literal (Origin diferente da origem do pedido), todo envio sem
 * JavaScript levaria 403. `Sec-Fetch-Site` não depende da política de
 * referência e diz `same-origin` nos dois casos.
 */
function origemAceita(request: Request, url: URL): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site !== null && site !== "same-origin") return false;
  const origem = request.headers.get("origin");
  if (origem === null) return true;
  if (origem === "null") return site === "same-origin";
  return origem === url.origin;
}

function tipoDoCorpo(valor: string | null): "json" | "form" | null {
  const essencia = (valor ?? "").split(";")[0].trim().toLowerCase();
  if (essencia === "application/json") return "json";
  if (essencia === "application/x-www-form-urlencoded") return "form";
  return null;
}

/**
 * Lê o corpo contando bytes, e para no teto.
 *
 * `request.json()` num corpo sem Content-Length lê tudo para a memória antes
 * de qualquer medida, e o isolate tem 128 MB. Aqui o Content-Length declarado
 * acima do teto nem começa a ser lido, e o que chega sem ele é cortado no
 * primeiro pedaço que passar do teto.
 */
async function lerCorpo(request: Request, teto: number): Promise<{ texto: string } | { erro: "tamanho" | "json" }> {
  const declarado = request.headers.get("content-length");
  if (declarado !== null && /^\d+$/.test(declarado.trim()) && Number(declarado) > teto) return { erro: "tamanho" };
  if (request.body === null) return { texto: "" };

  const leitor = request.body.getReader();
  const pedacos: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    total += value.byteLength;
    if (total > teto) {
      await leitor.cancel().catch(() => {});
      return { erro: "tamanho" };
    }
    pedacos.push(value);
  }
  const bytes = new Uint8Array(total);
  let posicao = 0;
  for (const pedaco of pedacos) {
    bytes.set(pedaco, posicao);
    posicao += pedaco.byteLength;
  }
  try {
    return { texto: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { erro: "json" };
  }
}

/* `?idioma=` diz em que idioma a página estava (ver `enderecoDaApi` em
   `app/briefing/contexto.ts`). Sem ele, vale o idioma do link. */
function idiomaDaPagina(url: URL, contexto: Contexto): Locale {
  const pedido = url.searchParams.get("idioma");
  return ehLocale(pedido) ? pedido : contexto.idioma;
}

function erroDeSaneamento(erro: { erro: string; campo: string }): Response {
  if (erro.erro === "json") return respostaJson(400, { erro: "json" });
  /* Texto acima do limite NÃO é cortado: o trecho cortado seria justamente o
     literal que depois não se pode inventar. O formulário mostra no campo. */
  return respostaJson(422, { erro: erro.erro, campo: erro.campo });
}

/* O painel devolve segundos. Fora de uma faixa razoável, um minuto. */
function segundosDeEspera(valor: unknown): string {
  return typeof valor === "number" && Number.isInteger(valor) && valor > 0 && valor <= 86400 ? String(valor) : "60";
}

/** O resultado do `salvar`, no contrato de erro da API (ESPEC 3.2). */
function respostaDoSalvar(resultado: Record<string, unknown> | null): Response {
  if (resultado === null) return indisponivel();
  if (resultado.ok === true) {
    return respostaJson(200, {
      ok: true,
      revisao: resultado.revisao,
      salvo_em: textoOuNulo(resultado.salvo_em),
      enviado_em: textoOuNulo(resultado.enviado_em),
      envios: resultado.envios,
    });
  }
  switch (resultado.motivo) {
    case "conflito":
      return respostaJson(409, { erro: "conflito", revisao: resultado.revisao, respostas: comoObjeto(resultado.respostas) });
    case "limite":
      return respostaJson(429, { erro: "limite" }, { "Retry-After": segundosDeEspera(resultado.retry_after) });
    case "tamanho":
      return respostaJson(413, { erro: "tamanho" });
    case "invalido":
      return respostaJson(404, { erro: "chave" });
    case "encerrado":
    case "vencido":
    case "fechado":
      return respostaJson(410, { erro: resultado.motivo });
    default:
      console.error("briefing: salvar falhou", "motivo fora do contrato 1");
      return indisponivel();
  }
}

/** GET: o rascunho e o contexto, para o JavaScript da página. */
async function lerRascunho(env: Env, chave: string): Promise<Response> {
  /* `marcar: true` só aqui: prévia de link não roda JavaScript, então esta
     chamada é sinal de que uma pessoa abriu a página. */
  const aberto = await abrirNoPainel(env, chave, true);
  if (aberto === null) return indisponivel();
  const erro = erroDoEstado(aberto.estado);
  if (erro) return erro;
  /* Lista fechada de campos, sem `contrato`: o que o painel acrescentar ao
     contrato no futuro não sai para a internet sem passar por aqui. */
  return respostaJson(200, {
    estado: aberto.estado,
    contexto: normalizarContexto(aberto.contexto),
    inicial: normalizarInicial(aberto.inicial),
    respostas: comoObjeto(aberto.respostas),
    revisao: aberto.revisao,
    salvo_em: textoOuNulo(aberto.salvo_em),
    enviado_em: textoOuNulo(aberto.enviado_em),
    envios: aberto.envios,
  });
}

/**
 * PUT (rascunho) e POST em JSON (envio), vindos do JavaScript da página.
 * Corpo: `{ respostas, revisao_base, final }`.
 *
 * `final` sai do MÉTODO: PUT nunca envia e POST sempre envia. Se o corpo
 * trouxer `final` contrariando o método, é 400, para o erro aparecer no
 * formulário em vez de virar um envio que ninguém pediu (ou um que não saiu).
 */
async function gravarJson(env: Env, chave: string, texto: string, final: boolean, url: URL): Promise<Response> {
  let corpo: unknown;
  try {
    corpo = JSON.parse(texto);
  } catch {
    return respostaJson(400, { erro: "json" });
  }
  if (!ehObjeto(corpo)) return respostaJson(400, { erro: "json" });
  const revisaoBase = corpo.revisao_base;
  if (typeof revisaoBase !== "number" || !Number.isInteger(revisaoBase) || revisaoBase < 0) return respostaJson(400, { erro: "json" });
  if (Object.hasOwn(corpo, "final") && corpo.final !== final) return respostaJson(400, { erro: "json" });

  const aberto = await abrirNoPainel(env, chave, false);
  if (aberto === null) return indisponivel();
  const erro = erroDoEstado(aberto.estado);
  if (erro) return erro;

  const contexto = normalizarContexto(aberto.contexto);
  const saneado = sanear(corpo.respostas, contexto);
  if ("erro" in saneado) return erroDeSaneamento(saneado);

  /* O envio final não sai com obrigatória visível em branco (26/09/2026),
     pela mesma régua do Revisar e da trava de cada etapa. O rascunho (PUT)
     continua aceitando resposta parcial: é assim que se para no meio e volta
     depois. Com JavaScript isto é rede, porque o Revisar já trava o Enviar;
     o formulário leva a lista para lá. */
  if (final) {
    const ids = obrigatoriasEmBranco(saneado.respostas, contexto);
    if (ids.length) return respostaJson(422, { erro: "faltam", ids });
  }

  const leitura = montarLeitura(saneado.respostas, contexto, aberto.inicial, idiomaDaPagina(url, contexto));
  /* Os dois tetos do painel, medidos aqui antes da chamada: sem isso o painel
     recusaria depois do clique em Enviar. */
  if (excedeTeto(saneado.respostas, leitura)) return respostaJson(413, { erro: "tamanho" });

  const resultado = await salvarNoPainel(env, chave, {
    respostas: saneado.respostas,
    leitura,
    versao: VERSAO,
    final,
    revisao_base: revisaoBase,
  });
  return respostaDoSalvar(resultado);
}

/**
 * POST urlencoded: o envio do formulário nativo, sem JavaScript.
 *
 * A página sem JavaScript não mostra o que já estava salvo, então campo em
 * branco aqui quer dizer "não mexi", nunca "apague": o Worker busca o
 * rascunho, JUNTA o que chegou por cima dele e envia. Múltipla chega como a
 * mesma chave repetida e é lida com `getAll` (dentro de `sanearUrlencoded`).
 *
 * Sem trava otimista de verdade: quem envia sem JavaScript não tem como
 * resolver conflito. Se outro aparelho gravar no meio, junta de novo sobre a
 * versão nova, até três vezes.
 */
async function enviarSemJavaScript(env: Env, chave: string, texto: string, url: URL): Promise<Response> {
  const params = new URLSearchParams(texto);

  const aberto = await abrirNoPainel(env, chave, false);
  if (aberto === null) return indisponivel();
  const erro = erroDoEstado(aberto.estado);
  if (erro) return erro;

  const contexto = normalizarContexto(aberto.contexto);
  const saneado = sanearUrlencoded(params, contexto);
  if ("erro" in saneado) return erroDeSaneamento(saneado);
  const locale = idiomaDaPagina(url, contexto);

  let base: unknown = comoObjeto(aberto.respostas);
  let revisao = aberto.revisao as number;
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const respostas: Respostas = juntar(base, saneado.respostas, contexto);
    const leitura = montarLeitura(respostas, contexto, aberto.inicial, locale);
    if (excedeTeto(respostas, leitura)) return respostaJson(413, { erro: "tamanho" });

    /* Obrigatória em branco DEPOIS de juntar com o rascunho (o que já estava
       salvo conta): o envio é recusado, mas o que chegou não se perde. Vai
       como RASCUNHO, e o 303 volta para a página com `?faltam=1`, que
       mostra a lista do que falta no idioma da página, com um link para cada
       pergunta. Antes disto, erro sem JavaScript era JSON cru numa página em
       branco; o `required` nativo foi considerado e recusado (ver o
       comentário do `<form>` em `formulario.tsx`). */
    const final = obrigatoriasEmBranco(respostas, contexto).length === 0;
    const resultado = await salvarNoPainel(env, chave, { respostas, leitura, versao: VERSAO, final, revisao_base: revisao });
    if (resultado?.ok === true) {
      /* 303 para a página, que troca o POST por GET: recarregar a tela de
         recebido não reenvia. A tela sai do `enviado_em` do servidor; o
         `enviado=1` sozinho não mostra nada (ver `decidirTela`). */
      return new Response(null, {
        status: 303,
        headers: { Location: `${enderecoDaPagina(locale)}?chave=${chave}&${final ? "enviado" : "faltam"}=1` },
      });
    }
    if (resultado?.motivo === "conflito" && typeof resultado.revisao === "number" && Number.isInteger(resultado.revisao)) {
      base = comoObjeto(resultado.respostas);
      revisao = resultado.revisao;
      continue;
    }
    return respostaDoSalvar(resultado);
  }
  return respostaJson(409, { erro: "conflito" });
}

async function atenderApi(request: Request, url: URL, env: Env): Promise<Response> {
  const metodo = request.method.toUpperCase();
  if (metodo !== "GET" && metodo !== "PUT" && metodo !== "POST") {
    return respostaJson(405, { erro: "metodo" }, { Allow: "GET, PUT, POST" });
  }
  if (metodo !== "GET" && !origemAceita(request, url)) return respostaJson(403, { erro: "origem" });

  const chave = url.searchParams.get("chave");
  if (chave === null || !REGEX_CHAVE.test(chave)) return respostaJson(404, { erro: "chave" });
  if (metodo === "GET") return lerRascunho(env, chave);

  /* PUT é só do JavaScript, então só JSON. POST aceita também o formulário
     nativo. Multipart e texto puro ficam de fora. */
  const tipo = tipoDoCorpo(request.headers.get("content-type"));
  if (tipo === null || (metodo === "PUT" && tipo !== "json")) return respostaJson(415, { erro: "tipo" });

  const corpo = await lerCorpo(request, TETO_DO_CORPO);
  if ("erro" in corpo) return corpo.erro === "tamanho" ? respostaJson(413, { erro: "tamanho" }) : respostaJson(400, { erro: "json" });

  if (tipo === "form") return enviarSemJavaScript(env, chave, corpo.texto, url);
  return gravarJson(env, chave, corpo.texto, metodo === "POST", url);
}

/**
 * As rotas do questionário, com o questionário LIGADO.
 *
 * Um try/catch próprio porque o genérico, lá embaixo, registra a exceção
 * inteira no log, e aqui a mensagem pode trazer a chave.
 */
async function atenderBriefing(rota: RotaDoBriefing, request: Request, url: URL, env: Env, ctx: ExecutionContext): Promise<Response> {
  try {
    const resposta = rota.tipo === "api" ? await atenderApi(request, url, env) : await atenderPagina(request, url, rota.locale, env, ctx);
    return comCabecalhosDoBriefing(resposta);
  } catch (erro) {
    console.error("briefing: erro inesperado", mensagemSegura(erro, url.searchParams.get("chave") ?? ""));
    return comCabecalhosDoBriefing(
      new Response("Erro interno.", { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } }),
    );
  }
}

const worker = {
  async fetch(pedidoQueChegou: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    /* Primeira linha de propósito: o cabeçalho interno do questionário sai de
       TODA requisição antes de qualquer outra coisa. Ver `semCabecalhoInterno`. */
    const request = semCabecalhoInterno(pedidoQueChegou);
    const url = new URL(request.url);

    /* Antes de qualquer coisa: HTTP puro não entrega página.
       Sem isto o site respondia 200 em texto aberto — HTML inteiro numa
       conexão que qualquer um na mesma rede lê e altera. O HSTS acima só
       protege da segunda visita em diante; esta é a primeira. */
    if (arrivedWithoutTls(request, url)) {
      const secure = new URL(url);
      secure.protocol = "https:";
      return new Response(null, {
        status: 301,
        headers: { Location: secure.toString(), "Strict-Transport-Security": "max-age=31536000" },
      });
    }

    /* O apex é o único endereço publicado. Enquanto o registro `www` não
       existir no DNS, esta linha não é alcançada por ninguém; ela fica escrita
       para que, no dia em que o registro for criado, o endereço já chegue no
       lugar certo em vez de servir uma segunda cópia do site. */
    if (url.hostname === `www.${APEX}`) {
      const apex = new URL(url);
      apex.hostname = APEX;
      return new Response(null, { status: 301, headers: { Location: apex.toString() } });
    }

    if (CAMINHOS_DE_CONFIGURACAO.has(url.pathname)) return naoEncontrado();

    const rotaBriefing = rotaDoBriefing(url.pathname);

    /* Exceção no render sai como página de erro da Cloudflare, em texto puro e
       sem nenhum cabeçalho do site. Com o try/catch a resposta continua nossa.
       Sem detalhe da exceção no corpo: quem precisa dele é o log. */
    try {
      /* O questionário só existe com `BRIEFING_ATIVO` igual a "1". Desligado,
         as rotas dele respondem 404 como qualquer endereço inexistente, e o
         painel nem é chamado: é o que deixa o site ir ao ar antes do painel
         (a ordem está no comentário de `vars`, no `wrangler.jsonc`).

         A página precisa ser desviada à mão porque o arquivo dela existe no
         app e renderizaria. A API não tem arquivo no app, então segue o
         caminho genérico e cai na coringa, exatamente como `/qualquer-coisa`. */
      if (rotaBriefing && env.BRIEFING_ATIVO === "1") return await atenderBriefing(rotaBriefing, request, url, env, ctx);
      if (rotaBriefing?.tipo === "pagina") return withSecurityHeaders(await paginaDeErro(url, rotaBriefing.locale, env, ctx));

      const resposta = await handler.fetch(request, env, ctx);

      /* A rota coringa devolve a página de erro com 200; aqui ela vira 404 de
         verdade. Ver `ROTAS_QUE_EXISTEM` acima. */
      const ehPagina = (resposta.headers.get("content-type") ?? "").includes("text/html");
      if (resposta.status === 200 && ehPagina && !ehRotaQueExiste(url.pathname)) {
        return withSecurityHeaders(comCodigoDeNaoEncontrado(resposta));
      }

      return withSecurityHeaders(resposta);
    } catch (erro) {
      console.error(erro);
      return withSecurityHeaders(
        new Response("Erro interno.", {
          status: 500,
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
        }),
      );
    }
  },
};

export default worker;
