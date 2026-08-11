import { getDicionario, outrosIdiomas, type Locale } from "./i18n";
import Reveal from "./reveal";
import SectionAbertura from "./section-abertura";
import SectionContato from "./section-contato";
import SectionOferta from "./section-oferta";
import SectionPortfolio from "./section-portfolio";
import SectionSobre from "./section-sobre";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";

/**
 * Monta a página única, em qualquer idioma.
 *
 * As três rotas (`/`, `/es`, `/en`) são cascas finas: cada uma traz os seus
 * metadados e chama isto com o seu locale. A composição vive num lugar só
 * para que uma seção nova não precise ser lembrada em três arquivos.
 *
 * Componente de servidor — sem `"use client"`. O dicionário é resolvido aqui
 * e desce **em fatias**, nunca inteiro.
 *
 * A fatia importa. Tudo que é passado como propriedade para um componente
 * cliente vai serializado no payload que chega ao navegador, usado ou não —
 * então o dicionário completo colocava o texto da política de privacidade,
 * que é o único lugar onde o nome da pessoa aparece, no fonte de todas as
 * páginas. Invisível na tela, presente no HTML. Foi um teste que pegou.
 */
export default function Pagina({ locale }: { locale: Locale }) {
  const t = getDicionario(locale);

  return (
    <>
      <Reveal />
      <a className="skip-link" href="#conteudo">
        {t.nav.pular}
      </a>

      <SiteHeader nav={t.nav} locale={locale} idiomas={outrosIdiomas(locale, "home")} />

      <main id="conteudo" tabIndex={-1}>
        <SectionAbertura hero={t.hero} intro={t.intro} servicos={t.servicos} />
        <SectionPortfolio portfolio={t.portfolio} />
        <SectionOferta
          processo={t.processo}
          investimento={t.investimento}
          manutencao={t.manutencao}
          moeda={t.moeda}
          moedaAposValor={t.moedaAposValor}
        />
        <SectionSobre sobre={t.sobre} extras={t.extras} faq={t.faq} />
        <SectionContato contato={t.contato} privacyPath={t.privacyPath} />
      </main>

      <SiteFooter rodape={t.rodape} privacyPath={t.privacyPath} />
    </>
  );
}
