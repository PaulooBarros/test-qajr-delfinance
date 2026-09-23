import { homeElements } from '@elements/home.elements';
import { menuElements } from '@elements/menu.elements';
import { envObrigatoria } from '@support/env';

/**
 * Controle de sessão: quem não está autenticado não acessa, e quem sai perde
 * o acesso. São os cenários que protegem o dado de todo mundo, e custam
 * segundos para rodar.
 */
describe('Sessão', () => {
  it('bloqueia rota protegida para quem não está autenticado', () => {
    // clearAuth() roda no beforeEach global (support/e2e.ts): a visita começa
    // sem cookie e sem storage.
    cy.visit('/contas/extrato', { failOnStatusCode: false });

    cy.shouldBeOnPath('/login');
    cy.get(homeElements.botaoMenuHome).should('not.exist');
  });

  it('encerra a sessão pelo menu e impede voltar à área logada', () => {
    cy.login(envObrigatoria('documento'), envObrigatoria('conta'), envObrigatoria('senha'));

    // get().contains() e não contains(seletor, texto): a segunda forma devolve
    // o **menu inteiro** por conter o texto, e o clique cai no centro dele —
    // que é outro item. Escopar primeiro, buscar depois.
    // scrollIntoView porque o menu é rolável e "Sair" fica no fim da lista:
    // sem isso o elemento existe, mas está fora da viewport e o Cypress recusa
    // o clique — corretamente, porque o usuário também teria de rolar.
    cy.get(menuElements.menu)
      .contains(menuElements.botaoSair)
      .scrollIntoView()
      .should('be.visible')
      .click();

    cy.shouldBeOnPath('/login');

    // Sair precisa invalidar a sessão, não só navegar: tentar voltar direto
    // para uma rota interna tem de cair no login de novo. Sem esta segunda
    // parte, o teste passaria mesmo com a sessão viva no servidor.
    cy.visit('/contas/extrato', { failOnStatusCode: false });
    cy.shouldBeOnPath('/login');
  });
});
