import NaoEncontrado from "../../nao-encontrado";
import { metadadosDeErro } from "../../raiz";

/**
 * A rota coringa do PORTUGUÊS, e a de reserva de todo o site.
 *
 * Como ela mora no grupo `(pt)`, que não acrescenta segmento nenhum ao
 * endereço, ela responde por `/qualquer-coisa` e por qualquer caminho abaixo
 * disso. `/en/...` e `/es/...` têm coringa própria, mais específica, e é ela
 * que ganha: quem cai aqui é quem estava em português ou quem chegou por um
 * endereço que não pertence a idioma nenhum.
 *
 * Segmento estático sempre vence coringa, então `/privacidade` continua sendo
 * a política e não a página de erro. Conferido rota a rota depois de escrever.
 *
 * **Ela responde 200, e quem troca para 404 é o worker.** Não é gambiarra: é
 * a saída registrada na regra 9.3 do protocolo, porque `notFound()` com
 * `app/not-found.tsx` acerta o código e perde os metadados no vinext. Ver o
 * comentário de `app/nao-encontrado.tsx` e a lista de rotas conhecidas em
 * `worker/index.ts`. Mexer num sem olhar o outro é como se cria um soft 404.
 */
export const metadata = metadadosDeErro("pt");

export default function PaginaNaoEncontrada() {
  return <NaoEncontrado locale="pt" />;
}
