# -*- coding: utf-8 -*-
"""Gera os arquivos de assinatura da marca, com o nome em CONTORNO.

POR QUE ESTE SCRIPT EXISTE. A versao anterior de `assinatura.svg` escrevia o
nome como `<text>` com uma serifada, e o proprio LEIA-ME avisava que em maquina
sem aquela fonte a assinatura sairia diferente. Com a Kode Mono, que e a
tipografia da marca desde 28/08/2026 e nao esta instalada em sistema nenhum, o
texto SEMPRE cairia para outra fonte. Convertido em curva, o arquivo passa a ser
autossuficiente e sai igual em qualquer lugar, inclusive em grafica.

COMO RODAR, da raiz do projeto:
    python scripts/gerar-assinatura.py

DEPENDE de `fontTools`, e le os arquivos `.woff` de `node_modules/@fontsource/`.
Le `.woff` e nao `.woff2` de proposito: woff2 e comprimido em brotli, que nao
esta instalado aqui, enquanto woff e zlib e o Python le sem pacote extra.

REGERAR e obrigatorio se a tipografia da marca mudar. Estes arquivos nao se
atualizam sozinhos.
"""
import pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

RAIZ = pathlib.Path(__file__).resolve().parent.parent
KODE = RAIZ / "node_modules/@fontsource/kode-mono/files/kode-mono-latin-600-normal.woff"
PLEX = RAIZ / "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff"
DESTINO = RAIZ / "public/marca"


def contorno(caminho, texto, corpo, x, baseline, tracking=0.0):
    """Devolve (dados do path, largura desenhada).

    A fonte tem o eixo Y para CIMA e o SVG tem para BAIXO. A escala negativa em
    Y faz a virada e a translacao poe a linha de base na coordenada pedida.
    """
    f = TTFont(caminho)
    upm = f["head"].unitsPerEm
    cmap = f.getBestCmap()
    gs = f.getGlyphSet()
    hmtx = f["hmtx"]
    escala = corpo / upm
    saida = SVGPathPen(gs)
    cursor = x
    for ch in texto:
        if ord(ch) not in cmap:
            raise SystemExit("glifo ausente: %r em %s" % (ch, caminho.name))
        nome = cmap[ord(ch)]
        gs[nome].draw(TransformPen(saida, Transform(escala, 0, 0, -escala, cursor, baseline)))
        cursor += hmtx[nome][0] * escala + tracking
    return saida.getCommands(), cursor - x - (tracking if texto else 0)


# A soleira, na geometria canonica de 64 unidades de `public/marca/simbolo.svg`.
# Mudou la, muda aqui: a geometria vive em dois lugares e precisa ficar igual.
SOLEIRA = """  <path d="M16 35V24a9 9 0 0 1 9-9h14a9 9 0 0 1 9 9v11"
        fill="none" stroke="{traco}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 49h40" fill="none" stroke="{traco}" stroke-width="5" stroke-linecap="round"/>
  <path d="M24 46.5a8 8 0 0 1 16 0Z" fill="{luz}"/>"""

CORPO_NOME, CORPO_ETIQ, TRACK = 30.0, 9.5, 2.4
X_TEXTO, BASE_NOME, BASE_ETIQ = 82.0, 33.0, 49.0

d_nome, larg_nome = contorno(KODE, "Varanda", CORPO_NOME, X_TEXTO, BASE_NOME)
d_etiq, larg_etiq = contorno(PLEX, "ESTÚDIO WEB", CORPO_ETIQ, X_TEXTO + 1.5, BASE_ETIQ, TRACK)
LARGURA = round(X_TEXTO + max(larg_nome, larg_etiq) + 10)

CABECA = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {L} 64" width="{L}" height="64" role="img" aria-label="Varanda Estúdio Web">
  <title>Varanda Estúdio Web</title>
  <!-- ASSINATURA HORIZONTAL: a soleira mais o nome.

       {ONDE}

       O NOME E CONTORNO, NAO TEXTO, e por isso este arquivo nao depende de
       nenhuma fonte estar instalada. Os caminhos sao os glifos da Kode Mono
       600 (o nome) e da IBM Plex Mono 400 (a etiqueta), convertidos em curva.

       NAO EDITE A MAO. Regerado por scripts/gerar-assinatura.py, que e onde
       moram as medidas e a razao de cada cor. -->
"""


def montar(arquivo, traco, luz, cor_nome, cor_etiq, onde):
    svg = (CABECA.format(L=LARGURA, ONDE=onde)
           + SOLEIRA.format(traco=traco, luz=luz)
           + '\n  <path d="%s" fill="%s"/>\n  <path d="%s" fill="%s"/>\n</svg>\n'
           % (d_nome, cor_nome, d_etiq, cor_etiq))
    # Comentario XML nao aceita dois hifens seguidos: o navegador nao faz o
    # parse, nao renderiza nada e nao avisa. Regra 9.12, e ja custou duas
    # rodadas uma vez. Ha teste no projeto, mas falhar aqui e mais barato.
    import re
    for c in re.findall(r"<!--.*?-->", svg, re.S):
        if "--" in c[4:-3]:
            raise SystemExit("comentario com dois hifens seguidos em " + arquivo)
    (DESTINO / arquivo).write_text(svg, encoding="utf-8")
    print("  %-26s %d x 64" % (arquivo, LARGURA))


montar("assinatura.svg", "#14110e", "#14110e", "#14110e", "#7a7168",
       """Versao para PAPEL e qualquer fundo claro.

       O sol NAO sai em ambar aqui, e isso e regra e nao esquecimento: o
       ambar #e8a33c mede 2,16:1 sobre papel branco e reprova os 3:1 que um
       elemento grafico precisa. Ele sai na mesma tinta do contorno, e quem
       separa o sol do arco passa a ser a FORMA, meia pastilha cheia contra
       traco vazado, e nao a cor. O ambar vive no selo e no favicon, onde o
       fundo e controlado.

       A etiqueta em #7a7168 mede 4,78:1 sobre branco. O tom fraco da paleta
       (#a89d8f) daria 2,66:1 e reprovaria: tom pensado para fundo escuro nao
       atravessa para papel.""")

montar("assinatura-claro.svg", "#f4efe6", "#e8a33c", "#f4efe6", "#a89d8f",
       """Versao para FUNDO ESCURO.

       Aqui o sol e o ambar de verdade: #e8a33c sobre o chao #14110e mede
       8,72:1. A etiqueta em #a89d8f mede 7,06:1. Sao os mesmos valores que o
       site usa nas mesmas funcoes.""")

print("  nome %.1fpx, etiqueta %.1fpx" % (larg_nome, larg_etiq))
