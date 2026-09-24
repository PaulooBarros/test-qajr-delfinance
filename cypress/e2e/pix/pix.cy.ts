import { pixElements } from '@elements/pix.elements';

// retries: 0 porque o teste movimenta dinheiro: um retry após o PIN envia de novo.
describe('Pix', { retries: 0 }, () => {
  const VALOR_EM_CENTAVOS = '1';
  const DESCRICAO = 'Teste automatizado Cypress';

  beforeEach(() => {
    cy.login(Cypress.env('documento'), Cypress.env('conta'), Cypress.env('senha'));
    cy.visitPix();
  });

  it('transfere R$ 0,01 para a chave cadastrada', () => {
    cy.preencherTransferenciaPix(Cypress.env('chavePix'), VALOR_EM_CENTAVOS, DESCRICAO);

    cy.get(pixElements.campoData).should('have.value', new Date().toLocaleDateString('pt-BR'));
    cy.confirmar();

    cy.contains(pixElements.tituloConfirmarPagamento).should('be.visible');

    // O PIN envia sozinho no 6º dígito; clicar em "Confirmar" depois disso falha.
    cy.digitarCodigoSms(Cypress.env('codigoSMS'));
    cy.aguardarPixConcluido();

    cy.contains('button', pixElements.botaoComprovante, { timeout: 30000 })
      .should('be.visible')
      .and('be.enabled')
      .find(pixElements.iconeDownload)
      .should('exist');
  });

  it('agenda R$ 0,01 para uma data futura', () => {
    cy.preencherTransferenciaPix(Cypress.env('chavePix'), VALOR_EM_CENTAVOS, DESCRICAO);

    cy.get(pixElements.campoData).should('be.visible').click();
    cy.escolherDataFuturaNoCalendario(pixElements.campoData).then((dataAgendada) => {
      cy.confirmar();

      cy.contains(pixElements.tituloConfirmarPagamento).should('be.visible');
      cy.digitarCodigoSms(Cypress.env('codigoSMS'));

      // O toast diz "efetuada" também no agendamento, então não distingue os dois.
      cy.aguardarPixConcluido();

      cy.log(`agendado para ${dataAgendada}`);
    });


  });
});
