import type { Metadata } from "next";
import { headers } from "next/headers";
import NaoEncontrado from "../nao-encontrado";
import { metadadosDeErro } from "../raiz";
import { getDicionario, type Locale } from "../i18n";
import { CABECALHO_BRIEFING, decidirTela, enderecoDaPagina, lerCabecalho } from "./contexto.ts";
import Formulario, { TelaDeEstado } from "./formulario";
import type { Pacote } from "./perguntas.ts";
import { tituloDoBriefing } from "./textos.ts";

/**
 * A PÁGINA DO QUESTIONÁRIO DE PROJETO, do lado do servidor.
 *
 * Ela não fala com o painel. Quem fala é o Worker (`worker/index.ts`): ele
 * confere a chave, chama `abrir()`, decide o código HTTP (200, 404, 410 ou
 * 503) e manda o resultado para cá no cabeçalho interno, que esta página lê
 * com `headers()`. As respostas salvas não vêm no cabeçalho: com JavaScript, o
 * formulário busca em `GET /api/briefing`.
 *
 * **Sem o cabeçalho, este endereço não existe.** O Worker sempre o escreve nas
 * rotas do questionário, e apaga o que vier de fora em toda requisição. Então
 * cabeçalho ausente ou ilegível só acontece quando a página foi alcançada por
 * outro caminho (`/%62riefing`, que o roteador decodifica), e a resposta certa
 * é a página de erro, que o Worker já devolve com 404.
 *
 * `headers()` também marca a rota como dinâmica, o que tira a página de
 * qualquer cache do vinext. Por isso nenhuma das três rotas pode exportar
 * `revalidate` (há teste lendo os arquivos).
 *
 * A TELA sai de `decidirTela` (o formulário, a confirmação de recebido, o só
 * leitura de fechado, o encerrado e o fora do ar), e o `<main>` continua
 * marcando o estado e a tela em `data-briefing-estado` e `data-briefing-tela`,
 * que os testes da API leem no elemento.
 *
 * **O componente cliente recebe FATIA.** Tudo que vai como propriedade para
 * ele é serializado no HTML, usado ou não. Do dicionário do site sai só o
 * nome e os itens do pacote e o endereço da política; o dicionário inteiro
 * levaria junto o texto da política, que é o único lugar do site com o nome
 * da pessoa física. E `inicial` (e-mail, telefone e CNPJ do cadastro) NÃO vai:
 * o formulário recebe pelo `GET`, que só o JavaScript da página faz, e assim
 * esses dados não ficam no HTML que a prévia de link do WhatsApp busca.
 * O único pré-preenchimento que o HTML traz é o que sai do CONTEXTO, que já
 * está na página (o nome da empresa, que a abertura mostra, e os idiomas do
 * site), e só nas perguntas que o rascunho não tem (`dados.prefill`, desde
 * 26/09/2026): sem isso, a página sem JavaScript obrigava a digitar o nome
 * da empresa para passar da trava das obrigatórias.
 */

/**
 * Metadados das três rotas do questionário.
 *
 * O contrário das páginas públicas: `noindex, nofollow` (a página é de uma
 * empresa só e o endereço traz a chave), nenhum canonical e nenhum hreflang,
 * e `<meta name="referrer" content="no-referrer">`, que repete na head o
 * cabeçalho que o Worker manda. Os ícones vêm da mesma constante do site,
 * pelos metadados da página de erro, para a aba não trocar de ícone.
 */
export function metadadosDoBriefing(locale: Locale): Metadata {
  const doSite = metadadosDeErro(locale);
  return {
    metadataBase: doSite.metadataBase,
    title: `${tituloDoBriefing(locale)} | Varanda Estúdio Web`,
    robots: { index: false, follow: false },
    referrer: "no-referrer",
    icons: doSite.icons,
  };
}

/* O pacote do link aponta para o cartão do mesmo nome em
   `investimento.pacotes`, que é uma lista na ordem Essencial, Negócio,
   Profissional nos três dicionários. Há teste conferindo que o nome e os
   itens que a página mostra são os do cartão certo em cada idioma. */
const INDICE_DO_PACOTE: Record<Pacote, number> = { essencial: 0, negocio: 1, profissional: 2 };

type Busca = Record<string, string | string[] | undefined>;

export default async function PaginaBriefing({ locale, searchParams }: { locale: Locale; searchParams?: Promise<Busca> }) {
  const dados = lerCabecalho((await headers()).get(CABECALHO_BRIEFING));
  if (!dados) return <NaoEncontrado locale={locale} />;

  const busca: Busca = (await searchParams) ?? {};
  const tela = decidirTela(dados, { enviado: busca.enviado === "1", agora: new Date() });

  const dicionario = getDicionario(locale);
  /* A seção 3 da política tem `id="questionario"` nos três idiomas. */
  const privacidade = `${dicionario.privacyPath}#questionario`;
  const enderecoDoFormulario = dados.chave ? `${enderecoDaPagina(locale)}?chave=${dados.chave}` : null;

  let conteudo;
  if (tela === "formulario" && dados.chave && dados.contexto) {
    const cartao = dicionario.investimento.pacotes[INDICE_DO_PACOTE[dados.contexto.pacote]];
    conteudo = (
      <Formulario
        locale={locale}
        chave={dados.chave}
        contexto={dados.contexto}
        pacote={{ nome: cartao.name, itens: [...cartao.items] }}
        privacidade={privacidade}
        enderecoDoFormulario={enderecoDoFormulario ?? enderecoDaPagina(locale)}
        faltamSemJs={dados.faltam ?? null}
        prefillSemJs={dados.prefill ?? null}
        jaEnviado={dados.estado === "enviado"}
      />
    );
  } else {
    conteudo = (
      <TelaDeEstado
        tipo={tela === "formulario" ? "fora_do_ar" : tela}
        locale={locale}
        empresa={dados.contexto?.empresa ?? null}
        chave={dados.chave}
        contexto={dados.contexto}
        enderecoDoFormulario={enderecoDoFormulario}
      />
    );
  }

  return (
    <main className="secao briefing" id="conteudo" tabIndex={-1} data-briefing-estado={dados.estado} data-briefing-tela={tela}>
      {conteudo}
    </main>
  );
}
