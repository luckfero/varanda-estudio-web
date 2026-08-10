import { imageAspect, imageWidths } from "./image-manifest";

/**
 * Imagem responsiva do carrossel de projetos.
 *
 * Antes as três fotos vinham cruas: a do Brasa era um PNG de 2 MB, e as
 * outras duas eram carregadas direto dos endereços dos outros dois sites.
 * Isso amarrava esta página aos caminhos de arquivo de lá — renomear uma
 * foto no Nívora quebraria o portfólio aqui, sem aviso.
 *
 * Agora as três moram neste repositório e são servidas em AVIF/WebP nas
 * larguras que existem de fato, listadas em `image-manifest.ts`.
 */
const larguras: Record<string, number[]> = imageWidths;

/** "/images/r/brasa-do-vale-hero-800.avif" → "brasa-do-vale-hero" */
function baseName(src: string): string {
  return src.split("/").pop()?.replace(/\.[a-z0-9]+$/i, "") ?? "";
}

function srcSet(name: string, format: "avif" | "webp"): string {
  return (larguras[name] ?? [])
    .map((w) => `/images/r/${name}-${w}.${format} ${w}w`)
    .join(", ");
}

/**
 * Monta o `sizes` a partir da altura da caixa, e não da largura da tela.
 *
 * A foto entra com `object-fit: cover` numa caixa cuja altura é fixa por
 * faixa. Quem manda no recorte é a altura, então a largura de origem que o
 * navegador precisa é `altura da caixa × proporção da foto` — e como as três
 * fotos do portfólio têm proporções diferentes (1,60 · 1,78 · 2,11), um
 * `sizes` único serviria demais para uma e de menos para outra.
 *
 * Antes isto era um literal em `vw`, o que estava errado por construção: a
 * altura da caixa quase não acompanha a largura da tela, então a mesma
 * porcentagem acertava num ponto e errava nos outros. Num celular de 360px a
 * conta pedia 155vw = 558px onde o necessário eram 666px, e a foto saía 20%
 * abaixo do ideal justamente na tela mais estreita.
 *
 * `faixas` são pares `[consulta de mídia | null, altura da caixa em px]`,
 * medidos no site publicado. A última entrada é o padrão, sem consulta.
 */
export function sizesPelaAltura(name: string, faixas: Array<[string | null, number]>): string {
  const proporcao = imageAspect[name] ?? 1;
  return faixas
    .map(([consulta, altura]) => {
      const largura = Math.ceil(altura * proporcao);
      return consulta ? `${consulta} ${largura}px` : `${largura}px`;
    })
    .join(", ");
}

type PictureProps = {
  /** Nome base da imagem, sem caminho nem extensão. */
  name: string;
  alt: string;
  sizes: string;
  loading?: "eager" | "lazy";
};

export default function Picture({ name, alt, sizes, loading = "lazy" }: PictureProps) {
  const disponiveis = larguras[name] ?? [];
  /* Último recurso para quem não aceita AVIF nem WebP: o maior WebP, não o
     original — servir 2 MB para cobrir um navegador que praticamente não
     existe mais seria pior que a doença. */
  const fallback = disponiveis.length
    ? `/images/r/${name}-${disponiveis[disponiveis.length - 1]}.webp`
    : "";

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(name, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, "webp")} sizes={sizes} />
      <img
        src={fallback}
        alt={alt}
        loading={loading}
        fetchPriority={loading === "eager" ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}

export { baseName };
