import Pagina from "../pagina";
import { metadadosDe } from "../raiz";

export const metadata = metadadosDe("pt", "home");

export default function Home() {
  return <Pagina locale="pt" />;
}
