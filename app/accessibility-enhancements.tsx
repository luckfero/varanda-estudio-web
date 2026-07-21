"use client";

import { useEffect } from "react";

export default function AccessibilityEnhancements() {
  useEffect(() => {
    const menuButton = document.querySelector<HTMLButtonElement>(".menu-toggle");
    const menu = document.querySelector<HTMLElement>("#menu-principal");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncMenuState = () => {
      if (!menuButton || !menu) return;
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menu.toggleAttribute("inert", !isOpen && window.innerWidth <= 860);
      menu.setAttribute("aria-hidden", !isOpen && window.innerWidth <= 860 ? "true" : "false");
    };

    const observer = menuButton
      ? new MutationObserver(syncMenuState)
      : null;

    observer?.observe(menuButton!, {
      attributes: true,
      attributeFilter: ["aria-expanded"],
    });

    const onResize = () => syncMenuState();
    window.addEventListener("resize", onResize);
    syncMenuState();

    const onDocumentClick = (event: globalThis.MouseEvent) => {
      if (!reducedMotion.matches) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!target) return;

      const selector = target.getAttribute("href");
      if (!selector || selector === "#") return;
      const destination = document.querySelector<HTMLElement>(selector);
      if (!destination) return;

      event.preventDefault();
      event.stopPropagation();
      const header = document.querySelector<HTMLElement>(".site-header");
      const top = destination.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight ?? 0);
      window.history.pushState(null, "", selector);
      window.scrollTo({ top, behavior: "auto" });
      destination.focus({ preventScroll: true });
    };

    document.addEventListener("click", onDocumentClick, true);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, []);

  return null;
}
