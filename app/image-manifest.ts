/* Gerado por scripts/optimize-images.mjs. Não editar à mão. */

/** Larguras que existem de fato para cada imagem em public/images/r/. */
export const imageWidths: Record<string, number[]> = {
  "brasa-do-vale-hero": [480, 800, 1200, 1584],
  "casa-conexao-hero": [480, 800, 1200, 1600],
  "milenio-hero": [480, 800, 1200, 1366],
  "nascente-hero-central": [480, 800, 1200, 1600, 2000, 2250, 3344],
  "nivora-casa-patio-alto": [480, 800, 1200, 1600, 1823],
};

/** Largura ÷ altura do original. O `sizes` do carrossel depende disto:
 *  a foto entra com `object-fit: cover` numa caixa de altura fixa, então
 *  a largura de origem necessária é `altura da caixa × proporção`. */
export const imageAspect: Record<string, number> = {
  "brasa-do-vale-hero": 1.6,
  "casa-conexao-hero": 2.1108,
  "milenio-hero": 2.1113,
  "nascente-hero-central": 1.7768,
  "nivora-casa-patio-alto": 2.1124,
};
