import type { MetadataRoute } from "next";
import { caminho, idiomasAlternativos, locales, type Pagina } from "./i18n";
import { siteLastUpdated, siteUrl } from "./site-config";

/* Prioridade e frequência por tipo de página, não por idioma: as três
   versões da home valem o mesmo para o buscador. */
const PESO: Record<Pagina, { priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }> = {
  /* A home era `monthly`, e é a página que mais muda: preço, portfólio e
     metadados mexeram quatro vezes em uma semana. O buscador trata isto como
     dica e não como ordem, mas dica errada não ajuda. */
  home: { priority: 1, changeFrequency: "weekly" },
  privacidade: { priority: 0.3, changeFrequency: "yearly" },
};

export default function sitemap(): MetadataRoute.Sitemap {
  const paginas: Pagina[] = ["home", "privacidade"];

  return paginas.flatMap((pagina) => {
    /* O mesmo mapa que os metadados publicam. No sitemap ele precisa virar
       endereço absoluto — caminho relativo aqui é ignorado em silêncio. */
    const alternates = Object.fromEntries(
      Object.entries(idiomasAlternativos(pagina)).map(([lang, path]) => [lang, `${siteUrl}${path}`]),
    );

    return locales.map((locale) => ({
      url: `${siteUrl}${caminho(locale, pagina)}`,
      lastModified: siteLastUpdated,
      changeFrequency: PESO[pagina].changeFrequency,
      priority: PESO[pagina].priority,
      alternates: { languages: alternates },
    }));
  });
}
