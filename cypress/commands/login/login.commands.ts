import { homeElements } from '@elements/home.elements';
import { loginElements } from '@elements/login.elements';

declare global {
  namespace Cypress {
    interface Chainable {
      /** Login pela aba "Documento"; termina com a home carregada. */
      login(documento: string, conta: string, senha: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (documento: string, conta: string, senha: string) => {
  cy.visit('/login');

  cy.get(loginElements.abaLoginDocumento).should('be.visible').click();

  // Os campos têm máscara: só dígitos, para não duplicar a pontuação.
  cy.get(loginElements.campoLoginCPFCNPJ)
    .should('be.visible')
    .clear()
    .type(documento.replace(/\D/g, ''));

  cy.get(loginElements.campoNumeroConta).clear().type(conta.replace(/\D/g, ''));

  cy.get(loginElements.campoSenha).clear().type(senha, { log: false });

  cy.get(loginElements.botaoEntrar).should('be.enabled').click();

  cy.location('pathname', { timeout: 30000 }).should('include', '/home');
  cy.get(homeElements.itemMenuHome).should('be.visible');
});

export {};
