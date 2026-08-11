import Politica from "../../politica";
import { metadadosDe } from "../../raiz";

export const metadata = metadadosDe("pt", "privacidade");

export default function PaginaPrivacidade() {
  return <Politica locale="pt" />;
}
