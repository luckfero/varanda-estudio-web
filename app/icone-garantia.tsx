/**
 * Os seis ícones das garantias de "Em todos os pacotes" (13/09/2026).
 *
 * Traço fino em `currentColor`, no quadro de 32, com `pathLength="100"` em
 * cada traço para a folha poder pintá-los com `planta-pinta` quando o item
 * entra na tela (ver `process.css`). O único preenchimento, quando existe, leva
 * `incluido-icone-cheio` e surge depois do traço, como a peça âmbar das
 * ilustrações dos extras.
 *
 * Achados pelo NOME (`item.icone` nos dicionários), e não pela posição.
 */
const TRACO = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export default function IconeGarantia({ nome }: { nome: string }) {
  const desenho = (() => {
    switch (nome) {
      /* Direção visual autoral: a pena de desenho. */
      case "direcao":
        return (
          <>
            <path {...TRACO} pathLength={100} d="M16 4 24.5 14 16 28 7.5 14Z" />
            <path {...TRACO} pathLength={100} d="M16 13v9" />
            <circle className="incluido-icone-cheio" cx="16" cy="12.5" r="1.9" fill="currentColor" />
          </>
        );
      /* Acessível de verdade: o círculo de contraste. */
      case "acessivel":
        return (
          <>
            <circle {...TRACO} pathLength={100} cx="16" cy="16" r="11" />
            <path className="incluido-icone-cheio" d="M16 5a11 11 0 0 1 0 22Z" fill="currentColor" />
          </>
        );
      /* Rápido em qualquer celular: o aparelho com o raio. */
      case "rapido":
        return (
          <>
            <rect {...TRACO} pathLength={100} x="9" y="4" width="14" height="24" rx="3" />
            <path {...TRACO} pathLength={100} d="M13.5 24.5h5" />
            <path className="incluido-icone-cheio" d="M17.2 8.5 12.5 16h3.4l-1.6 5.5 5.2-7.7h-3.4Z" fill="currentColor" />
          </>
        );
      /* Publicação e domínio configurados: o globo. */
      case "publicacao":
        return (
          <>
            <circle {...TRACO} pathLength={100} cx="16" cy="16" r="11" />
            <path {...TRACO} pathLength={100} d="M5 16h22" />
            <path {...TRACO} pathLength={100} d="M16 5c-4.2 3.2-4.2 18.8 0 22M16 5c4.2 3.2 4.2 18.8 0 22" />
          </>
        );
      /* Garantia de 30 dias: o escudo com o visto. */
      case "garantia":
        return (
          <>
            <path {...TRACO} pathLength={100} d="M16 4 26 8v7c0 6.8-4.4 11-10 13C10.4 26 6 21.8 6 15V8Z" />
            <path {...TRACO} pathLength={100} d="m11.5 16 3.2 3.2 6-6.2" />
          </>
        );
      /* O site é seu: a chave. */
      case "dono":
        return (
          <>
            <circle {...TRACO} pathLength={100} cx="10" cy="16" r="6.5" />
            <path {...TRACO} pathLength={100} d="M16.5 16H29M24.5 16v5M28.5 16v3.5" />
            <circle className="incluido-icone-cheio" cx="10" cy="16" r="2.1" fill="currentColor" />
          </>
        );
      default:
        return null;
    }
  })();
  if (!desenho) return null;
  return (
    <svg className="incluido-icone" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      {desenho}
    </svg>
  );
}
