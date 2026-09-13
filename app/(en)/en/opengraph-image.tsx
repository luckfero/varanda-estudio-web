import { altDoCartao, cartaoDeLink, tamanhoDoCartao } from "../../cartao-link";

/**
 * The link card in ENGLISH, for `/en` and `/en/privacy`.
 *
 * Until 09/09/2026 both routes inherited the Portuguese card from the root of
 * the tree: the same PNG, byte for byte, sent to anyone pasting the English
 * address anywhere. The drawing lives in `app/cartao-link.tsx`; this file only
 * says which dictionary it reads.
 */
export const alt = altDoCartao("en");
export const size = tamanhoDoCartao;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return cartaoDeLink("en");
}
