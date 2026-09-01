"use client";

/**
 * CursorGrid, do React Bits (reactbits.dev/animations/cursor-grid), variante
 * JS-CSS, trazido em 28/08/2026 do registro
 * `https://reactbits.dev/r/CursorGrid-JS-CSS.json`.
 *
 * Zero dependencia: o registro declara `dependencies: []` e o arquivo nao
 * importa nada alem do React. Nenhum pacote entrou por causa dele.
 *
 * SETE MUDANCAS EM CIMA DO ORIGINAL, e so estas. O resto e identico, para
 * dar para comparar com a origem no dia em que ela mudar:
 *
 * 1. `"use client"`. O componente usa `useRef` e `useEffect`.
 *
 * 2. `children`. O original e uma caixa vazia que so desenha. Aqui ele
 *    ENVOLVE o conteudo, e a razao e concreta: os ouvintes de ponteiro moram
 *    no container, e evento de ponteiro SOBE. Como irmao atras do conteudo,
 *    ele so receberia movimento nos vaos entre os elementos, e o rastro
 *    morreria em cima de cada texto e de cada botao.
 *
 * 3. `prefers-reduced-motion: reduce` desliga tudo: sem ouvinte, sem quadro,
 *    sem canvas. Aqui nao vale a regra da casa de REDUZIR em vez de zerar
 *    (a 9.20): ela existe para movimento que ajuda a compreender, e este e
 *    decorativo pelo desenho. O que sobra e a grade estatica que a hero ja
 *    tinha, ou seja, a peca continua inteira sem o efeito.
 *
 * 4. `pointer: fine` idem. Em toque nao existe cursor: o `pointermove` so
 *    dispara enquanto o dedo arrasta, e a cada arrasto isso acorda um laco de
 *    canvas para desenhar um rastro que ninguem pediu. Custa bateria e nao
 *    entrega nada.
 *
 * 5. `escutaNoPai`. Os ouvintes de ponteiro passam a morar no elemento PAI em
 *    vez de no proprio container. Aqui a peca e uma camada absoluta atras do
 *    conteudo da secao, e nao a envolve: envolver quebraria as regras
 *    `:is(.secao, .section) > .caixa` e `.abertura > .caixa`, que sao de
 *    FILHO DIRETO e definem o recuo de todas as secoes do site. Escutando no
 *    pai, o efeito recebe o movimento sobre todo o conteudo, porque evento de
 *    ponteiro sobe, e nenhum seletor existente muda de significado.
 *
 * 6. A escrita em `propsRef` saiu do corpo do componente para dentro de um
 *    efeito. Era atribuicao a um ref DURANTE A RENDERIZACAO, que o lint do
 *    projeto recusa. O comentario no lugar explica por que a POSICAO daquele
 *    efeito importa.
 *
 * 7. `origemNoCanto`. A malha comeca no canto superior esquerdo em vez de
 *    centralizada, para cair exatamente sobre a grade parada da secao, que e
 *    `background-image` e nao tem deslocamento. Com ela, `cellSize` precisa
 *    ser o MESMO valor do `background-size` daquela grade, hoje 96px.
 *
 * As duas consultas sao lidas UMA VEZ, na montagem. Trocar a preferencia com
 * a pagina aberta nao religa o efeito, e isso e aceitavel: quem muda essa
 * configuracao recarrega.
 */
import { useRef, useEffect } from 'react';
import "./cursor-grid.css";

const FALLOFF_CURVES = {
  linear: t => t,
  smooth: t => t * t * (3 - 2 * t),
  sharp: t => t * t * t
};

const hexToRgb = hex => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const num = parseInt(v.slice(0, 6), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const CursorGrid = ({
  cellSize = 70,
  color = '#D946EF',
  radius = 140,
  falloff = 'smooth',
  holdTime = 400,
  fadeDuration = 800,
  lineWidth = 1.2,
  maxOpacity = 1,
  fillOpacity = 0,
  gridOpacity = 0,
  cellRadius = 0,
  clickPulse = true,
  pulseSpeed = 600,
  className = '',
  escutaNoPai = false,
  origemNoCanto = false,
  children
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const propsRef = useRef({});
  const wakeRef = useRef(null);

  /* MUDANCA 6: isto era atribuicao direta no corpo do componente, ou seja,
     escrita num ref DURANTE A RENDERIZACAO, e o lint do projeto recusa com
     "Cannot access refs during render". Dentro de um efeito sem lista de
     dependencia ele roda depois de toda renderizacao, que e o mesmo efeito
     pratico e sem quebrar a regra.

     A POSICAO IMPORTA: este efeito e declarado ANTES do que monta o canvas, e
     efeitos rodam na ordem em que sao declarados. Na primeira montagem, o
     `rebuild()` la embaixo le `propsRef.current.cellSize`, entao ele precisa
     ja estar preenchido. Mover este bloco para depois daquele deixa a primeira
     grade com celula `undefined`. */
  useEffect(() => {
    propsRef.current = {
      cellSize,
      color,
      radius,
      falloff,
      holdTime,
      fadeDuration,
      lineWidth,
      maxOpacity,
      fillOpacity,
      gridOpacity,
      cellRadius,
      clickPulse,
      pulseSpeed
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    /* Ver as mudancas 3 e 4 no cabecalho do arquivo. Sai antes de criar
       contexto, ouvinte ou quadro: nada e alocado. */
    if (typeof window !== 'undefined' && window.matchMedia) {
      const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const ponteiroGrosso = !window.matchMedia('(pointer: fine)').matches;
      if (semMovimento || ponteiroGrosso) return;
    }

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Grid state: one alpha + timestamp pair per cell, indexed row-major.
    let cols = 0;
    let rows = 0;
    let offX = 0;
    let offY = 0;
    let alphas = new Float32Array(0);
    let touched = new Float64Array(0);
    let w = 0;
    let h = 0;
    const pulses = [];
    let raf = 0;
    let running = false;
    let lastFrame = 0;

    const rebuild = () => {
      const p = propsRef.current;
      w = container.offsetWidth;
      h = container.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / p.cellSize) + 1;
      rows = Math.ceil(h / p.cellSize) + 1;
      /* MUDANCA 7: a malha pode comecar no CANTO em vez de centralizada.
         O original centraliza para as celulas das bordas serem cortadas por
         igual dos dois lados. Aqui a grade precisa cair EM CIMA da grade
         parada da secao (`.grade-fina`), que e um `background-image` e comeca
         no canto superior esquerdo do elemento, sem deslocamento. Centralizada,
         a malha do cursor ficava fora de fase com ela e as celulas acesas
         apareciam atravessadas nas linhas paradas. */
      if (origemNoCanto) {
        offX = 0;
        offY = 0;
      } else {
        // Center the lattice so edge cells crop evenly on both sides
        offX = (w - cols * p.cellSize) / 2;
        offY = (h - rows * p.cellSize) / 2;
      }
      alphas = new Float32Array(cols * rows);
      touched = new Float64Array(cols * rows);
    };

    const cellCenter = i => {
      const p = propsRef.current;
      const cx = offX + (i % cols) * p.cellSize + p.cellSize / 2;
      const cy = offY + Math.floor(i / cols) * p.cellSize + p.cellSize / 2;
      return [cx, cy];
    };

    // Light up every cell whose center falls inside the radius, with the
    // configured falloff curve mapping distance to brightness.
    const energize = (x, y, boost) => {
      const p = propsRef.current;
      const r = Math.max(p.radius, 1);
      const ease = FALLOFF_CURVES[p.falloff] ?? FALLOFF_CURVES.linear;
      const now = performance.now();
      const minCol = Math.max(0, Math.floor((x - r - offX) / p.cellSize));
      const maxCol = Math.min(cols - 1, Math.floor((x + r - offX) / p.cellSize));
      const minRow = Math.max(0, Math.floor((y - r - offY) / p.cellSize));
      const maxRow = Math.min(rows - 1, Math.floor((y + r - offY) / p.cellSize));
      for (let cRow = minRow; cRow <= maxRow; cRow++) {
        for (let cCol = minCol; cCol <= maxCol; cCol++) {
          const i = cRow * cols + cCol;
          const [cx, cy] = cellCenter(i);
          const dist = Math.hypot(cx - x, cy - y);
          if (dist > r) continue;
          const level = ease(1 - dist / r) * p.maxOpacity * (boost ?? 1);
          if (level > alphas[i]) {
            alphas[i] = level;
            touched[i] = now;
          } else if (level > 0) {
            touched[i] = now;
          }
        }
      }
    };

    const draw = now => {
      const p = propsRef.current;
      const dt = Math.min(now - lastFrame, 50);
      lastFrame = now;
      ctx.clearRect(0, 0, w, h);
      const [cr, cg, cb] = hexToRgb(p.color);

      // Optional faint static lattice
      if (p.gridOpacity > 0) {
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${p.gridOpacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let cCol = 0; cCol <= cols; cCol++) {
          const x = Math.round(offX + cCol * p.cellSize) + 0.5;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let cRow = 0; cRow <= rows; cRow++) {
          const y = Math.round(offY + cRow * p.cellSize) + 0.5;
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();
      }

      // Expanding click pulses hand their energy to cells as they pass
      for (let pi = pulses.length - 1; pi >= 0; pi--) {
        const pulse = pulses[pi];
        const age = (now - pulse.t0) / 1000;
        const ringR = age * p.pulseSpeed;
        if (ringR > Math.hypot(w, h)) {
          pulses.splice(pi, 1);
          continue;
        }
        const band = p.cellSize;
        const minCol = Math.max(0, Math.floor((pulse.x - ringR - band - offX) / p.cellSize));
        const maxCol = Math.min(cols - 1, Math.floor((pulse.x + ringR + band - offX) / p.cellSize));
        const minRow = Math.max(0, Math.floor((pulse.y - ringR - band - offY) / p.cellSize));
        const maxRow = Math.min(rows - 1, Math.floor((pulse.y + ringR + band - offY) / p.cellSize));
        for (let cRow = minRow; cRow <= maxRow; cRow++) {
          for (let cCol = minCol; cCol <= maxCol; cCol++) {
            const i = cRow * cols + cCol;
            const [cx, cy] = cellCenter(i);
            const dist = Math.hypot(cx - pulse.x, cy - pulse.y);
            if (Math.abs(dist - ringR) < band / 2 && p.maxOpacity > alphas[i]) {
              alphas[i] = p.maxOpacity;
              touched[i] = now;
            }
          }
        }
      }

      let anyVisible = pulses.length > 0;
      const fadeStep = dt / Math.max(p.fadeDuration, 16);
      const half = p.cellSize / 2;

      for (let i = 0; i < alphas.length; i++) {
        let a = alphas[i];
        if (a <= 0) continue;
        if (now - touched[i] > p.holdTime) {
          a = Math.max(0, a - fadeStep);
          alphas[i] = a;
          if (a <= 0) continue;
        }
        anyVisible = true;

        const [cx, cy] = cellCenter(i);
        const gradient = ctx.createRadialGradient(cx, cy, half * 0.1, cx, cy, p.cellSize);
        gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${a})`);
        gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);

        const x = cx - half + 0.5;
        const y = cy - half + 0.5;
        const s = p.cellSize - 1;

        ctx.beginPath();
        if (p.cellRadius > 0) {
          ctx.roundRect(x, y, s, s, p.cellRadius);
        } else {
          ctx.rect(x, y, s, s);
        }
        if (p.fillOpacity > 0) {
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${a * p.fillOpacity})`;
          ctx.fill();
        }
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.lineWidth;
        ctx.stroke();
      }

      if (anyVisible) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
        if (propsRef.current.gridOpacity <= 0) ctx.clearRect(0, 0, w, h);
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(draw);
    };
    wakeRef.current = wake;

    const toLocal = e => {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };

    const onPointerMove = e => {
      const [x, y] = toLocal(e);
      energize(x, y);
      wake();
    };

    const onPointerDown = e => {
      if (!propsRef.current.clickPulse) return;
      const [x, y] = toLocal(e);
      pulses.push({ x, y, t0: performance.now() });
      wake();
    };

    const ro = new ResizeObserver(() => {
      rebuild();
      wake();
    });
    ro.observe(container);
    rebuild();
    wake();

    /* Ver a mudanca 5 no cabecalho do arquivo. */
    const ouvinte = escutaNoPai && container.parentElement ? container.parentElement : container;
    ouvinte.addEventListener('pointermove', onPointerMove);
    ouvinte.addEventListener('pointerdown', onPointerDown);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      ouvinte.removeEventListener('pointermove', onPointerMove);
      ouvinte.removeEventListener('pointerdown', onPointerDown);
    };
    /* A supressao de `react-hooks/exhaustive-deps` que havia aqui deixou de
       ser necessaria: com `escutaNoPai` na lista, as duas dependencias que o
       efeito de fato usa estao declaradas. O resto entra por `propsRef`, de
       proposito, para trocar cor ou opacidade nao remontar o canvas inteiro. */
  }, [cellSize, escutaNoPai, origemNoCanto]);

  // Repaint static layers when visual props change while idle
  useEffect(() => {
    wakeRef.current?.();
  }, [gridOpacity, color, lineWidth, maxOpacity, fillOpacity, cellRadius]);

  return (
    <div ref={containerRef} className={`cursor-grid${className ? ` ${className}` : ''}`}>
      <canvas ref={canvasRef} className="cursor-grid__canvas" aria-hidden="true" />
      {children}
    </div>
  );
};

export default CursorGrid;
