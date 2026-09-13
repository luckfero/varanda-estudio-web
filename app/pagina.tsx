import { whatsappUrl } from "./data";
import { getDicionario, outrosIdiomas, type Locale } from "./i18n";
import { WhatsappIcon } from "./icons";
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
        {/* O bloco "no ar" na primeira tela foi ligado e desligado no mesmo
            dia, 09/09/2026, por decisão do dono. Ele passava aqui duas
            propriedades a mais (`noArRotulo` e `noAr`), fatias de `portfolio`.
            O texto sempre veio da seção 04, e desde 13/09/2026 os dois sites
            também saíram de lá, em pausa (ver `featuredAssets` em `data.ts`). */}
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

      {/* O botão fixo de WhatsApp, só no celular.
          É literalmente um dos itens que os três pacotes prometem — "botão de
          WhatsApp em todas as páginas" está em `escopoIncluido` — e o nosso
          próprio site não tinha. No desktop ele não aparece: lá o cabeçalho
          fica visível o tempo todo e já leva ao contato, enquanto no celular o
          maior intervalo sem nada clicável media 7.839px, 9,3 telas.

          `aria-hidden` no ícone e texto de verdade no `span`, escondido
          visualmente mas lido: um botão flutuante sem nome é um círculo verde
          que o leitor de tela anuncia como "link". */}
      {/* `zap`, e não `zap-flutuante`, desde 09/09/2026. Os dois nomes existiam
          ao mesmo tempo: este arquivo escrevia o nome da folha ANTIGA e o
          desenho do botão morava em `contact.css` sob o nome do protótipo.
          Nenhuma regra alcançava o elemento, e o que segurava o botão de pé
          era uma cópia de seis declarações em `accessibility.css`, escrita
          para ser apagada no dia em que este nome mudasse. É este dia. */}
      <a
        className="zap"
        href={`${whatsappUrl}?text=${encodeURIComponent(t.contato.whatsappMensagem)}`}
        target="_blank"
        rel="noreferrer"
      >
        <WhatsappIcon />
        <span className="sr-only">{t.nav.flutuante}</span>
      </a>

      <SiteFooter rodape={t.rodape} privacyPath={t.privacyPath} />
    </>
  );
}
