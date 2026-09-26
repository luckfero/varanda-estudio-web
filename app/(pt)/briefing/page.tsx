import PaginaBriefing, { metadadosDoBriefing } from "../../briefing/pagina";

/**
 * O questionário de projeto em português: `/briefing?chave=...`.
 *
 * Só chama `app/briefing/pagina.tsx` com o idioma. Quem decide se o endereço
 * existe e com que código responde é o Worker, a partir da chave; esta rota
 * fica FORA de `ROTAS_QUE_EXISTEM` de propósito (ver o comentário de lá).
 *
 * Proibido `export const revalidate` aqui: a página traz dado de uma empresa
 * só, e cache nela serviria a tela de um cliente para outro.
 */
export const metadata = metadadosDoBriefing("pt");

export default function Briefing({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PaginaBriefing locale="pt" searchParams={searchParams} />;
}
