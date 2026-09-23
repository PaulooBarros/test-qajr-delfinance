/** Validações genéricas, usadas por qualquer tela. */

declare global {
  namespace Cypress {
    interface Chainable {
      /** Garante que o elemento está visível na tela. */
      shouldBeVisible(selector: string): Chainable<JQuery<HTMLElement>>;

      /** Garante que o elemento está visível e contém o texto informado. */
      shouldHaveText(selector: string, text: string): Chainable<JQuery<HTMLElement>>;

      /** Garante que a URL atual contém o trecho informado. */
      shouldBeOnPath(path: string): Chainable<string>;
    }
  }
}

Cypress.Commands.add('shouldBeVisible', (selector: string) => {
  return cy.get(selector).should('be.visible');
});

Cypress.Commands.add('shouldHaveText', (selector: string, text: string) => {
  return cy.get(selector).should('be.visible').and('contain.text', text);
});

Cypress.Commands.add('shouldBeOnPath', (path: string) => {
  return cy.location('pathname').should('include', path);
});

export {};
