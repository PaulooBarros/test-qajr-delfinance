import { homeElements } from '@elements/home.elements';

declare global {
  namespace Cypress {
    interface Chainable {
      /** Abre a home direto pela URL e espera o menu lateral renderizar. */
      visitHome(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('visitHome', () => {
  cy.visit('/home');

  cy.get(homeElements.botaoMenuHome).should('be.visible');
});

export {};
