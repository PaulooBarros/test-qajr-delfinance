import { cobrancaElements } from '@elements/cobranca.elements';

export interface CobrancaGerada {
  payload: string;
  imageBase64: string;
}

declare global {
  namespace Cypress {
    interface Chainable {
      /** Gera a cobrança e devolve o que a API respondeu. */
      gerarCobranca(centavos: string): Chainable<CobrancaGerada>;
    }
  }
}

Cypress.Commands.add('gerarCobranca', (centavos: string) => {
  cy.intercept('POST', cobrancaElements.rotaGeracao).as('cobranca');

  cy.contains('label', cobrancaElements.rotuloValor)
    .closest('.v-input')
    .find('input')
    .clear()
    .type(centavos);

  cy.contains('button', cobrancaElements.botaoGerar).should('be.enabled').click();

  return cy.wait('@cobranca').then((interceptacao) => {
    expect(interceptacao.response?.statusCode, 'status da geração').to.eq(200);

    return (interceptacao.response?.body ?? {}) as CobrancaGerada;
  });
});

export {};
