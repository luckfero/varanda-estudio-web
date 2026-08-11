import type { Viewport } from "next";
import Raiz from "../raiz";

/**
 * Layout raiz do português.
 *
 * São três — um por grupo de rota — porque `lang` no `<html>` precisa
 * acompanhar o idioma da página, e um layout único não sabe qual rota está
 * abaixo dele. Os três delegam para `Raiz`, que é onde a cascata de CSS e o
 * `preload` da fonte moram.
 */
export const viewport: Viewport = {
  themeColor: "#f4efe6",
  colorScheme: "light",
};

export default function PtLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Raiz locale="pt">{children}</Raiz>;
}
