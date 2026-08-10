"use client";

import { services } from "./data";
import { ArrowDownRightIcon, ArrowIcon, LeafMark } from "./icons";
import { useAncoraSuave } from "./use-ancora-suave";

/** Hero, apresentação e serviços — as três seções acima do portfólio. */
export default function SectionAbertura() {
  const handleNavClick = useAncoraSuave();

  return (
    <>
      <section className="hero" id="inicio">
        <div className="hero-copy" data-reveal>
          <p className="kicker"><span /> Estúdio de criação de sites</p>
          <h1>Sites que dão <em>espaço</em> para o seu negócio crescer.</h1>
          <p className="hero-lead">
            Conteúdo claro, visual profissional e tecnologia sem complicação para transformar boas ideias em uma presença digital confiável.
          </p>
          <div className="hero-actions">
            <a className="button button--primary" href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
              Conte sobre seu projeto <ArrowIcon />
            </a>
            <a className="text-link" href="#portfolio" onClick={(event) => handleNavClick(event, "#portfolio")}>Ver projeto <ArrowDownRightIcon /></a>
          </div>
          <div className="hero-footnote">
            <span>São Paulo, Brasil</span>
            <span>Atendimento remoto</span>
          </div>
        </div>

        <div className="hero-art" role="img" aria-label="Composição visual de um site sendo desenvolvido" data-reveal>
          <div className="hero-sun" />
          <div className="hero-arch">
            <div className="browser-card">
              <div className="browser-top"><i /><i /><i /><span>seunegocio.com.br</span></div>
              <div className="browser-body">
                <div className="browser-brand">seu negócio</div>
                <div className="browser-title">Presença para ser<br />lembrado.</div>
                <div className="browser-lines"><i /><i /></div>
                <div className="browser-button">conheça mais</div>
              </div>
            </div>
          </div>
          <div className="floating-note floating-note--top">clareza<br /><strong>antes de tudo</strong></div>
          <div className="floating-note floating-note--bottom"><small>feito com</small><strong>intenção.</strong></div>
          <div className="botanical botanical--one"><i /><i /><i /><i /><i /></div>
          <div className="botanical botanical--two"><i /><i /><i /><i /></div>
        </div>
      </section>

      <section className="intro section" aria-labelledby="intro-title">
        <div className="section-index">01 — Nosso olhar</div>
        <div className="intro-content" data-reveal>
          <p className="eyebrow">Um site não precisa parecer complicado</p>
          <h2 id="intro-title">Ele precisa fazer sentido para quem chega e para quem cuida do negócio.</h2>
          <div className="intro-columns">
            <p>
              A Varanda aproxima negócios do digital com comunicação clara, processo transparente e decisões pensadas para a realidade de cada cliente.
            </p>
            <p>
              Cada projeto reúne estratégia, conteúdo e desenvolvimento para entregar um site bonito, útil e fácil de navegar.
            </p>
          </div>
        </div>
        <LeafMark />
      </section>

      <section className="services section" id="servicos" aria-labelledby="services-title">
        <div className="section-heading" data-reveal>
          <div>
            <div className="section-index section-index--light">02 — O que fazemos</div>
            <h2 id="services-title">O formato certo<br />para o seu momento.</h2>
          </div>
          <p>Três formatos, do mais direto ao mais completo. São os mesmos nomes que aparecem no investimento, mais abaixo.</p>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.number} data-reveal>
              <span>{service.number}</span>
              <div className="service-icon" aria-hidden="true"><i /><i /></div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
        <p className="service-note">
          Precisa de loja virtual, agendamento, área de acesso ou automação? <a href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>Vamos avaliar juntos.</a>
        </p>
      </section>
    </>
  );
}
