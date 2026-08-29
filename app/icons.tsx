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
export function ArcoMark() {
  /* A MARCA: a soleira, na versão ABERTA, sem pastilha.
   *
   * Três peças, e só três. Uma cobertura de ombros arredondados cujas pernas
   * descem e PARAM antes do chão. Um piso reto e mais largo que ela. E entre
   * os dois, a meia-lua de luz deitada no piso, a única peça cheia.
   *
   * A folga entre a ponta das pernas e o piso é a ideia inteira: arco que
   * desce até o chão é porta, cobertura apoiada em parede é sala, e só
   * cobertura suspensa sobre um piso é varanda, aberta dos dois lados. Quem
   * for "arrumar" o desenho encostando as pernas no piso apaga o motivo dele
   * existir.
   *
   * ANTES EXISTIAM DUAS VERSÕES AQUI, e a do site era a selada: pastilha de
   * 64 com raio 14, vão de 24 em vez de 32, traço 2,6 em vez de 5. Em 34px
   * aquele traço saía com 1,38px contra os 2,66px deste, ou seja, o símbolo
   * do cabeçalho era quase metade do peso do símbolo dos arquivos de marca.
   * Eram dois desenhos, não dois tamanhos, e o Lucca reparou olhando o PNG ao
   * lado do site em 28/08/2026. Ficou um só.
   *
   * A pastilha não morreu: ela vive em `public/marca/selo.svg`, que é a peça
   * para foto de perfil, onde o recorte redondo da rede social exige fundo
   * próprio. Aqui, sobre o chão do site, ela era moldura sem função.
   *
   * A geometria é a de `public/marca/simbolo.svg`, unidade por unidade, para
   * o símbolo do topo e o arquivo que vai para proposta e assinatura serem o
   * mesmo desenho. Duas cópias divergem na primeira mudança, que é exatamente
   * o que aconteceu.
   *
   * O piso tem vão de 40 (x 12 a 52) e não 44: com 44 a ponta arredondada
   * ficava a 30,30 do centro, e o recorte circular de perfil de rede social
   * tem raio 32 com uma faixa de 8% em que a borda some. Era medida, não
   * gosto.
   *
   * A meia-lua é meia de propósito: círculo inteiro fecha o vão e a marca lê
   * como cadeado em 16px. */
  return (
    <svg className="arco-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path className="arco-mark-traco" d="M16 35V24a9 9 0 0 1 9-9h14a9 9 0 0 1 9 9v11" />
      <path className="arco-mark-sol" d="M24 46.5a8 8 0 0 1 16 0Z" />
      <path className="arco-mark-traco" d="M12 49h40" />
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
