import { homeElements } from '@elements/home.elements';
import { loginElements } from '@elements/login.elements';
import { apenasDigitos } from '@utils';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Faz login no internet banking pela aba "Documento" e valida que a
       * home carregou (URL /home + menu lateral visível).
       *
       * @example
       * beforeEach(() => {
       *   cy.login('12345678909', '123456', 'MinhaSenha');
       * });
       */
      login(documento: string, conta: string, senha: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (documento: string, conta: string, senha: string) => {
  cy.visit('/login');

  cy.get(loginElements.botaoLoginDocumento).should('be.visible').click();

  // Os campos têm máscara: digitar só os dígitos evita pontuação duplicada.
  cy.get(loginElements.campoLoginCPFCNPJ)
    .should('be.visible')
    .clear()
    .type(apenasDigitos(documento));

  cy.get(loginElements.campoNumeroConta).clear().type(apenasDigitos(conta));

  cy.get(loginElements.campoSenha).clear().type(senha, { log: false });

  cy.get(loginElements.botaoEntrar).should('be.enabled').click();

  cy.location('pathname', { timeout: 30000 }).should('include', '/home');

  // Validar URL e menu juntos evita dar o login por bom só porque a URL
  // mudou, antes de a tela carregar.
  cy.get(homeElements.botaoMenuHome).should('be.visible');
});

export {};
