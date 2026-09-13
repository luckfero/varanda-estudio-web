/** Ponto de entrada do Worker da Cloudflare. */
import handler from "vinext/server/app-router-entry";

/* Só `ASSETS`. `DB` e `IMAGES` estavam declarados aqui desde o modelo inicial e
   não existiam como binding no `wrangler.jsonc`: a rota `/_vinext/image`
   chamava `env.IMAGES` e derrubava o worker, que respondia 500 sem nenhum dos
   cabeçalhos do site. Nenhuma imagem da página passa por aquela rota. */
interface Env {
  ASSETS: Fetcher;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

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
  /* EM MODO RELATÓRIO, de propósito. Report-Only não bloqueia nada: o
     navegador só anota a violação no console. É o primeiro passo da adoção,
     porque uma política que bloqueia recurso legítimo tira a página do ar sem
     aviso, e este site é a vitrine do estúdio.

     `'unsafe-inline'` em script e estilo enquanto o vinext não emitir nonce: a
     página traz o payload RSC, o JSON-LD e a linha da classe `tem-js` como
     script embutido, e há atributos `style=` na marcação. Sem eles a política
     acusaria a própria página.

     Nenhum bundle publicado fala com origem de fora. As duas exceções em
     `script-src` e `connect-src` são da própria borda que hospeda o site, e
     estão explicadas onde aparecem.
     `form-action` não alcança o formulário de contato, que faz
     `preventDefault` e abre o WhatsApp por `window.open`.

     Para promover a política a bloqueante: navegar as seis rotas com o console
     aberto, conferir zero violação, e trocar o nome do cabeçalho para
     `Content-Security-Policy`. */
  "Content-Security-Policy-Report-Only": [
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

       Sem esta linha, `script-src 'self'` bloqueia o beacon. Em modo relatório
       isso é só ruído no console; no dia em que a política virar obrigatória,
       ela mata a analítica EM SILÊNCIO, sem erro visível para quem publicou.
       Deixar escrito agora é o que separa "a política foi promovida" de "a
       analítica parou e ninguém soube".

       `connect-src` leva `cloudflareinsights.com` (sem o `static.`) porque é
       para lá que o beacon MANDA a medição depois de carregar. São dois hosts
       diferentes e cobrir um só deixa metade do caminho fechada. */
    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://cloudflareinsights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; "),
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

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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

    /* Exceção no render sai como página de erro da Cloudflare, em texto puro e
       sem nenhum cabeçalho do site. Com o try/catch a resposta continua nossa.
       Sem detalhe da exceção no corpo: quem precisa dele é o log. */
    try {
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
