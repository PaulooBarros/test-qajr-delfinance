import { homeElements } from '@elements/home.elements';
import { envObrigatoria } from '@support/env';

describe('Home', () => {
  beforeEach(() => {
    cy.login(envObrigatoria('documento'), envObrigatoria('conta'), envObrigatoria('senha'));
  });

  it('exibe o menu lateral após o login', () => {
    cy.shouldBeVisible(homeElements.botaoMenuHome);
  });

  it('mantém o saldo oculto até o usuário pedir para ver', () => {
    cy.contains(homeElements.tituloSaldo).should('be.visible');

    // Saldo mascarado por padrão é decisão de privacidade, não detalhe visual:
    // protege quem abre o banco em local público. Se um refactor ligar a
    // exibição automática, este teste acusa.
    cy.contains(homeElements.rotuloDisponivel)
      .parent()
      .should('contain.text', homeElements.saldoOculto);

    cy.get(homeElements.botaoMostrarSaldo).should('be.visible').click();

    // O valor revelado precisa ter formato de moeda. Assertar o formato, e
    // não um número fixo, mantém o teste válido com qualquer saldo.
    cy.contains(homeElements.rotuloDisponivel)
      .parent()
      .invoke('text')
      .should('match', homeElements.formatoDeSaldo);
  });
});
