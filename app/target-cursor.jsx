"use client";

/**
 * TargetCursor, do React Bits (reactbits.dev/animations/target-cursor),
 * variante JS-CSS, trazido em 01/09/2026 do registro
 * `https://reactbits.dev/r/TargetCursor-JS-CSS.json`.
 *
 * Ele SUBSTITUI o ponteiro do sistema: esconde o cursor nativo e desenha no
 * lugar um ponto com quatro cantos que giram, e que se abrem em volta de
 * qualquer elemento com a classe `.cursor-target`.
 *
 * DEPENDENCIA NOVA: `gsap`, que o registro declara em `^3.13.0` e que este
 * projeto nao tinha. Instalado 3.15.0, a mesma versao da copia do estudio em
 * `estudio/ferramentas/gsap/`. Isso contraria a decisao escrita de que "os
 * quatro sites publicados nao recebem GSAP", e a razao de contrariar esta no
 * `CLAUDE.md` da rodada: o GSAP aqui nao e enfeite trocavel por CSS, e o motor
 * do componente. `gsap.timeline`, `gsap.ticker`, `getProperty`, `killTweensOf`
 * e a semantica de `overwrite` aparecem em 30 lugares do arquivo; reescrever
 * isso a mao seria um componente novo com o nome do outro.
 *
 * CINCO MUDANCAS EM CIMA DO ORIGINAL, e so estas:
 *
 * 1. `"use client"`. O componente usa hooks, `window` e `document`.
 *
 * 2. `prefers-reduced-motion: reduce` desliga tudo: sem portal, sem ponteiro
 *    escondido, sem giro. O giro e `repeat: -1`, ou seja, rotacao perpetua na
 *    tela inteira, que e exatamente o que essa preferencia existe para parar.
 *    Aqui nao vale a regra da casa de REDUZIR em vez de zerar (a 9.20): o que
 *    sobra e o ponteiro do sistema, que nao e uma versao degradada de nada, e
 *    a peca continua inteira sem o efeito.
 *
 * 3. `pointer: fine` idem, e esta e mais forte que a deteccao que o original
 *    ja tem. A dele e `(toque E tela <= 768px) OU user agent de celular`, o
 *    que deixa passar tablet de 1024px e notebook com tela sensivel: nesses,
 *    `document.body.style.cursor = "none"` esconderia um ponteiro que existe.
 *    A pergunta certa e "existe apontador preciso?", e quem responde isso e
 *    `(pointer: fine)`. A deteccao original fica no lugar, de proposito: as
 *    duas somam e nenhuma some.
 *
 * 4. `montado`. O componente so renderiza o portal depois do primeiro efeito.
 *    No servidor ele devolve `null` porque nao ha `document`; sem esta espera,
 *    a primeira renderizacao do cliente ja devolveria um portal para
 *    `document.body`, e o `body` aqui e renderizado pela propria aplicacao, ou
 *    seja, faz parte da arvore que esta sendo hidratada. Esperar um efeito
 *    tira o portal do caminho da hidratacao.
 *
 * 6. `cursor-proprio` no `<html>` enquanto o efeito roda. Sem ela, o
 *    `cursor: none` do original so alcanca quem NAO declara cursor proprio, e
 *    todo link e todo botao declaram: 174 elementos desta pagina continuavam
 *    mostrando o ponteiro do sistema por cima do desenhado. A folha usa a
 *    classe para chegar neles.
 *
 * 5. A folha ganhou dois blocos NOSSOS no fim, e nenhuma linha do registro
 *    foi mexida. Um devolve o cursor de texto aos campos do formulario, que a
 *    heranca do `cursor: none` tinha levado junto; o outro e uma segunda
 *    tranca para ninguem ficar sem ponteiro. Esta escrito la, com os numeros
 *    que mantiveram o `mix-blend-mode: difference` no lugar.
 *
 * As duas consultas de midia sao lidas UMA VEZ, na montagem. Trocar a
 * preferencia com a pagina aberta nao religa o efeito, e isso e aceitavel:
 * quem muda essa configuracao recarrega.
 */
import { useEffect, useRef, useCallback, useMemo, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import './target-cursor.css';

// A position: fixed element is positioned relative to the viewport UNLESS an
// ancestor establishes a containing block (transform, perspective, filter,
// will-change of those, or contain). When that happens, the cursor's translate
// no longer maps to viewport coordinates, so we measure and compensate for it.
const getContainingBlock = element => {
  let node = element?.parentElement;
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    if (
      style.transform !== 'none' ||
      style.perspective !== 'none' ||
      style.filter !== 'none' ||
      style.willChange.includes('transform') ||
      style.willChange.includes('perspective') ||
      style.willChange.includes('filter') ||
      /paint|layout|strict|content/.test(style.contain)
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};

const getContainingBlockOffset = block => {
  if (!block) return { x: 0, y: 0 };
  const rect = block.getBoundingClientRect();
  return { x: rect.left + block.clientLeft, y: rect.top + block.clientTop };
};

const TargetCursor = ({
  targetSelector = '.cursor-target',
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
  cursorColor = '#ffffff',
  cursorColorOnTarget
}) => {
  const cursorRef = useRef(null);
  const cornersRef = useRef(null);
  const spinTl = useRef(null);
  const dotRef = useRef(null);
  const containingBlockRef = useRef(null);

  const isActiveRef = useRef(false);
  const targetCornerPositionsRef = useRef(null);
  const tickerFnRef = useRef(null);
  const activeStrengthRef = useRef(0);

  /* MUDANCAS 2 e 3: as duas consultas de midia entram AQUI dentro, e nao num
     `if` separado, porque `isMobile` ja e a chave que o arquivo inteiro usa
     para nao fazer nada — o efeito sai por ela, o portal nao e criado por ela,
     e o ponteiro do sistema nao e escondido por ela. Somar as guardas neste
     ponto e o desvio menor. Ver o cabecalho do arquivo. */
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia) {
      const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const ponteiroGrosso = !window.matchMedia('(pointer: fine)').matches;
      if (semMovimento || ponteiroGrosso) return true;
    }
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
    return (hasTouchScreen && isSmallScreen) || isMobileUserAgent;
  }, []);

  /* MUDANCA 4: ver o cabecalho. O portal so entra depois da hidratacao.

     `useSyncExternalStore` e nao `useState` mais efeito: o lint do projeto
     recusa escrever estado dentro de efeito (`react-hooks/set-state-in-effect`),
     e com razao, porque aquilo e uma renderizacao a mais em toda montagem.
     Aqui a pergunta e "ja hidratou?", e esta e a resposta que o React da para
     ela: `getServerSnapshot` vale no servidor E na renderizacao de hidratacao,
     `getSnapshot` vale dali em diante. A assinatura devolve uma funcao de
     cancelar que nao faz nada porque nao ha nada que mude depois: hidratar
     acontece uma vez e nao volta atras. */
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const constants = useMemo(
    () => ({
      borderWidth: 3,
      cornerSize: 12
    }),
    []
  );

  const moveCursor = useCallback((x, y) => {
    if (!cursorRef.current) return;
    const { x: offsetX, y: offsetY } = getContainingBlockOffset(containingBlockRef.current);
    gsap.to(cursorRef.current, {
      x: x - offsetX,
      y: y - offsetY,
      duration: 0.1,
      ease: 'power3.out'
    });
  }, []);

  useEffect(() => {
    if (isMobile || !cursorRef.current) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
      /* MUDANCA 6, e ela conserta um defeito que o original tem de nascenca.

         `cursor: none` no `<body>` so chega por HERANCA, e heranca so alcanca
         quem nao declara nada. Medido nesta pagina: 159 elementos com
         `cursor: pointer` e 15 com `default` — ou seja, TODO link e TODO botao
         continuavam desenhando o ponteiro do sistema por cima do desenhado.
         Justamente aquilo em que se aponta.

         A classe existe para a folha poder alcancar esses elementos, e mora no
         `<html>` e nao no `<body>` para o seletor nao competir com o estilo
         em linha que a propria linha acima escreve. Ela e retirada na limpeza,
         junto com o cursor original. */
      document.documentElement.classList.add('cursor-proprio');
    }

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll('.target-cursor-corner');

    containingBlockRef.current = getContainingBlock(cursor);
    const getOffset = () => getContainingBlockOffset(containingBlockRef.current);

    let activeTarget = null;
    let currentLeaveHandler = null;
    let resumeTimeout = null;

    const cleanupTarget = target => {
      if (currentLeaveHandler) {
        target.removeEventListener('mouseleave', currentLeaveHandler);
      }
      currentLeaveHandler = null;
    };

    const initialOffset = getOffset();
    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2 - initialOffset.x,
      y: window.innerHeight / 2 - initialOffset.y
    });

    const createSpinTimeline = () => {
      if (spinTl.current) {
        spinTl.current.kill();
      }
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    };

    createSpinTimeline();

    const tickerFn = () => {
      if (!targetCornerPositionsRef.current || !cursorRef.current || !cornersRef.current) {
        return;
      }

      const strength = activeStrengthRef.current;
      if (strength === 0) return;

      const cursorX = gsap.getProperty(cursorRef.current, 'x');
      const cursorY = gsap.getProperty(cursorRef.current, 'y');

      const corners = Array.from(cornersRef.current);
      corners.forEach((corner, i) => {
        const currentX = gsap.getProperty(corner, 'x');
        const currentY = gsap.getProperty(corner, 'y');

        const targetX = targetCornerPositionsRef.current[i].x - cursorX;
        const targetY = targetCornerPositionsRef.current[i].y - cursorY;

        const finalX = currentX + (targetX - currentX) * strength;
        const finalY = currentY + (targetY - currentY) * strength;

        const duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;

        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration: duration,
          ease: duration === 0 ? 'none' : 'power1.out',
          overwrite: 'auto'
        });
      });
    };

    tickerFnRef.current = tickerFn;

    const moveHandler = e => moveCursor(e.clientX, e.clientY);
    window.addEventListener('mousemove', moveHandler);

    const scrollHandler = () => {
      if (!activeTarget || !cursorRef.current) return;
      const { x: offsetX, y: offsetY } = getOffset();
      const mouseX = gsap.getProperty(cursorRef.current, 'x') + offsetX;
      const mouseY = gsap.getProperty(cursorRef.current, 'y') + offsetY;
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      const isStillOverTarget =
        elementUnderMouse &&
        (elementUnderMouse === activeTarget || elementUnderMouse.closest(targetSelector) === activeTarget);
      if (!isStillOverTarget) {
        if (currentLeaveHandler) {
          currentLeaveHandler();
        }
      }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });

    const mouseDownHandler = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.3 });
      gsap.to(cursorRef.current, { scale: 0.9, duration: 0.2 });
    };

    const mouseUpHandler = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
    };

    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    const enterHandler = e => {
      const directTarget = e.target;
      const allTargets = [];
      let current = directTarget;
      while (current && current !== document.body) {
        if (current.matches(targetSelector)) {
          allTargets.push(current);
        }
        current = current.parentElement;
      }
      const target = allTargets[0] || null;
      if (!target || !cursorRef.current || !cornersRef.current) return;
      if (activeTarget === target) return;
      if (activeTarget) {
        cleanupTarget(activeTarget);
      }
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }

      activeTarget = target;
      const corners = Array.from(cornersRef.current);
      corners.forEach(corner => gsap.killTweensOf(corner, 'x,y'));

      gsap.killTweensOf(cursorRef.current, 'rotation');
      spinTl.current?.pause();
      gsap.set(cursorRef.current, { rotation: 0 });

      if (cursorColorOnTarget) {
        gsap.to(corners, {
          borderColor: cursorColorOnTarget,
          duration: 0.15,
          ease: 'power2.out'
        });
        if (dotRef.current) {
          gsap.to(dotRef.current, {
            backgroundColor: cursorColorOnTarget,
            duration: 0.15,
            ease: 'power2.out'
          });
        }
      }

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const { x: offsetX, y: offsetY } = getOffset();
      const cursorX = gsap.getProperty(cursorRef.current, 'x');
      const cursorY = gsap.getProperty(cursorRef.current, 'y');

      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth - offsetX, y: rect.top - borderWidth - offsetY },
        { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.top - borderWidth - offsetY },
        { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY },
        { x: rect.left - borderWidth - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY }
      ];

      isActiveRef.current = true;
      gsap.ticker.add(tickerFnRef.current);

      gsap.to(activeStrengthRef, {
        current: 1,
        duration: hoverDuration,
        ease: 'power2.out'
      });

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCornerPositionsRef.current[i].x - cursorX,
          y: targetCornerPositionsRef.current[i].y - cursorY,
          duration: 0.2,
          ease: 'power2.out'
        });
      });

      const leaveHandler = () => {
        gsap.ticker.remove(tickerFnRef.current);

        isActiveRef.current = false;
        targetCornerPositionsRef.current = null;
        gsap.set(activeStrengthRef, { current: 0, overwrite: true });
        activeTarget = null;

        if (cursorColorOnTarget && cornersRef.current) {
          gsap.to(Array.from(cornersRef.current), {
            borderColor: cursorColor,
            duration: 0.15,
            ease: 'power2.out'
          });
          if (dotRef.current) {
            gsap.to(dotRef.current, {
              backgroundColor: cursorColor,
              duration: 0.15,
              ease: 'power2.out'
            });
          }
        }

        if (cornersRef.current) {
          const corners = Array.from(cornersRef.current);
          gsap.killTweensOf(corners, 'x,y');
          const { cornerSize } = constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
          ];
          const tl = gsap.timeline();
          corners.forEach((corner, index) => {
            tl.to(
              corner,
              {
                x: positions[index].x,
                y: positions[index].y,
                duration: 0.3,
                ease: 'power3.out'
              },
              0
            );
          });
        }

        resumeTimeout = setTimeout(() => {
          if (!activeTarget && cursorRef.current && spinTl.current) {
            const currentRotation = gsap.getProperty(cursorRef.current, 'rotation');
            const normalizedRotation = currentRotation % 360;
            spinTl.current.kill();
            spinTl.current = gsap
              .timeline({ repeat: -1 })
              .to(cursorRef.current, { rotation: '+=360', duration: spinDuration, ease: 'none' });
            gsap.to(cursorRef.current, {
              rotation: normalizedRotation + 360,
              duration: spinDuration * (1 - normalizedRotation / 360),
              ease: 'none',
              onComplete: () => {
                spinTl.current?.restart();
              }
            });
          }
          resumeTimeout = null;
        }, 50);

        cleanupTarget(target);
      };

      currentLeaveHandler = leaveHandler;
      target.addEventListener('mouseleave', leaveHandler);
    };

    window.addEventListener('mouseover', enterHandler, { passive: true });

    const resizeHandler = () => {
      containingBlockRef.current = getContainingBlock(cursor);
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
      }

      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', enterHandler);
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      spinTl.current?.kill();
      document.body.style.cursor = originalCursor;
      document.documentElement.classList.remove('cursor-proprio');

      isActiveRef.current = false;
      targetCornerPositionsRef.current = null;
      activeStrengthRef.current = 0;
    };
  }, [
    targetSelector,
    spinDuration,
    moveCursor,
    constants,
    hideDefaultCursor,
    isMobile,
    hoverDuration,
    parallaxOn,
    cursorColor,
    cursorColorOnTarget,
    /* `montado` PRECISA estar aqui, e a ausencia dele foi um defeito meu.
       A mudanca 4 adia o portal para depois do primeiro efeito; sem esta
       dependencia, o efeito principal rodava uma unica vez, ANTES de o portal
       existir, saia no `if (!cursorRef.current) return` e nunca mais voltava.
       O ponteiro desenhado aparecia no documento, parado no meio da tela, e o
       do sistema continuava visivel: os dois ao mesmo tempo, nenhum
       funcionando. Nada no console, nada no build. */
    montado
  ]);

  useEffect(() => {
    if (isMobile || !cursorRef.current || !spinTl.current) return;
    if (spinTl.current.isActive()) {
      spinTl.current.kill();
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursorRef.current, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    }
  }, [spinDuration, isMobile, montado]);

  if (isMobile || !montado || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div ref={cursorRef} className="target-cursor-wrapper">
      <div ref={dotRef} className="target-cursor-dot" style={{ backgroundColor: cursorColor }} />
      <div className="target-cursor-corner corner-tl" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-tr" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-br" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-bl" style={{ borderColor: cursorColor }} />
    </div>,
    document.body
  );
};

export default TargetCursor;
