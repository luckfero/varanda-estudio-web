import Politica from "../../../politica";
import { metadadosDe } from "../../../raiz";

export const metadata = metadadosDe("en", "privacidade");

export default function PrivacyPage() {
  return <Politica locale="en" />;
}
