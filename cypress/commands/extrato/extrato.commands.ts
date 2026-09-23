import { extratoElements } from '@elements/extrato.elements';
import { paraDataBR, paraDiaPorExtenso } from '@utils';

/**
 * Endpoint que alimenta a tabela. Esperar por ele é mais confiável do que
 * esperar a tela: o extrato renderiza o estado vazio **antes** de a resposta
 * chegar, então quem olha só o DOM conclui "não há lançamentos" enquanto os
 * dados ainda estão em trânsito.
 */
const ROTA_EXTRATO = '**/transactions/bank-statement**';

declare global {
  namespace Cypress {
    interface Chainable {
      /** Registra o intercept do extrato. Precisa vir antes da navegação. */
      interceptarExtrato(): Chainable<void>;

      /** Abre o extrato pela URL e espera a tabela terminar de carregar. */
      visitExtrato(): Chainable<void>;

      /** Espera o carregamento da tabela terminar, por estado e não por tempo. */
      aguardarExtratoCarregar(): Chainable<void>;

      /** Input de um campo de período, alcançado pelo rótulo. */
      campoPeriodo(rotulo: string): Chainable<JQuery<HTMLInputElement>>;

      /** Escolhe uma data no calendário do campo informado. */
      selecionarPeriodo(rotulo: string, data: Date): Chainable<void>;

      /** Quantidade de lançamentos que o produto declara no rodapé. */
      totalDeLancamentos(): Chainable<number>;
    }
  }
}

Cypress.Commands.add('interceptarExtrato', () => {
  cy.intercept('GET', ROTA_EXTRATO).as('extrato');
});

Cypress.Commands.add('visitExtrato', () => {
  cy.interceptarExtrato();
  cy.visit('/contas/extrato');

  cy.aguardarExtratoCarregar();
});

Cypress.Commands.add('aguardarExtratoCarregar', () => {
  // Esperar a resposta do extrato, e não a tela: a tabela exibe o estado
  // vazio enquanto a requisição está no ar. Assertar o status junto cobre o
  // caso de a API falhar e a tela ficar vazia por erro, não por ausência de
  // lançamento — dois estados idênticos aos olhos e opostos no significado.
  cy.wait('@extrato', { timeout: 30000 }).its('response.statusCode').should('eq', 200);

  cy.contains(extratoElements.carregando).should('not.exist');

  // exist e não be.visible: com a tabela cheia, o rodapé sai da área visível
  // por causa de um container com overflow. Ele estar no DOM é o sinal de que
  // a resposta chegou — que é o que esta espera precisa garantir.
  cy.contains(extratoElements.contador).should('exist');
});

Cypress.Commands.add('campoPeriodo', (rotulo: string) => {
  return cy
    .contains('label', rotulo)
    .closest('.v-input')
    .find('input') as Cypress.Chainable<JQuery<HTMLInputElement>>;
});

Cypress.Commands.add('selecionarPeriodo', (rotulo: string, data: Date) => {
  // Digitar não é opção: o campo remove as barras que o usuário digita e
  // depois rejeita o próprio resultado, voltando ao valor anterior no blur —
  // defeito "campos de data apagam o separador", descrito no README. O
  // calendário é o único caminho que funciona, e é o que o usuário usa.
  cy.campoPeriodo(rotulo).click();

  cy.get(`button[aria-label*="${paraDiaPorExtenso(data)}"]`).should('be.visible').click();

  cy.campoPeriodo(rotulo).should('have.value', paraDataBR(data));
});

Cypress.Commands.add('totalDeLancamentos', () => {
  // Lê do body, e não encadeado em cy.contains(regex): com RegExp a tipagem
  // do contains não entrega o elemento, e o número vive no texto. Normalizar
  // espaços é obrigatório — o rodapé vem com quebra de linha entre as
  // palavras, e sem isso o contador lê zero com a tabela cheia, levando o
  // teste a concluir "extrato vazio".
  return cy.get('body').then(($body) => {
    const texto = $body.text().replace(/\s+/g, ' ');
    const encontrado = texto.match(extratoElements.contador)?.[1];

    return Number(encontrado ?? 0);
  });
});

export {};
