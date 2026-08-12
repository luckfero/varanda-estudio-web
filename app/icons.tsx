/**
 * Os quatro sinais graficos da pagina. Sem estado e sem dependencia:
 * o unico motivo de estarem juntos e serem SVG embutido.
 */

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowDownRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7h10v10M7 17 17 7" />
    </svg>
  );
}

export function CarouselArrow({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg className={direction === "previous" ? "is-previous" : ""} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

/**
 * A marca: um arco com o sol nascendo, visto de dentro da varanda.
 *
 * Substituiu, em 2026-08-11, um círculo com folhas desenhado inteiramente em
 * CSS. O desenho em CSS tinha um defeito que só aparece fora do site: **ele
 * não existia como arquivo.** Não dava para colocar numa proposta em PDF, num
 * perfil de WhatsApp Business, no LinkedIn ou numa assinatura de e-mail, que
 * é justamente onde uma marca precisa estar quando a prospecção começa.
 *
 * A geometria aqui é a mesma de `public/marca/simbolo.svg`. **Mudou uma,
 * muda a outra** — são o mesmo símbolo em dois formatos, um para a página e
 * outro para o mundo.
 *
 * As cores saem de variáveis para a marca poder viver sobre fundo claro e
 * escuro sem um segundo componente. É a lição da seção 9.8 do protocolo:
 * quem decide a cor é a superfície, não a peça.
 */
export function ArcoMark({ small = false }: { small?: boolean }) {
  /* Versão de assinatura: a geometria do `public/favicon.svg`, letra por
     letra, incluindo o quadrado de fundo.
     O selo do topo do site e o ícone da aba do navegador passam a ser o mesmo
     desenho, que era a intenção desde que o favicon foi refeito e não se
     cumpria: o cabeçalho usava o arco aberto dentro de um círculo de CSS, com
     proporções diferentes. O fundo agora é um `rect` do próprio SVG, e não
     `background` mais `border-radius` no CSS, porque assim a forma acompanha
     o desenho em qualquer tamanho sem depender de duas fontes de verdade. */
  if (small) {
    return (
      <svg
        className="arco-mark arco-mark--small"
        viewBox="0 0 64 64"
        aria-hidden="true"
        focusable="false"
      >
        <rect className="arco-mark-caixa" width="64" height="64" rx="14" />
        <path className="arco-mark-traco" d="M20 45V31a12 12 0 0 1 24 0v14" />
        {/* Meia-lua, e não círculo inteiro: o círculo fechava o vão e a marca
            passava a ler como cadeado em tamanho pequeno. */}
        <path className="arco-mark-sol" d="M26 42.5a6 6 0 0 1 12 0Z" />
        <path className="arco-mark-traco" d="M14 45h36" />
      </svg>
    );
  }

  /* Versão aberta, sem fundo: usada grande na seção de apresentação, onde o
     arco respira sozinho e o traço fino é legível. */
  return (
    <svg className="arco-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path className="arco-mark-traco" d="M15 53V28a17 17 0 0 1 34 0v25" />
      <path className="arco-mark-sol" d="M22.5 50.5a9.5 9.5 0 0 1 19 0Z" />
      <path className="arco-mark-traco" d="M7 53h50" />
    </svg>
  );
}

