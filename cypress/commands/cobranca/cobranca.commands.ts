import { cobrancaElements } from '@elements/cobranca.elements';

/** Resposta da geração: o BR Code e o PNG do QR, ambos em texto. */
export interface CobrancaGerada {
  payload: string;
  imageBase64: string;
}

declare global {
  namespace Cypress {
    interface Chainable {
      /** Abre o fluxo de cobrança e seleciona a chave aleatória da conta. */
      iniciarCobrancaPix(): Chainable<void>;

      /** Campo de valor da cobrança. */
      campoValorCobranca(): Chainable<JQuery<HTMLInputElement>>;

      /** Gera a cobrança e devolve o que a API respondeu. */
      gerarCobranca(centavos: string): Chainable<CobrancaGerada>;
    }
  }
}

Cypress.Commands.add('iniciarCobrancaPix', () => {
  cy.intercept('POST', cobrancaElements.rotaGeracao).as('cobranca');

  cy.visitPix();
  cy.contains(cobrancaElements.cardCobrar).should('be.visible').click();

  cy.contains(cobrancaElements.tituloSelecaoDeChave).should('be.visible');
  cy.contains(cobrancaElements.chaveAleatoria).should('be.visible').click();

  cy.campoValorCobranca().should('exist');
});

Cypress.Commands.add('campoValorCobranca', () => {
  // exist e não be.visible no label: o campo nasce preenchido com "R$ 0,00",
  // e o Vuetify esconde o label assim que há conteúdo.
  return cy
    .contains('label', cobrancaElements.labelValor)
    .closest('.v-input')
    .find('input') as Cypress.Chainable<JQuery<HTMLInputElement>>;
});

Cypress.Commands.add('gerarCobranca', (centavos: string) => {
  cy.campoValorCobranca().clear().type(centavos);

  cy.contains('button', cobrancaElements.botaoGerar).should('be.enabled').click();

  return cy.wait('@cobranca').then((interceptacao) => {
    expect(interceptacao.response?.statusCode, 'status da geração').to.eq(200);

    return (interceptacao.response?.body ?? {}) as CobrancaGerada;
  });
});

export {};
