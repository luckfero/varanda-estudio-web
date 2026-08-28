import type { Metadata } from "next";
import AccessibilityEnhancements from "./accessibility-enhancements";
import { caminho, getDicionario, idiomasAlternativos, type Locale, type Pagina } from "./i18n";
import { siteName, siteUrl } from "./site-config";
import StructuredData from "./structured-data";
/* Playfair Display, usada so nos titulos de secao (ver `--serif-titulo` em
 * base.css). Vem por npm e nao de CDN: a regra 9.1 do protocolo proibe fonte
 * de terceiro, e o Vite empacota os arquivos com hash no nome. O navegador so
 * baixa a faixa Unicode que a pagina pedir. */
import "@fontsource-variable/playfair-display/wght.css";
/* O itálico de verdade.
 *
 * Sem esta linha o navegador FABRICA o itálico inclinando o romano, e o
 * resultado é um oblíquo falso: contraste de traço errado, terminais errados,
 * e o "a" de dois andares que a Playfair troca por um de um andar no itálico
 * real simplesmente não aparece.
 *
 * Como se prova: a frase "forma e presença" a 60px mede 464,64px em Playfair
 * normal E 464,64px em Playfair itálico, idênticas. Em fonte com itálico de
 * verdade os dois números diferem. Largura igual é a assinatura do oblíquo
 * sintético.
 *
 * Passou despercebido enquanto só três títulos eram itálicos. Em 25/08/2026 a
 * unificação da serifada arrastou mais onze elementos para cá, incluindo um de
 * 273px na seção sobre, e aí ficou grande demais para ignorar.
 *
 * Custo: 38,8 KB no subconjunto latino, que é o único que os três idiomas
 * baixam. */
import "@fontsource-variable/playfair-display/wght-italic.css";
/* Kode Mono, a tipografia do LOGOTIPO, escolhida em 28/08/2026.
 *
 * Ela desenha o nome "Varanda" no cabeçalho e no rodapé, e nada mais: quem
 * manda no resto continua sendo `--fonte-display` (Playfair, nos títulos),
 * `--fonte-interface` (Geist, no corpo) e `--fonte-mono` (IBM Plex, nas
 * etiquetas). Por isso ela tem token próprio, `--fonte-marca`.
 *
 * Um peso só, o 600. A marca é uma palavra em um tamanho, e importar 400 ou
 * 700 seria mandar arquivo que nenhum elemento pede. Os outros três pesos
 * existem na família e entram no dia em que houver uso escrito para eles.
 *
 * OFL-1.1, livre inclusive para trabalho de cliente. */
import "@fontsource/kode-mono/600.css";
/* IBM Plex Mono, que `--fonte-mono` declara desde o porte da identidade e que
 * NUNCA foi instalada.
 *
 * Até esta linha, as 175 etiquetas do site caíam na monoespacada do sistema:
 * Cascadia no Windows, SF Mono no Mac, outra coisa no Android. Ou seja, a
 * etiqueta mudava de desenho conforme a máquina do visitante, que é o mesmo
 * defeito do glifo de visto achado em 26/08.
 *
 * Dois pesos porque são dois os que a página aplica de fato, medidos no
 * navegador com as dúvidas abertas: 400 em 97 elementos e 500 em 73. */
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./fonts.css";
/* A ordem destes imports E a cascata. Foram partidos em intervalos
   contiguos do arquivo original justamente para que ela permanecesse
   identica — o responsivo por ultimo, que e quem sobrescreve. */
import "./base.css";
import "./header.css";
import "./hero.css";
import "./portfolio.css";
import "./process.css";
import "./about.css";
import "./contact.css";
import "./responsive.css";
import "./accessibility.css";
import "./barra-rolagem.css";

/**
 * O invólucro `<html>`/`<body>`, um por idioma.
 *
 * Existem três layouts raiz, um por grupo de rota, porque **`lang` no
 * `<html>` precisa mudar com o idioma** — é o que faz um leitor de tela
 * trocar de voz e o corretor do navegador parar de sublinhar a página
 * inteira. Um layout único não consegue: ele não sabe qual rota está
 * abaixo dele. Os três chamam este componente, então a cascata de CSS, o
 * `preload` da fonte e os dados estruturados ficam definidos uma vez só.
 */
export default function Raiz({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const t = getDicionario(locale);

  return (
    <html lang={t.htmlLang}>
      <head>
        {/* Sem isto a fonte só é descoberta depois que o CSS é lido, o que
            atrasa o texto final em uma ida e volta de rede. Só a faixa
            latina: é a única que português, espanhol e inglês usam. */}
        <link
          rel="preload"
          href="/fonts/geist/geist-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Antes da primeira pintura, senão a página pula a largura da
            barra nativa. Por classe: sem JavaScript, a nativa fica. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('tem-js')" }} />
      </head>
      <body>
        <StructuredData locale={locale} />
        <AccessibilityEnhancements />
        {children}
        <script src="/barra-rolagem.js" defer />
      </body>
    </html>
  );
}

/**
 * Metadados de uma página em um idioma.
 *
 * O `alternates.languages` sai de `idiomasAlternativos`, gerado a partir da
 * mesma lista de idiomas em todas as rotas: `hreflang` só vale quando todas
 * as versões apontam umas para as outras, e um mapa escrito à mão em seis
 * arquivos diverge na primeira mudança.
 */
export function metadadosDe(locale: Locale, pagina: Pagina): Metadata {
  const t = getDicionario(locale);
  const ehHome = pagina === "home";

  return {
    metadataBase: new URL(siteUrl),
    title: ehHome ? t.meta.title : `${t.meta.privacyTitle} | ${siteName}`,
    description: ehHome ? t.meta.description : t.meta.privacyDescription,
    alternates: {
      canonical: caminho(locale, pagina),
      languages: idiomasAlternativos(pagina),
    },
    ...(ehHome
      ? {
          authors: [{ name: siteName }],
          creator: siteName,
          publisher: siteName,
          robots: {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              "max-image-preview": "large" as const,
              "max-snippet": -1,
              "max-video-preview": -1,
            },
          },
          openGraph: {
            title: siteName,
            description: t.meta.ogDescription,
            url: `${siteUrl}${caminho(locale, pagina)}`,
            siteName,
            locale: t.ogLocale,
            type: "website" as const,
          },
          twitter: {
            card: "summary" as const,
            title: siteName,
            description: t.meta.ogDescription,
          },
        }
      : {}),
    /* O `?v=` não é enfeite. O navegador guarda favicon num índice próprio,
       fora do cache HTTP normal, e ignora `must-revalidate`: quem já visitou
       o site continua vendo o ícone antigo por tempo indeterminado, mesmo
       com Ctrl+F5. Mudar o endereço é o que faz ele buscar de novo.

       **Trocar o desenho do favicon sem subir este número não chega em
       ninguém que já esteve aqui.** v2 = marca do arco, 2026-08-11.

       O número **não sobe** quando só se acrescenta formato, como em
       2026-08-14: o desenho é o mesmo, e o Google prefere endereço de favicon
       estável. Subir aqui obrigaria ele a redescobrir tudo de novo.

       **Por que existe PNG se o SVG já funciona.** Até 2026-08-14 o site
       declarava só o SVG e `/favicon.ico` respondia 404. O resultado de busca
       mostrava o ícone antigo, junto com um título anterior a 10/08 — ou seja,
       o Google não tinha voltado. Os formatos abaixo são seguro barato para o
       caso de o rastreador não usar SVG: ele recomenda ícone quadrado em
       múltiplo de 48px, e `/favicon.ico` é o caminho que todo navegador pede
       sozinho quando nada é declarado.

       Os três PNG são gerados a partir de `public/favicon.svg`, e não de
       `marca/simbolo.svg`: só o primeiro tem o fundo verde arredondado. Se o
       desenho mudar, regerar os quatro juntos e aí sim subir o `?v=`. */
    icons: {
      icon: [
        { url: "/favicon.svg?v=3", type: "image/svg+xml" },
        { url: "/favicon-96.png?v=3", type: "image/png", sizes: "96x96" },
        { url: "/favicon-48.png?v=3", type: "image/png", sizes: "48x48" },
      ],
      shortcut: "/favicon.ico?v=3",
      apple: "/apple-touch-icon.png?v=3",
    },
  };
}
