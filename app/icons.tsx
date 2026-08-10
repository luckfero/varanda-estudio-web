/**
 * Os quatro sinais graficos da pagina. Sem estado e sem dependencia:
 * o unico motivo de estarem juntos e serem SVG embutido.
 */

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowDownRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7h10v10M7 17 17 7" />
    </svg>
  );
}

export function CarouselArrow({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg className={direction === "previous" ? "is-previous" : ""} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export function LeafMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`leaf-mark${small ? " leaf-mark--small" : ""}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

