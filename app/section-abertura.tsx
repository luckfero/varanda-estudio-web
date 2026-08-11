"use client";

import { ArcoMark, ArrowDownRightIcon, ArrowIcon } from "./icons";
import type { Dicionario } from "./i18n";
import { useAncoraSuave } from "./use-ancora-suave";

/**
 * Hero, apresentação e serviços — as três seções acima do portfólio.
 *
 * Recebe as três fatias que usa, e não o dicionário inteiro. A diferença não
 * é de estilo: **tudo que é passado como propriedade para um componente
 * cliente vai serializado no payload enviado ao navegador**, usado ou não.
 * Com o dicionário inteiro, o texto da política de privacidade — que é o
 * único lugar onde o nome da pessoa aparece — viajava no fonte de todas as
 * páginas, invisível na tela e presente no HTML. Há teste para isso.
 */
export default function SectionAbertura({
  hero,
  intro,
  servicos,
}: {
  hero: Dicionario["hero"];
  intro: Dicionario["intro"];
  servicos: Dicionario["servicos"];
}) {
  const t = { hero, intro, servicos };
  const handleNavClick = useAncoraSuave();

  return (
    <>
      <section className="hero" id="inicio">
        <div className="hero-copy" data-reveal>
          <p className="kicker"><span /> {t.hero.kicker}</p>
          <h1>{t.hero.tituloAntes}<em>{t.hero.tituloDestaque}</em>{t.hero.tituloDepois}</h1>
          <p className="hero-lead">{t.hero.lead}</p>
          <div className="hero-actions">
            <a className="button button--primary" href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
              {t.hero.ctaPrimario} <ArrowIcon />
            </a>
            <a className="text-link" href="#portfolio" onClick={(event) => handleNavClick(event, "#portfolio")}>{t.hero.ctaSecundario} <ArrowDownRightIcon /></a>
          </div>
          <div className="hero-footnote">
            <span>{t.hero.local}</span>
            <span>{t.hero.atendimento}</span>
          </div>
        </div>

        <div className="hero-art" role="img" aria-label={t.hero.arteAlt} data-reveal>
          <div className="hero-sun" />
          <div className="hero-arch">
            <div className="browser-card">
              <div className="browser-top"><i /><i /><i /><span>{t.hero.navegadorEndereco}</span></div>
              <div className="browser-body">
                <div className="browser-brand">{t.hero.navegadorMarca}</div>
                {/* O título do navegador de mentira quebra em duas linhas, e o
                    ponto da quebra muda com a língua — por isso vem do
                    dicionário com a marcação junto, e não como texto puro. */}
                <div className="browser-title" dangerouslySetInnerHTML={{ __html: t.hero.navegadorTitulo }} />
                <div className="browser-lines"><i /><i /></div>
                <div className="browser-button">{t.hero.navegadorBotao}</div>
              </div>
            </div>
          </div>
          <div className="floating-note floating-note--top">{t.hero.notaTopo}<br /><strong>{t.hero.notaTopoForte}</strong></div>
          <div className="floating-note floating-note--bottom"><small>{t.hero.notaBaixo}</small><strong>{t.hero.notaBaixoForte}</strong></div>
          <div className="botanical botanical--one"><i /><i /><i /><i /><i /></div>
          <div className="botanical botanical--two"><i /><i /><i /><i /></div>
        </div>
      </section>

      <section className="intro section" aria-labelledby="intro-title">
        <div className="section-index">{t.intro.indice}</div>
        <div className="intro-content" data-reveal>
          <p className="eyebrow">{t.intro.eyebrow}</p>
          <h2 id="intro-title">{t.intro.titulo}</h2>
          <div className="intro-columns">
            <p>{t.intro.coluna1}</p>
            <p>{t.intro.coluna2}</p>
          </div>
        </div>
        <ArcoMark />
      </section>

      <section className="services section" id="servicos" aria-labelledby="services-title">
        <div className="section-heading" data-reveal>
          <div>
            <div className="section-index section-index--light">{t.servicos.indice}</div>
            <h2 id="services-title" dangerouslySetInnerHTML={{ __html: t.servicos.titulo }} />
          </div>
          <p>{t.servicos.resumo}</p>
        </div>
        <div className="service-grid">
          {t.servicos.lista.map((service) => (
            <article className="service-card" key={service.number} data-reveal>
              <span>{service.number}</span>
              <div className="service-icon" aria-hidden="true"><i /><i /></div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
        <p className="service-note">
          {t.servicos.nota} <a href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>{t.servicos.notaLink}</a>
        </p>
      </section>
    </>
  );
}
