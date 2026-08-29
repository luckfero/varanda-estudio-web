import Link from "next/link";
import { ArcoMark } from "./icons";
import { getDicionario, type Locale } from "./i18n";

/* O canal para pedido de titular. Fica aqui e não no dicionário porque é o
   mesmo endereço nos três idiomas — repetido em três arquivos, bastaria
   corrigir dois para o terceiro apontar para uma caixa que ninguém lê. */
const EMAIL_PRIVACIDADE = "luccaassoc@gmail.com";

/**
 * Política de privacidade, em qualquer idioma.
 *
 * A identificação de quem controla os dados é exigida pela LGPD e pelo
 * RGPD — é o único lugar do site em que o nome da pessoa física aparece, e
 * é de propósito. Há teste dos dois lados: um proíbe o nome na home, outro
 * exige aqui.
 */
export default function Politica({ locale }: { locale: Locale }) {
  const t = getDicionario(locale);

  return (
    <>
      <a className="skip-link" href="#conteudo">{t.nav.pular}</a>
      <main className="legal-page" id="conteudo" tabIndex={-1}>
        {/* `marca` e `marca-nome`, os mesmos nomes do cabeçalho e do rodapé.
            Eram `brand` e um `<span>` nu, que é como a identidade ANTERIOR
            chamava isto. A reforma renomeou a classe e o `.brand` ficou sem
            uma única regra: o link virava elemento em linha sem estilo e o
            `ArcoMark` caía no tamanho intrínseco de um SVG sem largura, ou
            seja, 300px. Medido nesta página antes da correção: caixa de
            1209 por 1232px no topo do documento, com o nome em Geist em vez
            da fonte da marca. Não quebra build, não quebra teste e não
            aparece em nenhuma varredura de CSS, porque o defeito é a
            AUSÊNCIA de regra. */}
        <Link className="marca" href={t.path === "" ? "/" : t.path} aria-label={t.privacidade.voltarAria}>
          <ArcoMark small />
          <span className="marca-nome"><strong>Varanda</strong><small>Estúdio Web</small></span>
        </Link>
        <article>
          <p className="kicker"><span /> {t.privacidade.kicker}</p>
          <h1>{t.privacidade.titulo}</h1>
          <p className="legal-updated">{t.privacidade.atualizacao}</p>

          {t.privacidade.secoes.map((secao, index) => (
            <section key={secao.titulo}>
              <h2>{secao.titulo}</h2>
              <p>
                {secao.texto}
                {/* Só a primeira seção termina apontando para o e-mail. */}
                {index === 0 && (
                  <> <a href={`mailto:${EMAIL_PRIVACIDADE}`}>{EMAIL_PRIVACIDADE}</a>.</>
                )}
              </p>
            </section>
          ))}
        </article>
        <Link className="button button--primary legal-back" href={t.path === "" ? "/" : t.path}>
          {t.privacidade.voltar}
        </Link>
      </main>
    </>
  );
}
