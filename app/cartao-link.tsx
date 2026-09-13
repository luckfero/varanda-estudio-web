import { ImageResponse } from "next/og";
import { getDicionario, type Locale } from "./i18n";

/**
 * O CARTÃO QUE APARECE QUANDO O LINK É COLADO, um por idioma.
 *
 * **É a peça mais vista do site inteiro por quem ainda não é visitante.** Todo
 * prospect recebe o endereço por WhatsApp, e o que ele vê primeiro é isto, não
 * a home. Um cartão fora da identidade é a primeira coisa que o estúdio mostra
 * dizendo que não cuida dos detalhes.
 *
 * **Por que ele virou um módulo com locale, em 09/09/2026.** Até aqui existia
 * um arquivo só, em `app/opengraph-image.tsx`, no topo da árvore: as seis
 * rotas herdavam o mesmo PNG, e `/en` e `/es` mandavam para o mundo um cartão
 * escrito em português. Conferido byte a byte antes da mudança: os três
 * endereços declaravam a mesma imagem, o mesmo md5, o mesmo tudo. Agora cada
 * grupo de rota tem o seu, e o texto sai do dicionário do idioma.
 *
 * **A frase não é escrita aqui.** Ela é montada com as mesmas três chaves do
 * título da abertura (`tituloAntes`, `tituloDestaque`, `tituloDepois`), então
 * o cartão diz exatamente o que a primeira tela diz, e a palavra em âmbar é a
 * mesma que a home destaca. Casar por texto ("se a palavra for `espaço`,
 * pinta") funcionaria em português e quebraria calado no dia em que alguém
 * mexesse na tradução.
 *
 * AS REGRAS DO SATORI, que o `next/og` usa por baixo, e cada uma já custou
 * um cartão publicado em branco ou torto:
 *
 * 1. **`display` explícito em qualquer elemento com mais de um filho.** Sem
 *    ele o Satori não desenha nada: a rota responde 200, com
 *    `content-type: image/png`, e **zero byte**. Não há erro no console, não
 *    há aviso no build, e um teste de metadados continua passando, porque a
 *    tag existe e aponta para um endereço que responde. Foi assim que o
 *    cartão foi publicado vazio em 28/08/2026.
 * 2. **Nada de atalho de duas partes.** `gap: "0 18px"` é ignorado em
 *    silêncio e as palavras saem coladas. `columnGap` e `rowGap` separados.
 * 3. **Não há cascata.** `var(--token)` sai preto. Cada cor abaixo repete o
 *    hex com o nome do token ao lado, e mudar a paleta obriga a passar aqui.
 * 4. **Com `flexWrap`, a quebra acontece na borda de cada item.** Uma palavra
 *    por `span`, e não blocos de frase: um `span` com a frase inteira não
 *    quebraria e transbordaria o cartão.
 *
 * E a verificação, que é o que separa isto de uma promessa: teste que lê os
 * BYTES dos três cartões, cobra assinatura PNG e o IHDR com 1200 por 630.
 * Rota que responde não é imagem que existe.
 */

export const tamanhoDoCartao = { width: 1200, height: 630 };

/**
 * As duas frases que não existem em lugar nenhum do dicionário.
 *
 * A linha de apoio do cartão é mais curta que a `meta.description` de cada
 * idioma, de propósito: ali cabem 26px em duas linhas, e a descrição inteira
 * viraria um bloco de texto pequeno. As três dizem a mesma coisa que a
 * descrição já aprovada diz, cortada no ponto.
 *
 * O nome acessível (`alt`) é o `meta.title` de cada idioma sem a barra: é ele
 * que o leitor de tela anuncia sobre o cartão em quem exibe pré-visualização
 * com texto alternativo.
 *
 * Sem travessão em nenhuma das seis: é texto que o cliente lê.
 */
const TEXTOS: Record<Locale, { apoio: string; alt: string }> = {
  pt: {
    apoio: "Estratégia, direção visual autoral e desenvolvimento, do zero.",
    alt: "Varanda Estúdio Web: criação de sites profissionais",
  },
  en: {
    apoio: "Strategy, original visual direction and development, from scratch.",
    alt: "Varanda Estúdio Web: professional website design and development",
  },
  es: {
    apoio: "Estrategia, dirección visual propia y desarrollo, desde cero.",
    alt: "Varanda Estúdio Web: diseño y desarrollo de webs profesionales",
  },
};

export function altDoCartao(locale: Locale): string {
  return TEXTOS[locale].alt;
}

/** Uma palavra por item, e o item guarda se ela é a destacada. */
function palavras(texto: string, acento: boolean) {
  return texto
    .split(" ")
    .filter((palavra) => palavra.length > 0)
    .map((palavra) => ({ palavra, acento }));
}

export function cartaoDeLink(locale: Locale) {
  const t = getDicionario(locale);
  const { apoio } = TEXTOS[locale];

  /* Os tokens, repetidos aqui porque o Satori não tem cascata. */
  const chao = "#14110e";
  const nivel1 = "#1e1a16";
  const tinta = "#f4efe6";
  const tintaMedia = "#cabfb1";
  const tintaFraca = "#a89d8f";
  const acento = "#e8a33c";
  const fio = "rgba(244, 239, 230, 0.13)";

  /* A mesma frase da primeira tela, montada das mesmas três chaves. A chave
     do meio é a que sai em âmbar. O índice entra na `key` porque a mesma
     palavra pode aparecer duas vezes na frase. */
  const frase = [
    ...palavras(t.hero.tituloAntes, false),
    ...palavras(t.hero.tituloDestaque, true),
    ...palavras(t.hero.tituloDepois, false),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 80px",
          background: chao,
          color: tinta,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* A marca em caixas, e não pelo SVG de `public/marca/`: o Satori
              não resolve `currentColor` nem herda cor de contexto. São três
              peças, as mesmas do símbolo aprovado: a cobertura que não
              encosta, o piso mais largo que ela, e a luz entre os dois. A
              folga entre a perna e o piso é a ideia. */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 60 }}>
            <div
              style={{
                width: 44,
                height: 30,
                borderTop: `5px solid ${tinta}`,
                borderLeft: `5px solid ${tinta}`,
                borderRight: `5px solid ${tinta}`,
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
              }}
            />
            <div style={{ height: 7, display: "flex" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 22,
                  height: 11,
                  background: acento,
                  borderTopLeftRadius: 11,
                  borderTopRightRadius: 11,
                }}
              />
              <div style={{ width: 56, height: 5, background: tinta, borderRadius: 3 }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, letterSpacing: -0.4 }}>Varanda</div>
            <div style={{ fontSize: 14, letterSpacing: 4, color: tintaFraca, marginTop: 4 }}>
              ESTÚDIO WEB
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              /* `columnGap` e `rowGap` separados, e nao o atalho `gap: "0 18px"`.
                 O Satori ignora o atalho de dois valores em silencio, e o
                 resultado foi as palavras coladas: "Sitesquedaoespaco". Medido
                 renderizando o cartao e olhando, que e a unica prova aqui. */
              columnGap: 18,
              rowGap: 0,
              maxWidth: 940,
              fontSize: 74,
              lineHeight: 1.02,
              letterSpacing: -2.2,
            }}
          >
            {frase.map((item, indice) => (
              <span key={`${indice}-${item.palavra}`} style={item.acento ? { color: acento } : undefined}>
                {item.palavra}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 26, color: tintaMedia, maxWidth: 800, lineHeight: 1.4 }}>
            {apoio}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            paddingTop: 22,
            borderTop: `1px solid ${fio}`,
            color: tintaFraca,
          }}
        >
          <span style={{ letterSpacing: 2 }}>{t.hero.local.toUpperCase()}</span>
          <span
            style={{
              background: nivel1,
              color: acento,
              padding: "8px 18px",
              borderRadius: 999,
              letterSpacing: 2,
              fontSize: 18,
            }}
          >
            {t.hero.atendimento.toUpperCase()}
          </span>
        </div>
      </div>
    ),
    tamanhoDoCartao,
  );
}
