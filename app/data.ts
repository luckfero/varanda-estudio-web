/**
 * O que não se traduz.
 *
 * Até 2026-08-10 este arquivo guardava a página inteira — preço, serviço,
 * pergunta, texto de projeto. Com português, espanhol e inglês, tudo isso
 * passou para `app/i18n/`, um dicionário por idioma, e aqui ficou só o que é
 * igual nos três: o número do WhatsApp e os arquivos de imagem e endereços
 * das demonstrações.
 *
 * A divisão importa. Se o endereço da demonstração morasse no dicionário,
 * ele existiria em três cópias e bastaria corrigir duas para o terceiro
 * idioma apontar para um link morto sem ninguém perceber.
 */

export const whatsappUrl = "https://wa.me/5511942263007";

/**
 * O canal de e-mail do estúdio.
 *
 * Até 25/08/2026 o site tinha **um canal só**, o WhatsApp, e nem sempre ele
 * funciona: o formulário não envia nada — monta um texto e abre uma aba —, e
 * no desktop essa aba cai no `web.whatsapp.com`, que pede leitura de QR code.
 * Quem estava num computador sem o WhatsApp pareado não tinha como falar com
 * a gente.
 *
 * **Não é `contato@varandaestudioweb.com`, e o motivo está registrado:** o
 * endereço no domínio próprio existe, mas o ENVIO é pago e a decisão de
 * 11/08/2026 foi não investir nisso agora. O que não podia era continuar
 * usando o Gmail pessoal, que carrega o nome da pessoa — a decisão de
 * 10/08/2026 foi falar só como estúdio. Este endereço foi criado para o
 * estúdio e não tem nome de pessoa nenhum.
 *
 * Quando o envio no domínio próprio existir, troca aqui e some do site.
 */
export const emailContato = "varandaestudioweb@gmail.com";

/**
 * As demonstrações, na mesma ordem de `portfolio.projetos` de cada
 * dicionário. Nome, descrição e entregas vêm de lá; imagem e endereço, daqui.
 *
 * **A ordem é pareada por índice, e nada no build reclama se ela divergir.**
 * Trocar a ordem aqui e esquecer um dos três dicionários cola a imagem e o
 * link de um projeto na descrição de outro, em um idioma só. Há um teste
 * (`tests/portfolio-ordem.test.mjs`) que trava o pareamento nome↔endereço nos
 * três idiomas justamente porque a revisão visual em português não pegaria.
 *
 * Em subdomínios próprios desde 2026-08-10. O endereço anterior era o
 * `*.workers.dev` da conta, que carregava um nome de pessoa logo
 * depois de o site inteiro ter deixado de exibi-lo, e ainda parecia endereço
 * de teste num link de portfólio. Os três seguem `noindex`: são projetos
 * conceituais, com empresas que não existem.
 *
 * **A ordem não é cronológica nem estética, é comercial.** Quem abre este
 * portfólio é a lista de prospecção: 32 empresas de usinagem, ferramentaria,
 * caldeiraria e manutenção industrial no ABC. Num carrossel, o primeiro
 * cartão é o portfólio inteiro para a maioria dos visitantes, e a Brasa do
 * Vale, que estava nessa posição, fazia um dono de ferramentaria ler "faz
 * site de restaurante" e sair. A Nívora abre porque é a que mais se parece
 * com o cliente: B2B, obra física, venda por orçamento e trilíngue, que em
 * São Bernardo importa porque metalúrgica atende montadora estrangeira. A
 * Nascente vem depois por ser a prova técnica mais difícil (catálogo com
 * filtros e fluxo de compra), que é o que sustenta o pacote Profissional.
 * A Brasa fecha por ser o exemplo do Essencial — e não perde nada, porque
 * para prospect de gastronomia o link vai direto para o subdomínio dela.
 */
/**
 * Os trabalhos publicados, na mesma ordem de `portfolio.destaques` de cada
 * dicionário. São sites de negócios que existem, com endereço no ar.
 *
 * **A separação entre esta lista e `projectAssets` é o ponto.** Até 25/08/2026
 * o portfólio era inteiro conceitual e dizia isso por escrito. Misturar
 * trabalho publicado com demonstração num carrossel só obrigaria o visitante a
 * ler o rótulo de cada cartão para saber o que é real, e rótulo em cartão se
 * passa batido. Duas seções resolvem por estrutura o que o aviso resolvia por
 * texto.
 *
 * A ordem aqui é cronológica de publicação, e não comercial como a de baixo:
 * são dois, e com dois não há hierarquia a construir.
 */
/**
 * Depoimentos de clientes.
 *
 * **Está vazio de propósito, e enquanto estiver vazio a seção não aparece.**
 *
 * A regra que segura isto é a mesma que proíbe inventar preço, endereço ou
 * certificação: frase entre aspas com nome embaixo é a pessoa falando. Escrever
 * no lugar dela e assinar com o nome dela é depoimento fabricado, e é o tipo de
 * coisa que um prospect confere com um telefonema.
 *
 * O caminho para preencher, em 25/08/2026:
 *
 * 1. `comercial/conversas/depoimento-casa-conexao.md` tem três frases prontas
 *    para a Isamarta escolher, mais o pedido pronto para mandar.
 * 2. Ela responde escolhendo uma, mudando as palavras ou escrevendo a dela.
 * 3. **O que ela devolver é o que entra aqui**, com o nome como ela quiser
 *    assinar. Se ela mudar uma vírgula, vale a versão dela.
 *
 * `frase` fica no original em português nos três idiomas: depoimento traduzido
 * por nós deixa de ser a palavra da pessoa. O rótulo em volta é que muda.
 */
export type Depoimento = {
  frase: string;
  autor: string;
  papel: string;
  projeto: string;
  url: string;
};

export const depoimentos: Depoimento[] = [];

export const featuredAssets = [
  {
    image: "casa-conexao-hero",
    url: "https://casaconexao.varandaestudioweb.com/",
  },
  {
    image: "milenio-hero",
    url: "https://milenio.varandaestudioweb.com/",
  },
];

export const projectAssets = [
  {
    image: "nivora-casa-patio-alto",
    url: "https://nivora.varandaestudioweb.com/",
  },
  {
    image: "nascente-hero-central",
    url: "https://nascente.varandaestudioweb.com/",
  },
  {
    image: "brasa-do-vale-hero",
    url: "https://brasa.varandaestudioweb.com/",
  },
];
