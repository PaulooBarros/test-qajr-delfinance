import { pixElements } from '@elements/pix.elements';
import { envObrigatoria } from '@support/env';
import { paraDataBR } from '@utils';


describe('Pix', { retries: 0 }, () => {
  const VALOR_EM_CENTAVOS = '1';
  const DESCRICAO = 'Teste automatizado Cypress';

  /**
   * Data fixa em 30/09.
   */
  const DATA_AGENDAMENTO = new Date(2026, 8, 30);

  beforeEach(() => {
    cy.login(envObrigatoria('documento'), envObrigatoria('conta'), envObrigatoria('senha'));
    cy.visitPix();
  });

  it('transfere R$ 0,01 para a chave cadastrada', () => {
    cy.preencherTransferenciaPix(envObrigatoria('chavePix'), VALOR_EM_CENTAVOS, DESCRICAO);

    // Transferência imediata é a data de hoje já preenchida: asserta o padrão
    // em vez de confiar nele.
    cy.get(pixElements.campoData).should('have.value', paraDataBR(new Date()));
    cy.confirmar();

    cy.contains(pixElements.tituloConfirmarPagamento).should('be.visible');
    cy.digitarCodigoSms(envObrigatoria('codigoSMS'));

    // Sem cy.confirmar() aqui de propósito: o componente de PIN envia sozinho
    // ao receber o 6º dígito. Clicar no "Confirmar" depois disso é corrida
    // perdida — o modal já está desmontando e o clique falha com "the page
    // updated while this command was executing".
    cy.aguardarPixConcluido();

    // Comprovante disponível é parte do resultado esperado da transferência:
    // sem ele o usuário não tem prova do pagamento.
    cy.contains('button', pixElements.botaoComprovante, { timeout: 30000 })
      .should('be.visible')
      .and('be.enabled');

    cy.contains('button', pixElements.botaoComprovante)
      .find(pixElements.iconeDownload)
      .should('exist');

    // TODO: clicar e validar o arquivo em cypress/downloads. Depende de saber
    // se o clique baixa direto ou abre outra aba — Cypress não segue aba nova.
  });

  it('agenda R$ 0,01 para 30/09', () => {
    cy.preencherTransferenciaPix(envObrigatoria('chavePix'), VALOR_EM_CENTAVOS, DESCRICAO);

    // O agendamento só difere do imediato aqui: trocar a data antes de
    // confirmar. O resto do fluxo é o mesmo.
    cy.get(pixElements.campoData).should('have.value', paraDataBR(new Date()));
    cy.agendarPixPara(DATA_AGENDAMENTO);

    cy.confirmar();

    cy.contains(pixElements.tituloConfirmarPagamento).should('be.visible');
    cy.digitarCodigoSms(envObrigatoria('codigoSMS'));

    // Mesmo toast do imediato: o produto diz "efetuada" mesmo para agendamento.
    // Quem prova que agendou é a asserção da data, acima, antes do confirm.
    cy.aguardarPixConcluido();

    // TODO: validar o agendamento fora do fluxo — na listagem de
    // transferências agendadas ou no comprovante, onde a data deve aparecer
    // como 30/09 e não como hoje.
  });
});
