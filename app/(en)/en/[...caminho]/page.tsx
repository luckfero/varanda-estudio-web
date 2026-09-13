import NaoEncontrado from "../../../nao-encontrado";
import { metadadosDeErro } from "../../../raiz";

/**
 * The catch-all route for ENGLISH: anything under `/en/` that is not
 * `/en/privacy`. More specific than the Portuguese catch-all at the root, so
 * this one wins and the visitor gets the error page in the language they were
 * already reading.
 *
 * It answers 200 on purpose; the worker turns it into a 404. See the note in
 * `app/(pt)/[...caminho]/page.tsx`.
 */
export const metadata = metadadosDeErro("en");

export default function PaginaNaoEncontrada() {
  return <NaoEncontrado locale="en" />;
}
