"use client";

import { MouseEvent, useEffect } from "react";

/**
 * Rolagem suave até uma âncora da própria página.
 *
 * Cinco seções diferentes levam o visitante para outro ponto da página —
 * cabeçalho, hero, serviços, planos e rodapé. O comportamento é o mesmo em
 * todas, então vive aqui em vez de ser passado de componente em componente.
 *
 * O quadro de animação é de **módulo**, não de instância. Cada seção chama
 * este gancho por conta própria; se cada uma guardasse o próprio quadro,
 * clicar num link do menu durante a rolagem disparada pelo botão do hero
 * deixaria duas animações concorrendo pelo `scrollTo`. Com um só quadro
 * compartilhado, a segunda cancela a primeira, que era o comportamento de
 * quando tudo isto morava num arquivo único.
 */
let quadroDeRolagem: number | null = null;

export function useAncoraSuave(aoNavegar?: () => void) {
  useEffect(() => {
    return () => {
      if (quadroDeRolagem !== null) {
        window.cancelAnimationFrame(quadroDeRolagem);
        quadroDeRolagem = null;
      }
    };
  }, []);

  return function handleNavClick(event: MouseEvent<HTMLAnchorElement>, targetId: string) {
    const target = document.querySelector<HTMLElement>(targetId);
    if (!target) return;

    event.preventDefault();
    aoNavegar?.();

    const header = document.querySelector<HTMLElement>(".site-header");
    const headerOffset = header?.offsetHeight ?? 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    const startTop = window.scrollY;
    const distance = targetTop - startTop;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReducedMotion
      ? 300
      : Math.min(1000, Math.max(620, Math.abs(distance) * 0.17));
    const startTime = window.performance.now();

    if (quadroDeRolagem !== null) {
      window.cancelAnimationFrame(quadroDeRolagem);
    }

    window.history.pushState(null, "", targetId);

    const animateScroll = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startTop + distance * easedProgress);

      if (progress < 1) {
        quadroDeRolagem = window.requestAnimationFrame(animateScroll);
      } else {
        quadroDeRolagem = null;
      }
    };

    quadroDeRolagem = window.requestAnimationFrame(animateScroll);
  };
}
