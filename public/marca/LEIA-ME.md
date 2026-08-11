# A marca

Um arco com o sol nascendo, visto de dentro da varanda. Criada em 2026-08-11,
no lugar de um círculo com folhas que só existia como desenho em CSS e não
podia ser exportado.

## Qual arquivo usar

| Onde | Arquivo |
| --- | --- |
| Proposta em PDF, documento, papel timbrado | `assinatura.svg` |
| O mesmo, sobre fundo escuro | `assinatura-claro.svg` |
| Foto de perfil: WhatsApp Business, LinkedIn, Instagram | `perfil-512.png` |
| Foto de perfil sobre fundo claro | `perfil-claro-512.png` |
| Assinatura de e-mail | `assinatura-1200.png` |
| Símbolo isolado, uso livre | `simbolo.svg` ou `simbolo-512.png` |
| Aba do navegador | `../favicon.svg` |

Os `.svg` são os mestres: escalam sem perder qualidade e são o que se manda
para gráfica ou para quem for diagramar. Os `.png` existem porque rede social
e cliente de e-mail não aceitam SVG.

## Duas coisas para não esquecer

**A geometria vive em dois lugares.** Estes arquivos e o componente
`ArcoMark` em `app/icons.tsx`, que é o que a página usa. São o mesmo símbolo
em dois formatos, um para o site e outro para o mundo. **Mudou um, muda o
outro.**

**O nome na assinatura é texto, não contorno.** Em máquina sem uma serifada
da lista, o sistema substitui a fonte e a assinatura sai diferente. Para peça
impressa ou entregue a terceiro, o mais seguro é usar `simbolo.svg` e digitar
o nome no próprio documento, onde a fonte está sob controle. Converter para
contorno exige ferramenta de fonte que este projeto não tem.

## As cores

| | Fundo claro | Fundo escuro |
| --- | --- | --- |
| Arco e piso | `#214d3b` | `#f4efe6` |
| Sol | `#c79a43` | `#dcb668` |

O ocre muda entre os dois porque `#c79a43` mede 2,37:1 sobre o verde escuro,
abaixo do mínimo até para elemento grande. O `#dcb668` chega a 3,19:1 e
continua sendo dourado, o que trocar por creme não seria.

## Por que meio sol, e não um círculo

A primeira versão tinha o sol inteiro dentro do arco. Em 16 pixels, que é o
tamanho real de uma aba de navegador, o círculo fechava o vão e a marca lia
como cadeado. A meia-lua nascendo do piso mantém o vão aberto em cima, que é
o que faz o arco continuar sendo arco.
