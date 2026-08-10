import { ImageResponse } from "next/og";

export const alt = "Varanda Estúdio Web — criação de sites profissionais";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "#f4efe6",
          color: "#17382c",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: 999, background: "#214d3b" }} />
          <div style={{ fontSize: 34 }}>Varanda Estúdio Web</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ maxWidth: 900, fontSize: 82, lineHeight: 1.02 }}>
            Sites que dão espaço para o seu negócio crescer.
          </div>
          <div style={{ fontFamily: "sans-serif", fontSize: 28, color: "#625b54" }}>
            Estratégia, direção visual autoral e desenvolvimento, do zero.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "sans-serif", fontSize: 24 }}>
          <span>São Paulo, Brasil</span>
          <span style={{ color: "#b86749" }}>Atendimento remoto</span>
        </div>
      </div>
    ),
    size,
  );
}
