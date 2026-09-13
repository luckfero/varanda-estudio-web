import { altDoCartao, cartaoDeLink, tamanhoDoCartao } from "./cartao-link";

/**
 * O cartão de link em PORTUGUÊS, e o padrão de quem não tiver o seu.
 *
 * Ele fica na raiz de propósito. Em rota que herda metadado, o arquivo mais
 * próximo vence: `/en` e `/en/privacy` usam o de `app/(en)/en/`, `/es` e
 * `/es/privacidad` usam o de `app/(es)/es/`, e o que sobra, que é o
 * português, cai aqui. Assim nenhuma rota fica sem cartão nem hoje nem no
 * dia em que nascer uma sétima.
 *
 * O desenho e as armadilhas do Satori estão em `app/cartao-link.tsx`, num
 * lugar só: três cópias do mesmo JSX divergiriam na primeira mudança de
 * paleta, e o sintoma disso é um cartão feio em um idioma que ninguém abre.
 */
export const alt = altDoCartao("pt");
export const size = tamanhoDoCartao;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return cartaoDeLink("pt");
}
