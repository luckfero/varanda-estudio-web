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
 * As demonstrações, na mesma ordem de `portfolio.projetos` de cada
 * dicionário. Nome, descrição e entregas vêm de lá; imagem e endereço, daqui.
 *
 * Em subdomínios próprios desde 2026-08-10. O endereço anterior era o
 * `*.workers.dev` da conta, que carregava um nome de pessoa logo
 * depois de o site inteiro ter deixado de exibi-lo, e ainda parecia endereço
 * de teste num link de portfólio. Os três seguem `noindex`: são projetos
 * conceituais, com empresas que não existem.
 */
export const projectAssets = [
  {
    image: "brasa-do-vale-hero",
    url: "https://brasa.varandaestudioweb.com/",
  },
  {
    image: "nivora-casa-patio-alto",
    url: "https://nivora.varandaestudioweb.com/",
  },
  {
    image: "nascente-hero-central",
    url: "https://nascente.varandaestudioweb.com/",
  },
];
