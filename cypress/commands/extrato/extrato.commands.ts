import { extratoElements } from '@elements/extrato.elements';

const ROTA_EXTRATO = '**/transactions/bank-statement**';

declare global {
  namespace Cypress {
    interface Chainable {
      /** Precisa vir antes da navegação. */
      interceptarExtrato(): Chainable<void>;

      visitExtrato(): Chainable<void>;

      aguardarExtratoCarregar(): Chainable<void>;

      campoPeriodo(rotulo: string): Chainable<JQuery<HTMLInputElement>>;

      selecionarPeriodo(rotulo: string, data: Date): Chainable<void>;
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
  // A tabela mostra o estado vazio antes de a resposta chegar: a espera é
  // pela API, e o status separa "sem lançamentos" de "API falhou".
  cy.wait('@extrato', { timeout: 30000 }).its('response.statusCode').should('eq', 200);

  cy.contains(extratoElements.textoCarregando).should('not.exist');

  // exist e não be.visible: com a tabela cheia, o rodapé sai da área visível.
  cy.contains(extratoElements.textoContador).should('exist');
});

Cypress.Commands.add('campoPeriodo', (rotulo: string) => {
  return cy
    .contains('label', rotulo)
    .closest('.v-input')
    .find('input') as Cypress.Chainable<JQuery<HTMLInputElement>>;
});

Cypress.Commands.add('selecionarPeriodo', (rotulo: string, data: Date) => {
  // Digitar não funciona: o campo apaga as barras (defeito no README).
  cy.campoPeriodo(rotulo).click();

  const diaPorExtenso = data.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  cy.get(`button[aria-label*="${diaPorExtenso}"]`).should('be.visible').click();

  cy.campoPeriodo(rotulo).should('have.value', data.toLocaleDateString('pt-BR'));
});

export {};
