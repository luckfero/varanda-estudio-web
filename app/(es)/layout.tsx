import type { Viewport } from "next";
import Raiz from "../raiz";

/** Layout raiz del español. Ver la nota en `(pt)/layout.tsx`. */
/* El suelo del sitio, no su tinta. Ver la nota en `(pt)/layout.tsx`. */
export const viewport: Viewport = {
  themeColor: "#14110e",
  colorScheme: "dark",
};

export default function EsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Raiz locale="es">{children}</Raiz>;
}
