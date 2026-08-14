/* O domínio próprio, não o endereço do worker. Enquanto apontava para
   `.workers.dev`, o `canonical`, o `robots.txt` e o sitemap diziam ao
   buscador que o endereço oficial do site era outro — jogando fora a
   autoridade do domínio comprado. */
export const siteUrl = "https://varandaestudioweb.com";
export const siteName = "Varanda Estúdio Web";
export const siteDescription =
  "Estúdio de criação de sites. Estratégia, direção visual autoral e desenvolvimento para negócios que querem uma presença digital clara e confiável.";
/* Alimenta o `lastmod` do sitemap. **Atualizar a cada publicação que mude
   conteúdo**: data parada diz ao buscador que não há motivo para voltar, e
   foi parte do motivo de o resultado de busca ficar quatro dias com o título
   antigo em agosto de 2026. */
export const siteLastUpdated = new Date("2026-08-14T00:00:00.000Z");
