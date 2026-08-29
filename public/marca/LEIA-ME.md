# A marca

**A soleira:** uma cobertura que não encosta, um piso mais largo que ela, e o
sol nascendo entre os dois. Desenhada em 27/08/2026 junto com a identidade
nova, no lugar do arco com o sol que existia desde 11/08.

**A folga entre a perna e o piso é a ideia inteira.** Arco que encosta no chão
é uma porta. Cobertura suspensa sobre um piso é uma varanda. Quem "consertar" o
desenho encostando as pernas apaga o motivo dele existir.

## Qual arquivo usar

| Onde | Arquivo |
| --- | --- |
| Proposta em PDF, documento, papel timbrado | `assinatura.svg` |
| O mesmo, sobre fundo escuro | `assinatura-claro.svg` |
| Assinatura de e-mail | `assinatura-1200.png` ou `assinatura-claro-1200.png` |
| Foto de perfil: WhatsApp Business, LinkedIn, Instagram | `perfil-512.png` |
| Foto de perfil onde a moldura já é escura | `perfil-claro-512.png` |
| Símbolo isolado, dentro da página | `simbolo.svg` |
| Símbolo isolado, sobre fundo escuro, fora da página | `simbolo-claro.svg` |
| O mesmo em PNG | `simbolo-512.png` e `simbolo-claro-512.png` |
| Aba do navegador | `../favicon.svg` |

Os `.svg` são os mestres: escalam sem perder qualidade e são o que se manda
para gráfica ou para quem for diagramar. Os `.png` existem porque rede social e
cliente de e-mail não aceitam SVG, e **são derivados**: quem manda é o SVG.

## Três coisas para não esquecer

**A geometria vive em dois lugares.** Estes arquivos e o componente `ArcoMark`
em `app/icons.tsx`, que é o que a página usa. **Mudou um, muda o outro.**

**O `simbolo.svg` pinta por `currentColor`, e isso só funciona com o SVG
embutido na página.** Como `img`, como `background-image` ou como favicon o
arquivo é documento isolado, `currentColor` cai em preto, e sobre fundo escuro
a marca some. Nesses lugares vai o `selo.svg`, o `simbolo-claro.svg` ou um PNG,
que têm cor literal.

**Nada aqui se edita à mão.** As assinaturas saem de
`scripts/gerar-assinatura.py` e os PNG de `scripts/gerar-pngs-marca.py`. Rodar
os dois, nessa ordem, depois de qualquer mudança de geometria, cor ou
tipografia.

## O nome é contorno, não texto

A versão anterior escrevia o nome como `<text>`, e este arquivo avisava que em
máquina sem a fonte certa a assinatura sairia diferente. Com a **Kode Mono**,
que é a tipografia da marca desde 28/08/2026 e não está instalada em sistema
nenhum, isso deixaria de ser risco e viraria certeza: o texto sempre cairia
para outra fonte.

Agora os glifos são curvas. A assinatura sai idêntica em qualquer máquina,
inclusive em gráfica, e não depende de nada estar instalado. O custo é que o
arquivo não se atualiza sozinho quando a tipografia muda: precisa rodar o
script de novo.

## As cores

| | Fundo claro | Fundo escuro |
| --- | --- | --- |
| Arco e piso | `#14110e` | `#f4efe6` |
| Sol | `#14110e` | `#e8a33c` |
| Etiqueta "Estúdio Web" | `#7a7168` | `#a89d8f` |

**O sol não é âmbar sobre fundo claro, e isso é regra.** O `#e8a33c` mede
2,16:1 sobre papel branco e 1,88:1 sobre o creme, e elemento gráfico precisa de
3:1. Sobre fundo claro ele sai na mesma tinta do contorno, e quem separa o sol
do arco passa a ser a **forma**, meia pastilha cheia contra traço vazado, e não
a cor. O âmbar vive no `selo.svg` e no favicon, onde o fundo é controlado e ele
mede 8,72:1.

A etiqueta também troca: o tom fraco da paleta (`#a89d8f`) mede 7,06:1 sobre o
chão escuro e só 2,66:1 sobre papel. Tom pensado para fundo escuro não
atravessa para papel.

## Por que meio sol, e não um círculo

A primeira versão tinha o sol inteiro dentro do arco. Em 16 pixels, que é o
tamanho real de uma aba de navegador, o círculo fechava o vão e a marca lia
como cadeado. A meia-lua nascendo do piso mantém o vão aberto em cima.

## Trocar o desenho exige subir o `?v=`

O navegador guarda favicon num índice próprio, fora do cache HTTP, e ignora
`Cache-Control`. Mudar o desenho sem subir o número em `app/raiz.tsx` **não
chega em ninguém que já visitou o site**. Está em `?v=3` desde 27/08/2026.
