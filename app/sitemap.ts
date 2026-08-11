import type { MetadataRoute } from "next";
import { caminho, idiomasAlternativos, locales, type Pagina } from "./i18n";
import { siteLastUpdated, siteUrl } from "./site-config";

/* Prioridade e frequência por tipo de página, não por idioma: as três
   versões da home valem o mesmo para o buscador. */
const PESO: Record<Pagina, { priority: number; changeFrequency: "monthly" | "yearly" }> = {
  home: { priority: 1, changeFrequency: "monthly" },
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
