import { homeElements } from '@elements/home.elements';
import { menuElements } from '@elements/menu.elements';

describe('Sessão', () => {
  it('bloqueia rota protegida para quem não está autenticado', () => {
    cy.visit('/contas/extrato', { failOnStatusCode: false });

    cy.location('pathname').should('include', '/login');
    cy.get(homeElements.itemMenuHome).should('not.exist');
  });

  it('encerra a sessão pelo menu e impede voltar à área logada', () => {
    cy.login(Cypress.env('documento'), Cypress.env('conta'), Cypress.env('senha'));

    // get().contains() e não contains(seletor, texto): a segunda forma devolve
    // o menu inteiro e o clique cai em outro item.
    cy.get(menuElements.menuLateral)
      .contains(menuElements.botaoSair)
      .scrollIntoView()
      .should('be.visible')
      .click();

    cy.location('pathname').should('include', '/login');

    // Sair precisa invalidar a sessão, não só navegar.
    cy.visit('/contas/extrato', { failOnStatusCode: false });
    cy.location('pathname').should('include', '/login');
  });
});
