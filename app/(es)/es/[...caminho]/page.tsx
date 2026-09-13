import NaoEncontrado from "../../../nao-encontrado";
import { metadadosDeErro } from "../../../raiz";

/**
 * La ruta comodín del ESPAÑOL: cualquier dirección bajo `/es/` que no sea
 * `/es/privacidad`. Es más específica que el comodín del portugués en la
 * raíz, así que gana esta y la persona recibe el error en el idioma que ya
 * estaba leyendo.
 *
 * Responde 200 a propósito; quien lo cambia a 404 es el worker. Ver la nota
 * en `app/(pt)/[...caminho]/page.tsx`.
 */
export const metadata = metadadosDeErro("es");

export default function PaginaNaoEncontrada() {
  return <NaoEncontrado locale="es" />;
}
