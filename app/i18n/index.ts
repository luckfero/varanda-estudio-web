import en from "./en";
import es from "./es";
import pt from "./pt";

/**
 * O português é o contrato.
 *
 * `es.ts` e `en.ts` declaram `const es: Dicionario`, então **chave que existe
 * aqui e falta lá quebra o build**. É de propósito: a alternativa é uma
 * tradução esquecida chegar em produção como um parágrafo em português no
 * meio de uma página em inglês, que ninguém percebe até um cliente ver.
 *
 * `es.ts` e `en.ts` importam este tipo com `import type`, que o compilador
 * apaga — não há ciclo em tempo de execução, e o tipo em si depende só de
 * `pt.ts`, que não importa este arquivo.
 */
export type Dicionario = typeof pt;

export type Locale = "pt" | "es" | "en";

export const locales: Locale[] = ["pt", "es", "en"];

const dicionarios: Record<Locale, Dicionario> = { pt, es, en };

export function getDicionario(locale: Locale): Dicionario {
  return dicionarios[locale];
}

export type Pagina = "home" | "privacidade";

/** O caminho de uma página em um idioma. O português mora na raiz. */
export function caminho(locale: Locale, pagina: Pagina): string {
  const d = dicionarios[locale];
  if (pagina === "privacidade") return d.privacyPath;
  return d.path === "" ? "/" : d.path;
}

/**
 * `hreflang` recíproco, incluindo a própria página.
 *
 * O buscador só honra a anotação quando **todas** as versões apontam umas
 * para as outras e cada uma se inclui na lista; faltando um lado, ele
 * descarta o conjunto em silêncio. Por isso o mapa é gerado a partir da
 * mesma lista de idiomas, e não escrito à mão em cada rota.
 *
 * `x-default` vai para o português: é a raiz do domínio e a versão que
 * atende quem não casa com nenhum idioma anunciado.
 */
export function idiomasAlternativos(pagina: Pagina): Record<string, string> {
  const mapa: Record<string, string> = {};
  for (const locale of locales) {
    mapa[dicionarios[locale].code] = caminho(locale, pagina);
  }
  mapa["x-default"] = caminho("pt", pagina);
  return mapa;
}

/** Os outros idiomas, para o seletor do cabeçalho. */
export function outrosIdiomas(atual: Locale, pagina: Pagina) {
  return locales
    .filter((locale) => locale !== atual)
    .map((locale) => ({
      locale,
      nome: dicionarios[locale].nome,
      hreflang: dicionarios[locale].code,
      href: caminho(locale, pagina),
    }));
}

/**
 * Formata um valor na moeda do idioma.
 *
 * Existe porque em espanhol o símbolo vem **depois** do número (`1.950 €`) e
 * a marcação de `.price` assumia sempre antes. Devolve as duas partes em vez
 * de uma string pronta: o desenho separa símbolo e número em elementos
 * diferentes, com tamanhos diferentes.
 */
export function partesDoPreco(
  /* Só o que a função usa, e não o `Dicionario` inteiro: quem chama é um
     componente cliente que recebe fatias, justamente para não serializar o
     dicionário completo no payload do navegador. */
  moedas: { moeda: string; moedaAposValor: boolean },
  valor: string,
) {
  return moedas.moedaAposValor
    ? { antes: null, numero: valor, depois: moedas.moeda }
    : { antes: moedas.moeda, numero: valor, depois: null };
}
