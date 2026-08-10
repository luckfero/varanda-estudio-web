"use client";

import { TouchEvent, useRef, useState } from "react";
import { projects } from "./data";
import { CarouselArrow } from "./icons";
import Picture from "./picture";

/**
 * Carrossel de trabalhos.
 *
 * O índice atual e o gesto de arrasto são assunto exclusivo desta seção —
 * nenhuma outra parte da página lê ou muda esses valores, então eles moram
 * aqui em vez de subirem para a página.
 */
export default function SectionPortfolio() {
  const [currentProject, setCurrentProject] = useState(0);
  const touchStartX = useRef<number | null>(null);

  function showProject(index: number) {
    setCurrentProject((index + projects.length) % projects.length);
  }

  function handleProjectTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleProjectTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 45) return;
    showProject(currentProject + (distance < 0 ? 1 : -1));
  }

  return (
      <section className="portfolio section" id="portfolio" aria-labelledby="portfolio-title">
        <div className="portfolio-intro" data-reveal>
          <div className="section-index">03 — Trabalhos desenvolvidos</div>
          <h2 id="portfolio-title">Ideias ganhando<br /><em>forma e presença.</em></h2>
        </div>

        <div
          className="project-carousel"
          role="region"
          aria-roledescription="carrossel"
          aria-label="Trabalhos desenvolvidos pela Varanda"
          data-reveal
        >
          <div
            className="project-track"
            style={{ transform: `translateX(-${currentProject * 100}%)` }}
            onTouchStart={handleProjectTouchStart}
            onTouchEnd={handleProjectTouchEnd}
          >
            {projects.map((project, index) => (
              <div
                className="project-slide"
                key={project.name}
                aria-hidden={currentProject !== index}
              >
                <article className="project">
                  {project.url ? (
                    <a
                      className="project-visual"
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Abrir demonstração do projeto ${project.name} em uma nova aba`}
                      tabIndex={currentProject === index ? 0 : -1}
                    >
                      {/* Abaixo da dobra: carregamento preguiçoso de propósito.

                          O `sizes` não é a largura da caixa. A foto entra
                          com `object-fit: cover` numa caixa de proporção
                          diferente, então quem determina o recorte é a
                          altura — e a largura de imagem necessária passa
                          da largura visível. Medido em cada faixa: 152vw
                          no celular, 103vw em 768, 91vw em 1024, 79vw em
                          1280, 68vw em 1440 e 61vw em 1920. */}
                      <Picture
                        name={project.image}
                        alt={project.imageAlt}
                        sizes="(max-width: 700px) 155vw, (max-width: 900px) 103vw, (max-width: 1100px) 91vw, (max-width: 1350px) 79vw, (max-width: 1600px) 68vw, 61vw"
                      />
                      <div className="project-browser" aria-hidden="true">
                        <span /><span /><span />
                      </div>
                    </a>
                  ) : (
                    <div className={`project-visual project-visual--placeholder project-visual--placeholder-${index + 1}`} role="img" aria-label="Espaço reservado para um próximo projeto">
                      <div className="project-browser" aria-hidden="true">
                        <span /><span /><span />
                      </div>
                      <div className="project-placeholder-content" aria-hidden="true">
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>novo projeto</strong>
                        <i />
                      </div>
                      <div className="project-stamp project-stamp--soon">em breve</div>
                    </div>
                  )}
                  <div className="project-info">
                    <p className="project-label">{project.label}</p>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <ul aria-label={project.placeholder ? "Características previstas" : "Entregas do projeto"}>
                      {project.features.map((feature) => <li key={feature}>{feature}</li>)}
                    </ul>
                    {!project.url && (
                      <span className="project-soon">Novos trabalhos serão adicionados aqui.</span>
                    )}
                  </div>
                </article>
              </div>
            ))}
          </div>

          <div className="carousel-footer">
            <p className="carousel-status" aria-live="polite">
              <strong>{String(currentProject + 1).padStart(2, "0")}</strong>
              <span>/ {String(projects.length).padStart(2, "0")}</span>
              <span className="sr-only">Projeto {currentProject + 1} de {projects.length}: {projects[currentProject].name}</span>
            </p>
            <div className="carousel-dots" aria-label="Escolher projeto">
              {projects.map((project, index) => (
                <button
                  type="button"
                  key={project.name}
                  className={currentProject === index ? "is-active" : ""}
                  aria-label={`Mostrar ${project.name}`}
                  aria-current={currentProject === index ? "true" : undefined}
                  onClick={() => showProject(index)}
                />
              ))}
            </div>
            <div className="carousel-buttons">
              <button type="button" aria-label="Projeto anterior" onClick={() => showProject(currentProject - 1)}>
                <CarouselArrow direction="previous" />
              </button>
              <button type="button" aria-label="Próximo projeto" onClick={() => showProject(currentProject + 1)}>
                <CarouselArrow direction="next" />
              </button>
            </div>
          </div>
        </div>
      </section>
  );
}
