import { pixElements } from '@elements/pix.elements';

// Para antes do PIN: não movimenta dinheiro, roda no CI.
describe('Pix — validações', () => {
  // Com letras de propósito: só dígitos cairia na máscara de documento (defeito D2 no README).
  const CHAVE_INEXISTENTE = 'deadbeef-dead-beef-dead-beefdeadbeef';

  beforeEach(() => {
    cy.login(Cypress.env('documento'), Cypress.env('conta'), Cypress.env('senha'));
    cy.visitPix();
  });

  it('avisa que a chave não existe e não avança o fluxo', () => {
    cy.contains(pixElements.cardTransferir).click();

    cy.preencherChavePix(CHAVE_INEXISTENTE);
    cy.continuar();

    cy.contains(pixElements.mensagemChaveInexistente).should('be.visible');
    cy.contains(pixElements.tituloEtapaChave).should('be.visible');
    cy.contains(pixElements.tituloNovaTransferencia).should('not.exist');
  });
});
