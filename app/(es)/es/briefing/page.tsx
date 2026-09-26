import PaginaBriefing, { metadadosDoBriefing } from "../../../briefing/pagina";

/**
 * O questionário de projeto em espanhol: `/es/briefing?chave=...`.
 *
 * Ver a nota em `app/(pt)/briefing/page.tsx`: esta rota só passa o idioma, o
 * Worker decide o código HTTP, e aqui não pode haver `revalidate`.
 */
export const metadata = metadadosDoBriefing("es");

export default function Briefing({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PaginaBriefing locale="es" searchParams={searchParams} />;
}
