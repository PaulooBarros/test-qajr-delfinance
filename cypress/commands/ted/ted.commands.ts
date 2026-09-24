import { tedElements } from '@elements/ted.elements';

/** Formato de cypress/fixtures/favorecido-ted.json. */
export interface FavorecidoTed {
  banco: string;
  nomeDoBanco: string;
  agencia: string;
  conta: string;
  tipoDeConta: string;
  nome: string;
  email: string;
  documento: string;
}

declare global {
  namespace Cypress {
    interface Chainable {
      /** Input interno do campo: o data-testid fica na <div> do Vuetify. */
      campoTed(elemento: string): Chainable<JQuery<HTMLInputElement>>;

      /** Preenche tudo menos a data, que é o que diferencia os cenários. */
      preencherTed(favorecido: FavorecidoTed, centavos: string, descricao: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('campoTed', (elemento: string) => {
  return cy.get(elemento).find('input') as Cypress.Chainable<JQuery<HTMLInputElement>>;
});

Cypress.Commands.add(
  'preencherTed',
  (favorecido: FavorecidoTed, centavos: string, descricao: string) => {
    cy.campoTed(tedElements.campos.banco).clear().type(favorecido.banco);
    cy.get('.v-overlay--active').contains('.v-list-item', favorecido.banco).should('be.visible').click();
    cy.campoTed(tedElements.campos.banco).should('contain.value', favorecido.banco);

    cy.campoTed(tedElements.campos.agencia).clear().type(favorecido.agencia);
    cy.campoTed(tedElements.campos.conta).clear().type(favorecido.conta);

    // Nos selects o input interno tem pointer-events: none; o clique vai no .v-field.
    cy.get(tedElements.campos.tipoDeConta).find('.v-field').click();
    cy.get('.v-overlay--active').contains('.v-list-item', favorecido.tipoDeConta).should('be.visible').click();
    cy.campoTed(tedElements.campos.tipoDeConta).should('have.value', favorecido.tipoDeConta);

    cy.campoTed(tedElements.campos.nomeFavorecido).clear().type(favorecido.nome);
    cy.campoTed(tedElements.campos.email).clear().type(favorecido.email);
    cy.campoTed(tedElements.campos.documento).clear().type(favorecido.documento);

    cy.campoTed(tedElements.campos.valor).clear().type(centavos);
    cy.campoTed(tedElements.campos.descricao).clear().type(descricao);
  },
);

export {};
