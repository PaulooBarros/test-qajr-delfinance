import { agendamentosElements } from '@elements/agendamentos.elements';
import { comumElements } from '@elements/comum.elements';
import { menuElements } from '@elements/menu.elements';
import { tedElements } from '@elements/ted.elements';
import type { FavorecidoTed } from '../../commands/ted/ted.commands';

interface Agendamento {
  amount: number;
  notes: string;
  effectiveAt: string;
}

describe('TED', { retries: 0 }, () => {
  const VALOR_EM_CENTAVOS = '1';
  const DESCRICAO = 'Teste automatizado Cypress';

  let favorecido: FavorecidoTed;

  beforeEach(() => {
    cy.fixture<FavorecidoTed>('favorecido-ted').then((dados) => {
      favorecido = dados;
    });

    cy.login(Cypress.env('documento'), Cypress.env('conta'), Cypress.env('senha'));
    cy.visit('/transferencias/ted');
    cy.get(tedElements.botaoConcluir).should('be.visible');
  });

  it('transfere R$ 0,01 para o favorecido de teste', () => {
    cy.preencherTed(favorecido, VALOR_EM_CENTAVOS, DESCRICAO);

    // Digitar a data não funciona: o campo apaga as barras (defeito no README).
    // Hoje é o primeiro dia habilitado, já que o produto desabilita o passado.
    cy.get(tedElements.campos.data).find('.v-field').click();
    cy.get(`${comumElements.botaoCalendarioDia}:not([disabled])`).first().click();

    cy.campoTed(tedElements.campos.valor).invoke('val').should('contain', '0,01');
    cy.campoTed(tedElements.campos.data).should('have.value', new Date().toLocaleDateString('pt-BR'));

    cy.get(tedElements.botaoConcluir).should('be.enabled').click();

    cy.contains(tedElements.tituloConfirmacao).should('be.visible');
    cy.digitarCodigoSms(Cypress.env('codigoSMS'));

    // O TED não emite toast: o sinal de sucesso é o comprovante abrir.
    cy.contains(tedElements.tituloComprovante, { timeout: 60000 }).should('be.visible');

    cy.contains('button', tedElements.botaoExportarComprovante).should('be.visible').and('be.enabled');
  });

  it('agenda R$ 0,01 para o mês seguinte e registra em Agendamentos', () => {
    // Marcador único: a conta acumula agendamentos de execuções anteriores.
    const marcador = `Cypress agendamento ${Date.now()}`;

    cy.preencherTed(favorecido, VALOR_EM_CENTAVOS, marcador);

    cy.get(tedElements.campos.data).find('.v-field').click();
    cy.escolherDataFuturaNoCalendario(`${tedElements.campos.data} input`).then((dataAgendada) => {
      cy.get(tedElements.botaoConcluir).should('be.enabled').click();

      cy.contains(tedElements.tituloConfirmacao).should('be.visible');
      cy.digitarCodigoSms(Cypress.env('codigoSMS'));
      cy.contains(tedElements.tituloComprovante, { timeout: 60000 }).should('be.visible');

      // Verificação fora do fluxo: o comprovante só prova que a tela aceitou.
      // A tabela não exibe a descrição, então o agendamento é achado pela API.
      cy.intercept('GET', '**/transactions?status=scheduled*').as('agendados');

      // force: o menu pode estar coberto pelo modal que ainda está fechando.
      cy.get(menuElements.itemAgendamentos).click({ force: true });

      cy.wait('@agendados').then(({ response }) => {
        expect(response?.statusCode, 'status da listagem').to.eq(200);

        const criado = (response?.body as Agendamento[]).find((a) => a.notes === marcador);

        expect(criado, `agendamento "${marcador}" na listagem`).to.not.be.undefined;
        expect(criado?.amount, 'valor agendado').to.eq(0.01);
        expect(
          new Date(String(criado?.effectiveAt)).toLocaleDateString('pt-BR'),
          'data de efetivação',
        ).to.eq(dataAgendada);
      });

      cy.contains(agendamentosElements.linhasDaTabela, dataAgendada)
        .should('be.visible')
        .and('contain.text', agendamentosElements.textoStatusAgendado);
    });
  });
});
