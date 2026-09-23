import { comumElements } from '@elements/comum.elements';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Digita o código de 6 dígitos no modal de PIN, seja ele do Pix
       * ("Confirmar Pagamento") ou do TED ("Confirmar Transferência").
       */
      digitarCodigoSms(codigo: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('digitarCodigoSms', (codigo: string) => {
  const digitos = String(codigo).split('');

  // Escopo no modal do topo, não pelo título: o componente é o mesmo nas duas
  // features, e a etapa anterior segue no DOM com campos próprios.
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
