import { comumElements } from '@elements/comum.elements';

declare global {
  namespace Cypress {
    interface Chainable {
      /** PIN de 6 dígitos, no modal do Pix ou do TED. */
      digitarCodigoSms(codigo: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('digitarCodigoSms', (codigo: string) => {
  const digitos = String(codigo).split('');

  // Escopo no modal do topo: a etapa anterior segue no DOM.
  cy.get(`${comumElements.modal}:visible`)
    .last()
    .within(() => {
      cy.get(comumElements.campoCodigo)
        .should('have.length', digitos.length)
        .each(($input, indice) => {
          cy.wrap($input).type(digitos[indice], { log: false });
        });
    });
});

export {};
