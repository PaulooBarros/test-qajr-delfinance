import { homeElements } from '@elements/home.elements';

describe('Home', () => {
  beforeEach(() => {
    cy.login(Cypress.env('documento'), Cypress.env('conta'), Cypress.env('senha'));
  });

  it('exibe o menu lateral após o login', () => {
    cy.get(homeElements.itemMenuHome).should('be.visible');
  });

  it('mantém o saldo oculto até o usuário pedir para ver', () => {
    cy.contains(homeElements.tituloSaldo).should('be.visible');

    cy.contains(homeElements.rotuloDisponivel)
      .parent()
      .should('contain.text', homeElements.textoSaldoOculto);

    cy.get(homeElements.botaoMostrarSaldo).should('be.visible').click();

    // Formato de moeda, não valor fixo: vale com qualquer saldo.
    cy.contains(homeElements.rotuloDisponivel)
      .parent()
      .invoke('text')
      .should('match', homeElements.formatoDeSaldo);
  });
});
