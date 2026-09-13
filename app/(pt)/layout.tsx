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
/* O CHÃO DO SITE, e não a tinta dele.
 *
 * Os dois valores diziam `#f4efe6` e `light`, que são a cor do TEXTO e o
 * esquema da identidade ANTERIOR. O site tem um chão só desde 27/08/2026, e
 * ele é `--chao`, `#14110e` em `base.css`.
 *
 * Onde isso aparecia: no celular, `theme-color` pinta a barra do navegador,
 * então ela nascia creme em cima de uma página quase preta. E `color-scheme:
 * light` manda o navegador desenhar campo de formulário, barra de rolagem
 * nativa e menu de seleção com as cores claras do sistema, sobre o mesmo
 * chão escuro.
 *
 * Repetido nos três layouts porque são três raízes, uma por idioma. Se
 * `--chao` mudar em `base.css`, muda aqui também: o Next não lê CSS. */
export const viewport: Viewport = {
  themeColor: "#14110e",
  colorScheme: "dark",
};

export default function PtLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Raiz locale="pt">{children}</Raiz>;
}
