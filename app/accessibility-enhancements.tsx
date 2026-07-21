"use client";

import { useEffect } from "react";

export default function AccessibilityEnhancements() {
  useEffect(() => {
    const menuButton = document.querySelector<HTMLButtonElement>(".menu-toggle");
    const menu = document.querySelector<HTMLElement>("#menu-principal");

    const syncMenuState = () => {
      if (!menuButton || !menu) return;
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      const isMobile = window.innerWidth <= 860;

      menu.toggleAttribute("inert", !isOpen && isMobile);
      menu.setAttribute("aria-hidden", !isOpen && isMobile ? "true" : "false");
    };

    const observer = menuButton ? new MutationObserver(syncMenuState) : null;

    if (menuButton && observer) {
      observer.observe(menuButton, {
        attributes: true,
        attributeFilter: ["aria-expanded"],
      });
    }

    window.addEventListener("resize", syncMenuState);
    syncMenuState();

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncMenuState);
    };
  }, []);

  return null;
}
