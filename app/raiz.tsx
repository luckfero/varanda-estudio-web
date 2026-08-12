import type { Metadata } from "next";
import AccessibilityEnhancements from "./accessibility-enhancements";
import { caminho, getDicionario, idiomasAlternativos, type Locale, type Pagina } from "./i18n";
import { siteName, siteUrl } from "./site-config";
import StructuredData from "./structured-data";
/* Playfair Display, a serifada do site.
 *
 * Vem por npm e não de CDN: a regra 9.1 do protocolo proíbe fonte de
 * terceiro, e o Vite empacota estes arquivos com hash no nome, o que resolve
 * cache e caminho de uma vez. É o mesmo caminho do Nascente.
 *
 * `wght` é a variável de peso e `wght-italic` traz o itálico, que o hero usa
 * na palavra em destaque e os recados usam no texto. Cada arquivo latino tem
 * 40 KB e o navegador só baixa a faixa Unicode que a página pedir.
 */
import "@fontsource-variable/playfair-display/wght.css";
import "@fontsource-variable/playfair-display/wght-italic.css";
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
      </head>
      <body>
        <StructuredData locale={locale} />
        <AccessibilityEnhancements />
        {children}
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
       ninguém que já esteve aqui.** v2 = marca do arco, 2026-08-11. */
    icons: {
      icon: "/favicon.svg?v=2",
      shortcut: "/favicon.svg?v=2",
    },
  };
}
