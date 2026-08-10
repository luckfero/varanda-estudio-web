"use client";

import { useEffect } from "react";

/**
 * Revelação por rolagem: cada `[data-reveal]` aparece ao entrar na tela.
 *
 * Duas travas importantes, e o motivo de cada uma:
 *
 * — `reveal-ready` só entra no `body` depois de o observador existir. É o CSS
 *   que esconde; enquanto a classe não estiver lá, a página está inteira na
 *   tela. Num navegador sem `IntersectionObserver` nada some.
 * — A rede de segurança de um segundo cobre o ambiente que **tem** a API mas
 *   não entrega os eventos (aba que nunca pintou, motor sem suporte real).
 *   Sem ela, a página ficaria em branco para sempre nesse caso.
 */
export function useReveal() {
  useEffect(() => {
    const revealItems = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) return;

    document.body.classList.add("reveal-ready");

    let heardFromObserver = false;
    const observer = new IntersectionObserver(
      (entries) => {
        heardFromObserver = true;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -16% 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));

    const failsafe = window.setTimeout(() => {
      if (heardFromObserver) return;
      revealItems.forEach((item) => item.classList.add("is-visible"));
      observer.disconnect();
    }, 1000);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);
}
