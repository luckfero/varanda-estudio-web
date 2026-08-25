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


/**
 * O símbolo do WhatsApp, para o botão fixo do celular.
 *
 * Desenhado como caminho único e herdando `currentColor`, e não trazido de
 * biblioteca: a regra 9.1 do protocolo proíbe recurso de terceiro por CDN, e
 * um pacote de ícones inteiro para um glifo é peso sem função.
 *
 * `aria-hidden` porque o link que o embrulha já tem texto acessível.
 */
export function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24Zm-3.2 4.1c-.15 0-.4.06-.6.28-.21.22-.8.78-.8 1.9s.82 2.2.93 2.36c.12.15 1.6 2.44 3.87 3.42.54.23.96.37 1.29.48.54.17 1.04.15 1.43.09.43-.07 1.34-.55 1.53-1.08.19-.53.19-.98.13-1.08-.06-.09-.21-.15-.43-.26-.22-.11-1.34-.66-1.55-.74-.2-.07-.35-.11-.5.12-.15.22-.58.73-.71.88-.13.15-.26.17-.48.06-.22-.11-.95-.35-1.81-1.12a6.8 6.8 0 0 1-1.26-1.56c-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.08-.15.04-.28-.02-.39-.05-.11-.5-1.23-.69-1.68-.18-.44-.36-.38-.5-.38h-.28Z" />
    </svg>
  );
}
