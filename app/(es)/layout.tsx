import type { Viewport } from "next";
import Raiz from "../raiz";

/** Layout raiz del español. Ver la nota en `(pt)/layout.tsx`. */
export const viewport: Viewport = {
  themeColor: "#f4efe6",
  colorScheme: "light",
};

export default function EsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Raiz locale="es">{children}</Raiz>;
}
