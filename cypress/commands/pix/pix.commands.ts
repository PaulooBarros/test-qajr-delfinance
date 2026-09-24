import { pixElements } from '@elements/pix.elements';

declare global {
  namespace Cypress {
    interface Chainable {
      visitPix(): Chainable<void>;

      /** Chave, valor e descrição. Para na etapa da data, onde imediato e agendado se separam. */
      preencherTransferenciaPix(chave: string, centavos: string, descricao: string): Chainable<void>;

      preencherChavePix(chave: string): Chainable<void>;

      /** Botão da etapa que está por cima (ver comentário na implementação). */
      botaoDaEtapa(texto: string): Chainable<JQuery<HTMLButtonElement>>;

      continuar(): Chainable<void>;

      confirmar(): Chainable<void>;

      aguardarPixConcluido(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('visitPix', () => {
  cy.visit('/contas/pix');

  cy.contains(pixElements.cardTransferir).should('be.visible');
});

Cypress.Commands.add(
  'preencherTransferenciaPix',
  (chave: string, centavos: string, descricao: string) => {
    cy.contains(pixElements.cardTransferir).should('be.visible').click();

    cy.preencherChavePix(chave);
    cy.continuar();

    cy.contains(pixElements.tituloNovaTransferencia).should('be.visible');
    cy.contains(chave).should('be.visible');

    // A máscara trata o que é digitado como centavos: '1' vira R$ 0,01.
    cy.get(pixElements.campoValor).should('be.visible').clear().type(centavos);
    cy.get(pixElements.campoValor)
      .invoke('val')
      .should('contain', (Number(centavos) / 100).toFixed(2).replace('.', ','));

    cy.get(pixElements.campoDescricao).type(descricao);

    cy.continuar();
  },
);

Cypress.Commands.add('preencherChavePix', (chave: string) => {
  // Sem .type(): a máscara de CPF injeta um ponto no 3º caractere e corrompe
  // a chave aleatória. Setar o valor e disparar 'input' equivale a um colar.
  cy.contains(pixElements.rotuloChave)
    .closest('.v-input')
    .find('input')
    .should('be.visible')
    .clear()
    .invoke('val', chave)
    .trigger('input')
    .should('have.value', chave);
});

/**
 * Cada etapa abre um modal e deixa a anterior no DOM, com os botões dela.
 * Um cy.contains('button', 'Continuar') solto acha o de trás, então a busca
 * é feita no modal do topo.
 */
Cypress.Commands.add('botaoDaEtapa', (texto: string) => {
  return cy.get('body').then(($body) => {
    const modais = $body.find(`${pixElements.modal}:visible`);
    const escopo = modais.length ? modais.last() : $body;

    return cy.wrap(escopo).contains('button', texto);
  });
});

Cypress.Commands.add('continuar', () => {
  cy.botaoDaEtapa(pixElements.botaoContinuar).should('be.enabled').click();
});

Cypress.Commands.add('confirmar', () => {
  cy.botaoDaEtapa(pixElements.botaoConfirmar).should('be.enabled').click();
});

Cypress.Commands.add('aguardarPixConcluido', () => {
  // Duas esperas separadas: travar na 1ª = backend não respondeu; na 2ª = respondeu com erro.
  cy.get(pixElements.campoCodigo, { timeout: 60000 }).should('not.exist');

  cy.contains(pixElements.toastSucesso, { timeout: 60000 }).should('be.visible');
});

export {};
