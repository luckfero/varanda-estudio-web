/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const securityHeaders: Record<string, string> = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  /* Um dia, de propósito, e não um ano.
     Quem memoriza esta ordem é o navegador do visitante, não o servidor:
     parar de enviar o cabeçalho **não** apaga a memória de quem já recebeu.
     Com um dia, um erro se resolve sozinho em 24h; com um ano, o visitante
     fica preso à regra por um ano. Subir o prazo é decisão consciente,
     depois de o redirecionamento estar comprovado em produção. */
  "Strict-Transport-Security": "max-age=86400",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

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
        headers: { Location: secure.toString(), "Strict-Transport-Security": "max-age=86400" },
      });
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const imageResponse = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return withSecurityHeaders(imageResponse);
    }

    return withSecurityHeaders(await handler.fetch(request, env, ctx));
  },
};

export default worker;
