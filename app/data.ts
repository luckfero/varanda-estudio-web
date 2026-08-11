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
 * TODO (combinado em 2026-08-10): trocar por subdomínios de
 * `varandaestudioweb.com`. `luccaoliveira123.workers.dev` carrega o nome da
 * pessoa, que o site deixou de exibir, e ainda parece endereço de teste em
 * link de portfólio. Custa zero — o domínio já está na Cloudflare.
 */
export const projectAssets = [
  {
    image: "brasa-do-vale-hero",
    url: "https://brasa-do-vale.luccaoliveira123.workers.dev/",
  },
  {
    image: "nivora-casa-patio-alto",
    url: "https://nivora-construcoes.luccaoliveira123.workers.dev/",
  },
  {
    image: "nascente-hero-central",
    url: "https://nascente-casa-olfativa.luccaoliveira123.workers.dev/",
  },
];
