declare global {
  namespace Cypress {
    interface Chainable {
      /** Limpa cookies e storage — roda antes de cada teste (support/e2e.ts). */
      clearAuth(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('clearAuth', () => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
});

export {};
