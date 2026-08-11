import Politica from "../../../politica";
import { metadadosDe } from "../../../raiz";

export const metadata = metadadosDe("es", "privacidade");

export default function PaginaPrivacidad() {
  return <Politica locale="es" />;
}
