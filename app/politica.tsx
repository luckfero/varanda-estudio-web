import Link from "next/link";
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
        <Link className="brand" href={t.path === "" ? "/" : t.path} aria-label={t.privacidade.voltarAria}>
          <span className="leaf-mark leaf-mark--small" aria-hidden="true"><i /><i /><i /></span>
          <span><strong>Varanda</strong><small>Estúdio Web</small></span>
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
