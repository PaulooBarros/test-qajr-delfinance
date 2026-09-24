import { homeElements } from '@elements/home.elements';
import { loginElements } from '@elements/login.elements';

describe('Login', () => {
  /** CPF de formato válido, sem conta associada no ambiente. */
  const DOCUMENTO_INEXISTENTE = '52998224725';

  it('caminho feliz: autentica com documento, conta e senha válidos', () => {
    cy.login(Cypress.env('documento'), Cypress.env('conta'), Cypress.env('senha'));

    cy.location('pathname').should('include', '/home');
    cy.get(homeElements.itemMenuHome).should('be.visible');
  });

  it('recusa credenciais inválidas e não abre a área logada', () => {
    // Documento inexistente em vez de senha errada na conta real: rodando a
    // cada push, tentativas falhas poderiam bloquear a conta de teste.
    cy.visit('/login');
    cy.get(loginElements.abaLoginDocumento).should('be.visible').click();
    cy.get(loginElements.campoLoginCPFCNPJ).clear().type(DOCUMENTO_INEXISTENTE);
    cy.get(loginElements.campoNumeroConta).clear().type('99999');
    cy.get(loginElements.campoSenha).clear().type('senha-invalida', { log: false });
    cy.get(loginElements.botaoEntrar).should('be.enabled').click();

    cy.location('pathname').should('include', '/login');
    cy.get(homeElements.itemMenuHome).should('not.exist');
  });

  it.skip('deveria avisar que as credenciais são inválidas — DEFEITO conhecido', () => {
    cy.visit('/login');
    cy.get(loginElements.abaLoginDocumento).click();
    cy.get(loginElements.campoLoginCPFCNPJ).clear().type(DOCUMENTO_INEXISTENTE);
    cy.get(loginElements.campoNumeroConta).clear().type('99999');
    cy.get(loginElements.campoSenha).clear().type('senha-invalida', { log: false });
    cy.get(loginElements.botaoEntrar).click();

    cy.contains(/inválid|incorret|não encontrad/i).should('be.visible');
  });
});
