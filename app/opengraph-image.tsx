import { ImageResponse } from "next/og";

export const alt = "Varanda Estúdio Web — criação de sites profissionais";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

/**
 * O cartão que aparece quando o link é colado.
 *
 * **É a peça mais vista do site inteiro por quem ainda não é visitante.** Todo
 * prospect recebe o endereço por WhatsApp, e o que ele vê primeiro é isto, não
 * a home. Um cartão fora da identidade é a primeira coisa que o estúdio mostra
 * dizendo que não cuida dos detalhes.
 *
 * Portado para a identidade nova em 27/08/2026. Até então ele era o único lugar
 * que ninguém tinha olhado: fundo creme `#f4efe6`, texto no verde `#17382c` e
 * um disco verde no lugar da marca, ou seja, a identidade anterior inteira
 * sobrevivendo num arquivo que nenhuma varredura de CSS alcança, porque ele é
 * componente e não folha.
 *
 * **As cores são literais de propósito.** O `next/og` renderiza fora do
 * documento, num Satori próprio: não há `:root`, não há variável CSS e não há
 * cascata. Escrever `var(--acento)` aqui não falha com erro, sai preto. Por
 * isso cada valor abaixo repete o hex do token, com o nome do token ao lado,
 * e mudar a paleta obriga a passar por aqui.
 *
 * A marca é desenhada em caixas, e não pelo SVG de `public/marca/`: o Satori
 * não resolve `currentColor` nem herda cor de contexto. São três peças, as
 * mesmas do símbolo aprovado: a cobertura que não encosta, o piso mais largo
 * que ela, e a luz entre os dois.
 */
export default function OpenGraphImage() {
  /* Os tokens, repetidos aqui porque o Satori não tem cascata. */
  const chao = "#14110e";
  const nivel1 = "#1e1a16";
  const tinta = "#f4efe6";
  const tintaMedia = "#cabfb1";
  const tintaFraca = "#a89d8f";
  const acento = "#e8a33c";
  const fio = "rgba(244, 239, 230, 0.13)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 80px",
          background: chao,
          color: tinta,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* A marca em caixas. A cobertura é uma caixa com o topo arredondado
              e as bordas só em cima e nos lados, o que deixa o pé aberto; o
              piso é uma barra separada e mais larga; a luz é a meia pastilha
              deitada sobre ele. A folga entre a perna e o piso é a ideia. */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 60 }}>
            <div
              style={{
                width: 44,
                height: 30,
                borderTop: `5px solid ${tinta}`,
                borderLeft: `5px solid ${tinta}`,
                borderRight: `5px solid ${tinta}`,
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
              }}
            />
            <div style={{ height: 7, display: "flex" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 22,
                  height: 11,
                  background: acento,
                  borderTopLeftRadius: 11,
                  borderTopRightRadius: 11,
                }}
              />
              <div style={{ width: 56, height: 5, background: tinta, borderRadius: 3 }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, letterSpacing: -0.4 }}>Varanda</div>
            <div style={{ fontSize: 14, letterSpacing: 4, color: tintaFraca, marginTop: 4 }}>
              ESTÚDIO WEB
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ maxWidth: 940, fontSize: 74, lineHeight: 1.02, letterSpacing: -2.2 }}>
            Sites que dão{" "}
            <span style={{ color: acento }}>espaço</span> para o seu negócio crescer.
          </div>
          <div style={{ fontSize: 26, color: tintaMedia, maxWidth: 800, lineHeight: 1.4 }}>
            Estratégia, direção visual autoral e desenvolvimento, do zero.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            paddingTop: 22,
            borderTop: `1px solid ${fio}`,
            color: tintaFraca,
          }}
        >
          <span style={{ letterSpacing: 2 }}>SÃO PAULO, BRASIL</span>
          <span
            style={{
              background: nivel1,
              color: acento,
              padding: "8px 18px",
              borderRadius: 999,
              letterSpacing: 2,
              fontSize: 18,
            }}
          >
            ATENDIMENTO REMOTO
          </span>
        </div>
      </div>
    ),
    size,
  );
}
