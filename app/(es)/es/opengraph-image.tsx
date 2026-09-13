import { altDoCartao, cartaoDeLink, tamanhoDoCartao } from "../../cartao-link";

/**
 * La tarjeta de enlace en ESPAÑOL, para `/es` y `/es/privacidad`.
 *
 * Hasta el 09/09/2026 las dos rutas heredaban la tarjeta en portugués de la
 * raíz del árbol: el mismo PNG, byte a byte. El dibujo vive en
 * `app/cartao-link.tsx`; este archivo solo dice qué diccionario se lee.
 */
export const alt = altDoCartao("es");
export const size = tamanhoDoCartao;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return cartaoDeLink("es");
}
