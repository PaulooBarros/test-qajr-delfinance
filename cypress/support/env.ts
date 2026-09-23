/**
 * Leitura de variáveis do cypress.env.json com falha explícita.
 *
 * Cypress.env('naoExiste') devolve undefined em silêncio. O teste segue, e o
 * erro só aparece comandos depois — disfarçado de "seletor não encontrado" ou
 * de chave inválida na tela. Quem for rodar a suíte pela primeira vez perde
 * tempo caçando um bug que é, na verdade, credencial ausente.
 *
 * Fica em support/ e não em utils/ porque depende do objeto global Cypress:
 * utils/ é reservado a função pura, testável fora do navegador.
 */
export const envObrigatoria = (nome: string): string => {
  const valor = Cypress.env(nome);

  if (valor === undefined || valor === null || String(valor).trim() === '') {
    // A mensagem cobre os dois ambientes de propósito: no CI não existe
    // arquivo para copiar, e quem lê o log do GitHub Actions precisa saber
    // que o caminho de lá é outro.
    throw new Error(
      [
        `Variável de ambiente "${nome}" não encontrada.`,
        '  - Local: copie cypress.env.example.json para cypress.env.json e preencha.',
        `  - CI: configure o secret e mapeie para CYPRESS_${nome} em .github/workflows/e2e.yml`,
      ].join('\n'),
    );
  }

  return String(valor);
};
