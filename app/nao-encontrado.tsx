import Link from "next/link";
import { ArcoMark } from "./icons";
import { caminho, getDicionario, type Locale } from "./i18n";

/**
 * A PÁGINA DE ENDEREÇO QUE NÃO EXISTE, em qualquer idioma.
 *
 * Até 09/09/2026 quem errava o endereço, ou clicava num link antigo que o
 * estúdio mandou meses atrás, recebia **nove bytes de texto puro**: `Not
 * Found`, sem marca, sem idioma, sem cor e sem caminho de volta. Medido antes
 * de mexer, nos três idiomas e em quatro caminhos inválidos: 404, sim, mas
 * `text/plain` com 9 bytes de corpo e zero tag na head.
 *
 * **Ela responde 404 de verdade, e é isto que exige explicação.** No vinext,
 * `notFound()` com `app/not-found.tsx` acerta o código HTTP e PERDE os
 * metadados: nem `metadata`, nem `generateMetadata` daquele arquivo são
 * aplicados, e a página sai com o título e o `index, follow` do layout. Já
 * escrever `<title>` no JSX não resolve, porque as tags do layout continuam
 * lá e o navegador usa a primeira. É a regra 9.3 do protocolo, e o caminho
 * que funciona é o mesmo que o Nascente já usa: uma rota coringa que responde
 * 200 com esta página, e o **worker** trocando 200 por 404 quando o caminho
 * não está na lista de rotas que existem de fato.
 *
 * NÃO TEM CABEÇALHO, e é decisão. A barra do site é feita de âncoras para as
 * seções da home (`#servicos`, `#portfolio`, `#processo`), e nenhuma delas
 * existe aqui: um menu inteiro de links que não levam a lugar nenhum é pior
 * que menu nenhum. O caminho de volta são as duas coisas que funcionam, a
 * marca no topo e o botão, e as duas vão para a home DO IDIOMA em que a
 * pessoa estava.
 *
 * O desenho é o da abertura do site, reaproveitado classe por classe: o chão
 * escuro, a luz e a grade fina. Não há uma linha de estilo nova além do
 * bloco `.erro-pagina` em `contact.css`, que é onde já mora a outra página
 * que o protótipo não tem.
 */
export default function NaoEncontrado({ locale }: { locale: Locale }) {
  const t = getDicionario(locale);
  const home = caminho(locale, "home");

  return (
    <>
      <a className="skip-link" href="#conteudo">
        {t.nav.pular}
      </a>

      <main className="secao abertura erro-pagina" id="conteudo" tabIndex={-1}>
        {/* As duas camadas decorativas da abertura, e só elas. A grade que
            responde ao cursor fica de fora: ela traz o GSAP junto e não vale
            baixar biblioteca para enfeitar uma página de erro. */}
        <div className="luz" aria-hidden="true" />
        <div className="grade-fina" aria-hidden="true" />

        <div className="caixa acima">
          <Link className="marca" href={home} aria-label={t.rodape.voltarInicio}>
            <ArcoMark />
            <span className="marca-nome">
              <strong>Varanda</strong>
              <small>Estúdio Web</small>
            </span>
          </Link>

          {/* `404` no lugar do número da seção. O rótulo numerado é o padrão da
              casa, e aqui o número que importa é o código da resposta. */}
          <p className="rotulo">
            <b>404</b>
            <i aria-hidden="true" />
            {t.erro.rotulo}
          </p>
          <h1>{t.erro.titulo}</h1>
          <p className="lead">{t.erro.texto}</p>

          <div className="abertura-acoes">
            <Link className="botao botao--acento" href={home}>
              {t.erro.voltar}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
