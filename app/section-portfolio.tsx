"use client";

import { TouchEvent, useRef, useState } from "react";
import { projectAssets } from "./data";
import { CarouselArrow } from "./icons";
import type { Dicionario } from "./i18n";
import Picture, { sizesPelaAltura } from "./picture";

/**
 * Altura da caixa do carrossel por faixa de tela, em px CSS.
 *
 * Medida no site publicado, não deduzida do CSS: a altura sai de um
 * `min-height` (360px abaixo de 600, 480px acima) somado ao que o conteúdo
 * empurra, então o valor real não está escrito em lugar nenhum. Cada entrada
 * é o **maior** valor observado dentro da sua faixa.
 *
 * Se o layout do carrossel mudar, estes números precisam ser medidos de
 * novo — é o que garante que nenhuma tela receba foto abaixo do necessário.
 */
const ALTURAS_DA_CAIXA: Array<[string | null, number]> = [
  ["(max-width: 374px)", 415],
  ["(max-width: 599px)", 388],
  ["(max-width: 860px)", 494],
  ["(max-width: 1100px)", 580],
  ["(max-width: 1350px)", 629],
  ["(max-width: 1600px)", 614],
  [null, 736],
];

/**
 * Carrossel de trabalhos.
 *
 * O índice atual e o gesto de arrasto são assunto exclusivo desta seção —
 * nenhuma outra parte da página lê ou muda esses valores, então eles moram
 * aqui em vez de subirem para a página.
 *
 * O texto de cada projeto vem do dicionário e a imagem e o endereço vêm de
 * `projectAssets`, casados pela posição. Projeto descrito no dicionário sem
 * arquivo correspondente cai no cartão de "em breve" em vez de quebrar.
 */
export default function SectionPortfolio({ portfolio }: { portfolio: Dicionario["portfolio"] }) {
  const [currentProject, setCurrentProject] = useState(0);
  const touchStartX = useRef<number | null>(null);
  /* Só a fatia do portfólio: propriedade de componente cliente viaja
     serializada até o navegador, e o dicionário inteiro levaria junto o
     texto da política — o único lugar com o nome da pessoa. */
  const t = { portfolio };
  const projects = portfolio.projetos;

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
          <div className="section-index">{t.portfolio.indice}</div>
          <h2 id="portfolio-title">{t.portfolio.tituloAntes}<br /><em>{t.portfolio.tituloDestaque}</em></h2>
          <p className="portfolio-aviso">{t.portfolio.aviso}</p>
        </div>

        <div
          className="project-carousel"
          role="region"
          aria-roledescription={t.portfolio.carrossel}
          aria-label={t.portfolio.carrosselLabel}
          data-reveal
        >
          <div
            className="project-track"
            style={{ transform: `translateX(-${currentProject * 100}%)` }}
            onTouchStart={handleProjectTouchStart}
            onTouchEnd={handleProjectTouchEnd}
          >
            {projects.map((project, index) => {
              const asset = projectAssets[index];
              return (
              <div
                className="project-slide"
                key={project.name}
                aria-hidden={currentProject !== index}
              >
                <article className="project">
                  {asset?.url ? (
                    <a
                      className="project-visual"
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${t.portfolio.abrirAntes}${project.name}${t.portfolio.abrirDepois}`}
                      tabIndex={currentProject === index ? 0 : -1}
                    >
                      {/* Abaixo da dobra: carregamento preguiçoso de propósito.

                          O `sizes` sai de `ALTURAS_DA_CAIXA` multiplicado
                          pela proporção de cada foto — o porquê está em
                          `sizesPelaAltura`, em picture.tsx. */}
                      <Picture
                        name={asset.image}
                        alt={project.imageAlt}
                        sizes={sizesPelaAltura(asset.image, ALTURAS_DA_CAIXA)}
                      />
                      <div className="project-browser" aria-hidden="true">
                        <span /><span /><span />
                      </div>
                    </a>
                  ) : (
                    <div className={`project-visual project-visual--placeholder project-visual--placeholder-${index + 1}`} role="img" aria-label={t.portfolio.reservado}>
                      <div className="project-browser" aria-hidden="true">
                        <span /><span /><span />
                      </div>
                      <div className="project-placeholder-content" aria-hidden="true">
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{t.portfolio.novoProjeto}</strong>
                        <i />
                      </div>
                      <div className="project-stamp project-stamp--soon">{t.portfolio.emBreve}</div>
                    </div>
                  )}
                  <div className="project-info">
                    <p className="project-label">{project.label}</p>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <ul aria-label={asset?.url ? t.portfolio.entregas : t.portfolio.previstas}>
                      {project.features.map((feature) => <li key={feature}>{feature}</li>)}
                    </ul>
                    {!asset?.url && (
                      <span className="project-soon">{t.portfolio.novosTrabalhos}</span>
                    )}
                  </div>
                </article>
              </div>
            );
            })}
          </div>

          <div className="carousel-footer">
            <p className="carousel-status" aria-live="polite">
              <strong>{String(currentProject + 1).padStart(2, "0")}</strong>
              <span>/ {String(projects.length).padStart(2, "0")}</span>
              <span className="sr-only">
                {t.portfolio.projetoAntes}{currentProject + 1}{t.portfolio.projetoDe}{projects.length}: {projects[currentProject].name}
              </span>
            </p>
            <div className="carousel-dots" aria-label={t.portfolio.escolher}>
              {projects.map((project, index) => (
                <button
                  type="button"
                  key={project.name}
                  className={currentProject === index ? "is-active" : ""}
                  aria-label={`${t.portfolio.mostrar}${project.name}`}
                  aria-current={currentProject === index ? "true" : undefined}
                  onClick={() => showProject(index)}
                />
              ))}
            </div>
            <div className="carousel-buttons">
              <button type="button" aria-label={t.portfolio.anterior} onClick={() => showProject(currentProject - 1)}>
                <CarouselArrow direction="previous" />
              </button>
              <button type="button" aria-label={t.portfolio.proximo} onClick={() => showProject(currentProject + 1)}>
                <CarouselArrow direction="next" />
              </button>
            </div>
          </div>
        </div>
      </section>
  );
}
