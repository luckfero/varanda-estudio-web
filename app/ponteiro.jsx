"use client";

import { Suspense, lazy, useSyncExternalStore } from "react";

/**
 * O invólucro que decide SE o ponteiro da casa é baixado.
 *
 * Por que ele existe, com o número: o `TargetCursor` traz o GSAP junto, e o
 * pedaço dos dois pesa **76 KB, 28,8 KB comprimidos**. Importado direto pelo
 * `raiz.tsx`, ele entrava no chunk de entrada e era baixado por TODO visitante
 * — inclusive por quem está no celular, que é exatamente quem nunca vai ver o
 * efeito, porque ele se desliga em ponteiro grosso. Quase um terço a mais de
 * JavaScript na página para não desenhar nada.
 *
 * Aqui o `import()` só acontece depois de as duas consultas passarem. Em toque,
 * em movimento reduzido e sem JavaScript, o arquivo não é pedido uma vez
 * sequer.
 *
 * `useSyncExternalStore` e não estado com efeito, por duas razões. A primeira é
 * que o lint do projeto recusa escrever estado dentro de efeito, e com razão. A
 * segunda é melhor: assinando as duas consultas, o efeito passa a **responder à
 * troca de preferência com a página aberta**, que é a limitação anotada no
 * cabeçalho do `target-cursor.jsx`. Quem liga "reduzir movimento" no sistema vê
 * o ponteiro do sistema voltar na hora, sem recarregar.
 *
 * O `fallback` é `null` de propósito: não há nada a mostrar enquanto carrega.
 * O ponteiro do sistema continua na tela até o desenhado existir, porque quem
 * escreve `cursor: none` é o próprio componente, ao montar.
 */
const TargetCursor = lazy(() => import("./target-cursor"));

const CONSULTAS = ["(prefers-reduced-motion: reduce)", "(pointer: fine)"];

function assinar(aoMudar) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const listas = CONSULTAS.map((c) => window.matchMedia(c));
  listas.forEach((l) => l.addEventListener("change", aoMudar));
  return () => listas.forEach((l) => l.removeEventListener("change", aoMudar));
}

function ler() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    window.matchMedia("(pointer: fine)").matches
  );
}

/* No servidor e na renderização de hidratação: falso. É o que mantém o portal
   fora do caminho da hidratação, e é a mesma razão da mudança 4 lá dentro. */
const lerNoServidor = () => false;

export default function Ponteiro(props) {
  const ligado = useSyncExternalStore(assinar, ler, lerNoServidor);
  if (!ligado) return null;
  return (
    <Suspense fallback={null}>
      <TargetCursor {...props} />
    </Suspense>
  );
}
