"use client";

import { useReveal } from "./use-reveal";

/**
 * Casca de cliente para a revelação por rolagem.
 *
 * Existe por um motivo só: `useReveal` é um gancho, e gancho precisa de
 * componente de cliente. Enquanto a chamada morava direto no `Home`, ela
 * obrigava a página inteira a ser cliente — 476 elementos hidratando por
 * causa de um efeito que não renderiza nada.
 *
 * Isolado aqui, o `Home` volta a ser componente de servidor e cada seção
 * decide por si se precisa de JavaScript no navegador.
 */
export default function Reveal() {
  useReveal();
  return null;
}
