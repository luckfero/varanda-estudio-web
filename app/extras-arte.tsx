/* GERADO por scripts/gerar-extras-arte.mjs a partir de assets/extras-arte/.
   Não editar à mão: corrigir o SVG mestre e rodar o gerador de novo. */
import type { CSSProperties } from "react";

export default function ArteExtra({ arte }: { arte: string }) {
  switch (arte) {
    case "pagina":
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 480 300">
          <defs>
            <radialGradient id="ex-pagina-luz">
              <stop offset="0" stopColor="#f4b862" stopOpacity="0.5" />
              <stop offset="0.55" stopColor="#e8a33c" stopOpacity="0.16" />
              <stop offset="1" stopColor="#e8a33c" stopOpacity="0" />
            </radialGradient>
          </defs>
        
          <g fill="none" strokeWidth="1.1">
            <path className="ex-calc" style={{"--d":"0ms"} as CSSProperties} d="M240 24V276" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
            <path className="ex-calc" style={{"--d":"40ms"} as CSSProperties} d="M24 153H456" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
            <path className="ex-calc" style={{"--d":"80ms"} as CSSProperties} d="M24 179H456" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
            <rect className="ex-calc" style={{"--d":"120ms"} as CSSProperties} x="370" y="179" width="64" height="80" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="5 5" />
          </g>
          <g fill="var(--terracota)">
            <rect className="ex-calc" style={{"--d":"160ms"} as CSSProperties} x="237" y="150" width="6" height="6" />
            <rect className="ex-calc" style={{"--d":"160ms"} as CSSProperties} x="399" y="150" width="6" height="6" />
            <rect className="ex-calc" style={{"--d":"160ms"} as CSSProperties} x="367" y="256" width="6" height="6" />
            <rect className="ex-calc" style={{"--d":"160ms"} as CSSProperties} x="431" y="256" width="6" height="6" />
          </g>
          <text className="ex-calc" style={{"--d":"160ms"} as CSSProperties} x="402" y="224" textAnchor="middle">+1</text>
        
          <circle className="ex-massa" style={{"--d":"1400ms"} as CSSProperties} cx="402" cy="219" r="78" fill="url(#ex-pagina-luz)" />
        
          <g fill="var(--tinta)" fillOpacity="0.09">
            <path className="ex-massa" style={{"--d":"1200ms"} as CSSProperties} d="M208 41H272V121H208Z" />
            <path className="ex-massa" style={{"--d":"1240ms"} as CSSProperties} d="M46 179H110V259H46Z" />
            <path className="ex-massa" style={{"--d":"1280ms"} as CSSProperties} d="M154 179H218V259H154Z" />
            <path className="ex-massa" style={{"--d":"1320ms"} as CSSProperties} d="M262 179H326V259H262Z" />
          </g>
        
          <g fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
            <path className="ex-traco" style={{"--d":"280ms","--dur":"700ms"} as CSSProperties} pathLength="100" d="M272 57V121H208V41H272V57H208" />
            <path className="ex-traco" style={{"--d":"520ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M240 121V153" />
            <path className="ex-traco" style={{"--d":"640ms","--dur":"620ms"} as CSSProperties} pathLength="100" d="M240 153H78V179" />
            <path className="ex-traco" style={{"--d":"640ms","--dur":"480ms"} as CSSProperties} pathLength="100" d="M240 153H294V179" />
            <path className="ex-traco" style={{"--d":"720ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M186 153V179" />
            <path className="ex-traco" style={{"--d":"760ms","--dur":"700ms"} as CSSProperties} pathLength="100" d="M218 195V259H154V179H218V195H154" />
            <path className="ex-traco" style={{"--d":"800ms","--dur":"700ms"} as CSSProperties} pathLength="100" d="M326 195V259H262V179H326V195H262" />
            <path className="ex-traco" style={{"--d":"860ms","--dur":"700ms"} as CSSProperties} pathLength="100" d="M110 195V259H46V179H110V195H46" />
            <path className="ex-traco" style={{"--d":"1000ms","--dur":"480ms"} as CSSProperties} pathLength="100" d="M294 153H402V179" />
          </g>
        
          <g className="ex-acento" style={{"--d":"1500ms"} as CSSProperties}>
            <path d="M370 198H434V259H370Z" fill="var(--acento)" />
            <path d="M370 179H434V193H370Z" fill="var(--acento)" />
          </g>
        </svg>
      );
    case "redacao":
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 480 300">
          <defs>
            <radialGradient id="ex-redacao-luz" cx="232.06" cy="177.83" r="108" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#f4b862" stopOpacity="0.5" />
              <stop offset="0.55" stopColor="#e8a33c" stopOpacity="0.16" />
              <stop offset="1" stopColor="#e8a33c" stopOpacity="0" />
            </radialGradient>
            <clipPath id="ex-redacao-assento" clipPathUnits="userSpaceOnUse">
              <path d="M192.12 405.23L374.32 -4.02L100.27 -126.03L-81.93 283.22Z" />
            </clipPath>
          </defs>
        
          <g className="ex-calc" style={{"--d":"0ms"} as CSSProperties} fill="none" strokeWidth="1.1">
            <path d="M86 12V288M270 12V288" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
            <path d="M24 165H456" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="7 7" />
            <path d="M70 156H286" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="5 5" />
            <path d="M70 186H286M70 207H286M70 228H286" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="5 5" />
            <path d="M169.94 150.17L435.78 268.53" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="5 5" />
            <path d="M257 164A56 56 0 0 1 252.16 186.78" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="5 5" />
          </g>
          <g className="ex-calc" style={{"--d":"120ms"} as CSSProperties}>
            <rect x="83" y="162" width="6" height="6" fill="var(--terracota)" />
            <rect x="267" y="162" width="6" height="6" fill="var(--terracota)" />
            <rect x="83" y="47" width="6" height="6" fill="var(--terracota)" />
            <rect x="198" y="161" width="6" height="6" fill="var(--terracota)" />
            <rect x="412.68" y="256.58" width="6" height="6" fill="var(--terracota)" />
          </g>
        
          <path className="ex-traco" pathLength="100" style={{"--d":"280ms","--dur":"820ms"} as CSSProperties} d="M178 276H66A8 8 0 0 1 58 268V32A8 8 0 0 1 66 24H290A8 8 0 0 1 298 32V174M298 240.5V268A8 8 0 0 1 290 276H174" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" pathLength="100" style={{"--d":"480ms","--dur":"640ms"} as CSSProperties} d="M146 72H97A11 11 0 0 1 97 50H195A11 11 0 0 1 195 72H142" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" pathLength="100" style={{"--d":"600ms","--dur":"560ms"} as CSSProperties} d="M178 102H90.5A4.5 4.5 0 0 1 90.5 93H265.5A4.5 4.5 0 0 1 265.5 102H174" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" pathLength="100" style={{"--d":"690ms","--dur":"560ms"} as CSSProperties} d="M170 123H90.5A4.5 4.5 0 0 1 90.5 114H249.5A4.5 4.5 0 0 1 249.5 123H166" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" pathLength="100" style={{"--d":"780ms","--dur":"560ms"} as CSSProperties} d="M178 144H90.5A4.5 4.5 0 0 1 90.5 135H265.5A4.5 4.5 0 0 1 265.5 144H174" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" pathLength="100" style={{"--d":"880ms","--dur":"520ms"} as CSSProperties} d="M142 165H90.5A4.5 4.5 0 0 1 90.5 156H193.5A4.5 4.5 0 0 1 193.5 165H138" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-massa" style={{"--d":"1250ms"} as CSSProperties} fill="var(--tinta)" fillOpacity="0.09" d="M146 72H97A11 11 0 0 1 97 50H195A11 11 0 0 1 195 72H142M178 102H90.5A4.5 4.5 0 0 1 90.5 93H265.5A4.5 4.5 0 0 1 265.5 102H174M170 123H90.5A4.5 4.5 0 0 1 90.5 114H249.5A4.5 4.5 0 0 1 249.5 123H166M178 144H90.5A4.5 4.5 0 0 1 90.5 135H265.5A4.5 4.5 0 0 1 265.5 144H174M142 165H90.5A4.5 4.5 0 0 1 90.5 156H193.5A4.5 4.5 0 0 1 193.5 165H138" />
          <circle className="ex-massa" style={{"--d":"1380ms","--dur":"700ms"} as CSSProperties} cx="232.06" cy="177.83" r="108" fill="url(#ex-redacao-luz)" />
        
          <g className="ex-redacao-gesto" style={{"--d":"1480ms"} as CSSProperties}>
            <path className="ex-traco" pathLength="100" style={{"--d":"960ms","--dur":"700ms"} as CSSProperties} d="M283.22 200.61L273.46 222.53L304.52 236.36L308.99 226.31L398.52 266.17A13 13 0 0 0 409.09 242.42L319.57 202.56L324.04 192.51L292.98 178.68L281.59 204.26" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
            <path className="ex-traco" pathLength="100" style={{"--d":"1100ms","--dur":"420ms"} as CSSProperties} d="M308.51 185.6L288.99 229.45" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
            <path className="ex-massa" style={{"--d":"1300ms"} as CSSProperties} fill="var(--tinta)" fillOpacity="0.09" d="M283.22 200.61L273.46 222.53L304.52 236.36L308.99 226.31L398.52 266.17A13 13 0 0 0 409.09 242.42L319.57 202.56L324.04 192.51L292.98 178.68L281.59 204.26" />
            <g clipPath="url(#ex-redacao-assento)">
              <path className="ex-acento" style={{"--d":"1500ms"} as CSSProperties} fill="var(--acento)" fillRule="evenodd" d="M201 164C213.58 175.08 226.67 197.32 245.85 205.86L276.3 216.14L290.13 185.08L262.12 169.32C242.94 160.78 217.65 165.94 201 164ZM252.89 187.1A4.8 4.8 0 1 0 244.12 183.2A4.8 4.8 0 1 0 252.89 187.1ZM244.57 182.19L243.67 184.2L207.29 167.08L207.5 166.62Z" />
            </g>
          </g>
        </svg>
      );
    case "integracao":
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 480 300">
          <defs>
            <clipPath id="ex-integracao-vao">
              <path clipRule="evenodd" d="M0 0H480V300H0Z M50 66H186A10 10 0 0 1 196 76V132L164 116V184L196 168V224A10 10 0 0 1 186 234H50A10 10 0 0 1 40 224V76A10 10 0 0 1 50 66Z M284 66H440V234H284V168L316 184V116L284 132Z" />
            </clipPath>
            <radialGradient id="ex-integracao-luz" cx="240" cy="150" r="150" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#f4b862" stopOpacity="0.5" />
              <stop offset="0.55" stopColor="#e8a33c" stopOpacity="0.16" />
              <stop offset="1" stopColor="#e8a33c" stopOpacity="0" />
            </radialGradient>
          </defs>
        
          <g fill="none" strokeWidth="1.1">
            <path className="ex-calc" style={{"--d":"0ms"} as CSSProperties} d="M24 150H456" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
            <path className="ex-calc" style={{"--d":"40ms"} as CSSProperties} d="M196 30V270M284 30V270" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
            <path className="ex-calc" style={{"--d":"80ms"} as CSSProperties} d="M136 102L232 150L136 198M344 102L248 150L344 198" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="5 5" />
            <path className="ex-calc" style={{"--d":"120ms"} as CSSProperties} d="M164 116L196 132H284L316 116V184L284 168H196L164 184Z" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="5 5" />
          </g>
          <g className="ex-calc" style={{"--d":"140ms"} as CSSProperties}>
            <rect x="229" y="147" width="6" height="6" fill="var(--terracota)" />
            <rect x="245" y="147" width="6" height="6" fill="var(--terracota)" />
            <rect x="161" y="113" width="6" height="6" fill="var(--terracota)" />
            <rect x="161" y="181" width="6" height="6" fill="var(--terracota)" />
            <rect x="313" y="113" width="6" height="6" fill="var(--terracota)" />
            <rect x="313" y="181" width="6" height="6" fill="var(--terracota)" />
          </g>
          <g className="ex-calc" style={{"--d":"160ms"} as CSSProperties}>
            <g fill="none" stroke="var(--acento)" strokeOpacity="0.6" strokeWidth="1.1">
              <path d="M196 44H284M190 50l12-12M278 50l12-12" />
              <path d="M32 26v12M26 32h12M448 262v12M442 268h12" stroke="var(--tinta)" strokeOpacity="0.25" />
            </g>
            <text x="240" y="34" textAnchor="middle">88</text>
          </g>
        
          <path className="ex-traco" style={{"--d":"280ms","--dur":"820ms"} as CSSProperties} pathLength="100" d="M50 66H186A10 10 0 0 1 196 76V132L164 116V184L196 168V224A10 10 0 0 1 186 234H50A10 10 0 0 1 40 224V76A10 10 0 0 1 50 66Z" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" style={{"--d":"420ms","--dur":"820ms"} as CSSProperties} pathLength="100" d="M284 66H440V234H284V168L316 184V116L284 132Z" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" style={{"--d":"900ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M40 92H196" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" style={{"--d":"960ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M284 92H440" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" style={{"--d":"1020ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M440 208H284" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
        
          <path className="ex-massa" style={{"--d":"1200ms"} as CSSProperties} fill="var(--tinta)" fillOpacity="0.09" d="M50 66H186A10 10 0 0 1 196 76V132L164 116V184L196 168V224A10 10 0 0 1 186 234H50A10 10 0 0 1 40 224V76A10 10 0 0 1 50 66Z" />
          <path className="ex-massa" style={{"--d":"1260ms"} as CSSProperties} fill="var(--tinta)" fillOpacity="0.09" d="M284 66H440V234H284V168L316 184V116L284 132Z" />
          <g clipPath="url(#ex-integracao-vao)">
            <rect className="ex-massa" style={{"--d":"1380ms"} as CSSProperties} x="0" y="0" width="480" height="300" fill="url(#ex-integracao-luz)" />
          </g>
        
          <path className="ex-acento" style={{"--d":"1500ms"} as CSSProperties} fill="var(--acento)" d="M167 120.85L195.29 135H284.71L313 120.85V179.15L284.71 165H195.29L167 179.15Z" />
        </svg>
      );
    case "rodada":
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 480 300">
          <defs>
            <radialGradient id="ex-rodada-luz" cx="136" cy="218" r="82" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#f4b862" stopOpacity="0.5" />
              <stop offset="0.55" stopColor="#e8a33c" stopOpacity="0.16" />
              <stop offset="1" stopColor="#e8a33c" stopOpacity="0" />
            </radialGradient>
          </defs>
        
          <g fill="none" strokeWidth="1.1">
            <path className="ex-calc" style={{"--d":"0ms"} as CSSProperties} d="M96 24V276M256 24V276" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
            <path className="ex-calc" style={{"--d":"40ms"} as CSSProperties} d="M24 218H184M256 218H456" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
            <rect className="ex-calc" style={{"--d":"120ms","--dur":"2600ms"} as CSSProperties} x="256" y="204" width="80" height="28" rx="14" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="5 5" />
            <g className="ex-calc" style={{"--d":"140ms","--dur":"2600ms"} as CSSProperties} stroke="var(--terracota)" strokeOpacity="0.45">
              <path d="M246 218H192" strokeDasharray="5 5" />
              <path d="M200 212L192 218L200 224" />
            </g>
          </g>
          <text className="ex-calc" style={{"--d":"160ms","--dur":"2600ms"} as CSSProperties} x="220" y="201" textAnchor="middle">160</text>
        
          <g fill="var(--tinta)" fillOpacity="0.09">
            <path className="ex-massa" style={{"--d":"1200ms"} as CSSProperties} d="M96 88H216V120H96Z" />
            <path className="ex-massa" style={{"--d":"1260ms"} as CSSProperties} d="M256 88H384V188H256Z" />
          </g>
          <circle className="ex-massa" style={{"--d":"1380ms"} as CSSProperties} cx="136" cy="218" r="82" fill="url(#ex-rodada-luz)" />
        
          <g fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path className="ex-traco" style={{"--d":"280ms","--dur":"900ms"} as CSSProperties} pathLength="100" d="M56 30H424V270H56Z" />
            <path className="ex-traco" style={{"--d":"480ms","--dur":"520ms"} as CSSProperties} pathLength="100" d="M56 58H424" />
            <path className="ex-traco" style={{"--d":"560ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M76 44H112" />
            <path className="ex-traco" style={{"--d":"600ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M352 44H368M380 44H404" />
            <path className="ex-traco" style={{"--d":"640ms","--dur":"600ms"} as CSSProperties} pathLength="100" d="M96 88H216V120H96Z" />
            <path className="ex-traco" style={{"--d":"760ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M96 140H224" />
            <path className="ex-traco" style={{"--d":"820ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M96 156H212" />
            <path className="ex-traco" style={{"--d":"880ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M96 172H184" />
            <path className="ex-traco" style={{"--d":"700ms","--dur":"700ms"} as CSSProperties} pathLength="100" d="M256 88H384V188H256Z" />
            <path className="ex-traco" style={{"--d":"900ms","--dur":"520ms"} as CSSProperties} pathLength="100" d="M256 88L384 188M384 88L256 188" />
            <path className="ex-traco" style={{"--d":"1060ms","--dur":"900ms"} as CSSProperties} pathLength="100" strokeLinecap="butt" d="M84 192L85.51 189.69L87.79 188.14L90.5 187.6L93.21 188.14L95.49 189.69L97 192L98.51 189.69L100.79 188.14L103.5 187.6L106.21 188.14L108.49 189.69L110 192L111.51 189.69L113.79 188.14L116.5 187.6L119.21 188.14L121.49 189.69L123 192L124.51 189.69L126.79 188.14L129.5 187.6L132.21 188.14L134.49 189.69L136 192L137.51 189.69L139.79 188.14L142.5 187.6L145.21 188.14L147.49 189.69L149 192L150.51 189.69L152.79 188.14L155.5 187.6L158.21 188.14L160.49 189.69L162 192L163.51 189.69L165.79 188.14L168.5 187.6L171.21 188.14L173.49 189.69L175 192L176.51 189.69L178.79 188.14L181.5 187.6L184.21 188.14L186.49 189.69L188 192L190.31 193.51L191.86 195.79L192.4 198.5L191.86 201.21L190.31 203.49L188 205L190.31 206.51L191.86 208.79L192.4 211.5L191.86 214.21L190.31 216.49L188 218L190.31 219.51L191.86 221.79L192.4 224.5L191.86 227.21L190.31 229.49L188 231L190.31 232.51L191.86 234.79L192.4 237.5L191.86 240.21L190.31 242.49L188 244L186.49 246.31L184.21 247.86L181.5 248.4L178.79 247.86L176.51 246.31L175 244L173.49 246.31L171.21 247.86L168.5 248.4L165.79 247.86L163.51 246.31L162 244L160.49 246.31L158.21 247.86L155.5 248.4L152.79 247.86L150.51 246.31L149 244L147.49 246.31L145.21 247.86L142.5 248.4L139.79 247.86L137.51 246.31L136 244L134.49 246.31L132.21 247.86L129.5 248.4L126.79 247.86L124.51 246.31L123 244L121.49 246.31L119.21 247.86L116.5 248.4L113.79 247.86L111.51 246.31L110 244L108.49 246.31L106.21 247.86L103.5 248.4L100.79 247.86L98.51 246.31L97 244L95.49 246.31L93.21 247.86L90.5 248.4L87.79 247.86L85.51 246.31L84 244L81.69 242.49L80.14 240.21L79.6 237.5L80.14 234.79L81.69 232.51L84 231L81.69 229.49L80.14 227.21L79.6 224.5L80.14 221.79L81.69 219.51L84 218L81.69 216.49L80.14 214.21L79.6 211.5L80.14 208.79L81.69 206.51L84 205L81.69 203.49L80.14 201.21L79.6 198.5L80.14 195.79L81.69 193.51L84 192" />
          </g>
        
          <g className="ex-calc" style={{"--d":"160ms"} as CSSProperties} fill="var(--terracota)">
            <rect x="93" y="215" width="6" height="6" />
            <rect x="253" y="215" width="6" height="6" />
          </g>
        
          <g className="ex-rodada-gesto" style={{"--d":"1900ms"} as CSSProperties}>
            <rect className="ex-acento" style={{"--d":"1450ms"} as CSSProperties} x="96" y="204" width="80" height="28" rx="14" fill="var(--acento)" />
          </g>
        </svg>
      );
    case "avulsa":
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 480 300">
          <defs>
            <clipPath id="ex-avulsa-vao">
              <path clipRule="evenodd" d="M0 0H480V300H0Z M52 62H204A8 8 0 0 1 212 70V230A8 8 0 0 1 204 238H52A8 8 0 0 1 44 230V70A8 8 0 0 1 52 62Z M428 150A88 88 0 1 1 252 150A88 88 0 1 1 428 150Z M398 150A58 58 0 1 1 282 150A58 58 0 1 1 398 150Z" />
            </clipPath>
            <radialGradient id="ex-avulsa-luz" cx="384" cy="108" r="96" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#f4b862" stopOpacity="0.5" />
              <stop offset="0.55" stopColor="#e8a33c" stopOpacity="0.16" />
              <stop offset="1" stopColor="#e8a33c" stopOpacity="0" />
            </radialGradient>
          </defs>
        
          <g fill="none" strokeWidth="1.1">
            <path className="ex-calc" style={{"--d":"0ms"} as CSSProperties} d="M24 150H456" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
            <path className="ex-calc" style={{"--d":"30ms"} as CSSProperties} d="M340 30V270" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
            <path className="ex-calc" style={{"--d":"60ms"} as CSSProperties} d="M24 118H236M24 182H236" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
            <path className="ex-calc" style={{"--d":"90ms"} as CSSProperties} d="M413 150A73 73 0 1 1 267 150A73 73 0 1 1 413 150Z" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="7 7" />
            <path className="ex-calc" style={{"--d":"110ms"} as CSSProperties} d="M62 118H194V182H62ZM62 118L194 182M194 118L62 182" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="5 5" />
          </g>
          <g className="ex-calc" style={{"--d":"140ms"} as CSSProperties}>
            <rect x="337" y="147" width="6" height="6" fill="var(--terracota)" />
            <rect x="337" y="59" width="6" height="6" fill="var(--terracota)" />
            <rect x="425" y="147" width="6" height="6" fill="var(--terracota)" />
            <rect x="125" y="147" width="6" height="6" fill="var(--terracota)" />
            <rect x="59" y="115" width="6" height="6" fill="var(--terracota)" />
            <rect x="191" y="179" width="6" height="6" fill="var(--terracota)" />
          </g>
          <g className="ex-calc" style={{"--d":"160ms"} as CSSProperties}>
            <g fill="none" stroke="var(--acento)" strokeOpacity="0.6" strokeWidth="1.1">
              <path d="M340 48A102 102 0 0 1 442 150M334 54l12-12M436 156l12-12" />
              <path d="M32 26v12M26 32h12M448 262v12M442 268h12" stroke="var(--tinta)" strokeOpacity="0.25" />
            </g>
            <text x="424" y="66" textAnchor="middle">30</text>
          </g>
        
          <path className="ex-traco" style={{"--d":"280ms","--dur":"820ms"} as CSSProperties} pathLength="100" d="M44 84V70A8 8 0 0 1 52 62H204A8 8 0 0 1 212 70V230A8 8 0 0 1 204 238H52A8 8 0 0 1 44 230V82" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" style={{"--d":"400ms","--dur":"560ms"} as CSSProperties} pathLength="100" d="M344 62.09A88 88 0 0 1 427.91 146H397.86A58 58 0 0 0 344 92.14V62.09A88 88 0 0 1 346 62.21" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" style={{"--d":"500ms","--dur":"560ms"} as CSSProperties} pathLength="100" d="M427.91 154A88 88 0 0 1 344 237.91V207.86A58 58 0 0 0 397.86 154H427.91A88 88 0 0 1 427.79 156" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" style={{"--d":"600ms","--dur":"560ms"} as CSSProperties} pathLength="100" d="M336 237.91A88 88 0 0 1 252.09 154H282.14A58 58 0 0 0 336 207.86V237.91A88 88 0 0 1 334 237.79" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" style={{"--d":"700ms","--dur":"560ms"} as CSSProperties} pathLength="100" d="M252.09 146A88 88 0 0 1 336 62.09V92.14A58 58 0 0 0 282.14 146H252.09A88 88 0 0 1 252.21 144" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" style={{"--d":"760ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M345 150A5 5 0 0 1 335 150A5 5 0 0 1 345 150A5 5 0 0 1 344.58 152" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" style={{"--d":"800ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M346.7 150H384" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" strokeLinecap="round" />
          <path className="ex-traco" style={{"--d":"840ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M44 84H212" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
          <path className="ex-traco" style={{"--d":"900ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M62 102H166" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" strokeLinecap="round" />
          <path className="ex-traco" style={{"--d":"960ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M62 202H172" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" strokeLinecap="round" />
          <path className="ex-traco" style={{"--d":"1020ms","--dur":"420ms"} as CSSProperties} pathLength="100" d="M62 216H132" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" strokeLinecap="round" />
        
          <path className="ex-massa" style={{"--d":"1200ms"} as CSSProperties} fill="var(--tinta)" fillOpacity="0.09" d="M52 62H204A8 8 0 0 1 212 70V230A8 8 0 0 1 204 238H52A8 8 0 0 1 44 230V70A8 8 0 0 1 52 62Z" />
          <path className="ex-massa" style={{"--d":"1260ms"} as CSSProperties} fill="var(--tinta)" fillOpacity="0.09" d="M344 62.09A88 88 0 0 1 427.91 146H397.86A58 58 0 0 0 344 92.14Z M427.91 154A88 88 0 0 1 344 237.91V207.86A58 58 0 0 0 397.86 154Z M336 237.91A88 88 0 0 1 252.09 154H282.14A58 58 0 0 0 336 207.86Z M252.09 146A88 88 0 0 1 336 62.09V92.14A58 58 0 0 0 282.14 146Z" />
          <g clipPath="url(#ex-avulsa-vao)">
            <rect className="ex-massa" style={{"--d":"1400ms"} as CSSProperties} x="0" y="0" width="480" height="300" fill="url(#ex-avulsa-luz)" />
          </g>
        
          <g className="ex-avulsa-gesto" style={{"--d":"1080ms"} as CSSProperties}>
            <path className="ex-traco" style={{"--d":"980ms","--dur":"620ms"} as CSSProperties} pathLength="100" d="M128 118H190A4 4 0 0 1 194 122V178A4 4 0 0 1 190 182H66A4 4 0 0 1 62 178V122A4 4 0 0 1 66 118H130" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
            <path className="ex-massa" style={{"--d":"1320ms"} as CSSProperties} fill="var(--tinta)" fillOpacity="0.09" d="M66 118H190A4 4 0 0 1 194 122V178A4 4 0 0 1 190 182H66A4 4 0 0 1 62 178V122A4 4 0 0 1 66 118Z" />
          </g>
        
          <path className="ex-acento" style={{"--d":"1540ms"} as CSSProperties} fill="var(--acento)" d="M344 62.09A88 88 0 0 1 427.91 146H397.86A58 58 0 0 0 344 92.14Z" />
        </svg>
      );
    case "reparo":
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 480 300">
          <defs>
            <clipPath id="ex-reparo-vao">
              <path clipRule="evenodd" d="M0 0H480V300H0Z M60 36H116V136H222L235 150L228 161L243 173L252 184H116V264H60Z M282 136H400A24 24 0 0 1 400 184H252L264 172L260 161L273 149Z" />
            </clipPath>
            <radialGradient id="ex-reparo-luz" cx="252" cy="160" r="124" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#f4b862" stopOpacity="0.5" />
              <stop offset="0.55" stopColor="#e8a33c" stopOpacity="0.16" />
              <stop offset="1" stopColor="#e8a33c" stopOpacity="0" />
            </radialGradient>
          </defs>
        
          <g fill="none" strokeWidth="1.1">
            <path className="ex-calc" style={{"--d":"0ms"} as CSSProperties} d="M24 160H456" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
            <path className="ex-calc" style={{"--d":"30ms"} as CSSProperties} d="M116 24V276" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
            <path className="ex-calc" style={{"--d":"60ms"} as CSSProperties} d="M282 136H456" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="7 7" />
            <path className="ex-calc" style={{"--d":"90ms"} as CSSProperties} d="M252 24V276" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="7 7" />
            <circle className="ex-calc" style={{"--d":"110ms"} as CSSProperties} cx="252" cy="160" r="52" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="5 5" />
          </g>
          <g className="ex-calc" style={{"--d":"140ms"} as CSSProperties} fill="var(--terracota)">
            <rect x="113" y="133" width="6" height="6" />
            <rect x="113" y="181" width="6" height="6" />
            <rect x="249" y="181" width="6" height="6" />
            <rect x="219" y="133" width="6" height="6" />
            <rect x="279" y="133" width="6" height="6" />
            <rect x="397" y="157" width="6" height="6" />
          </g>
          <g className="ex-calc" style={{"--d":"160ms"} as CSSProperties}>
            <path d="M116 222H252M110 228l12-12M246 228l12-12" fill="none" stroke="var(--acento)" strokeOpacity="0.6" strokeWidth="1.1" />
            <text x="184" y="244" textAnchor="middle">136</text>
          </g>
        
          <path className="ex-traco" style={{"--d":"280ms","--dur":"900ms"} as CSSProperties} pathLength="100" d="M60 36H116V136H222L235 150L228 161L243 173L252 184H116V264H60Z" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" strokeLinejoin="round" />
          <path className="ex-massa" style={{"--d":"1200ms"} as CSSProperties} fill="var(--tinta)" fillOpacity="0.09" d="M60 36H116V136H222L235 150L228 161L243 173L252 184H116V264H60Z" />
        
          <g className="ex-reparo-gesto" style={{"--d":"880ms"} as CSSProperties}>
            <path className="ex-traco" style={{"--d":"520ms","--dur":"700ms"} as CSSProperties} pathLength="100" d="M282 136H400A24 24 0 0 1 400 184H252L264 172L260 161L273 149Z" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" strokeLinejoin="round" />
            <path className="ex-massa" style={{"--d":"1260ms"} as CSSProperties} fill="var(--tinta)" fillOpacity="0.09" d="M282 136H400A24 24 0 0 1 400 184H252L264 172L260 161L273 149Z" />
          </g>
        
          <g clipPath="url(#ex-reparo-vao)">
            <rect className="ex-massa" style={{"--d":"1420ms"} as CSSProperties} x="0" y="0" width="480" height="300" fill="url(#ex-reparo-luz)" />
          </g>
        
          <path className="ex-acento" style={{"--d":"1580ms"} as CSSProperties} fill="var(--acento)" d="M222 136L235 150L228 161L243 173L252 184L264 172L260 161L273 149L282 136Z" />
        </svg>
      );
    default:
      return null;
  }
}
