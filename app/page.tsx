import Reveal from "./reveal";
import SectionAbertura from "./section-abertura";
import SectionContato from "./section-contato";
import SectionOferta from "./section-oferta";
import SectionPortfolio from "./section-portfolio";
import SectionSobre from "./section-sobre";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";

/**
 * Monta a página única.
 *
 * Este arquivo tinha 865 linhas: 199 de conteúdo, quatro ícones e um
 * componente com onze seções e três estados diferentes. O conteúdo foi para
 * `data.ts`, os ícones para `icons.tsx`, e cada estado passou a morar na
 * seção que o usa — o menu no cabeçalho, o carrossel no portfólio, o envio
 * no contato. Nada aqui precisa saber de nenhum dos três.
 *
 * Este arquivo é **componente de servidor**: não tem `"use client"`. Era
 * cliente só porque chamava `useReveal` aqui dentro, e isso arrastava os 476
 * elementos da página para a hidratação. O gancho foi para `<Reveal />`, uma
 * casca que não renderiza nada, e agora cada seção decide sozinha se precisa
 * de JavaScript no navegador.
 */
export default function Home() {
  return (
    <>
      <Reveal />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <SiteHeader />

      <main id="conteudo" tabIndex={-1}>
        <SectionAbertura />
        <SectionPortfolio />
        <SectionOferta />
        <SectionSobre />
        <SectionContato />
      </main>

      <SiteFooter />
    </>
  );
}
