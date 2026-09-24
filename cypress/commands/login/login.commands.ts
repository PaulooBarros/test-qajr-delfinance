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

  // String(): no CI as credenciais vêm de CYPRESS_*, e o Cypress converte
  // valores só com dígitos em number. Os campos têm máscara: só dígitos.
  cy.get(loginElements.campoLoginCPFCNPJ)
    .should('be.visible')
    .clear()
    .type(String(documento).replace(/\D/g, ''));

  cy.get(loginElements.campoNumeroConta).clear().type(String(conta).replace(/\D/g, ''));

  cy.get(loginElements.campoSenha).clear().type(String(senha), { log: false });

  cy.get(loginElements.botaoEntrar).should('be.enabled').click();

  cy.location('pathname', { timeout: 30000 }).should('include', '/home');
  cy.get(homeElements.itemMenuHome).should('be.visible');
});

export {};
