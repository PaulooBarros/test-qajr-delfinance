import { agendamentosElements } from '@elements/agendamentos.elements';
import { tedElements } from '@elements/ted.elements';
import { envObrigatoria } from '@support/env';
import type { FavorecidoTed } from '../../commands/ted/ted.commands';
import { centavosParaValorBR, paraDataBR } from '@utils';

/**
 * Caminho feliz do TED.
 *
 * retries: 0 pelo mesmo motivo do Pix — este teste movimenta dinheiro, e um
 * retry após o PIN confirmado enviaria a transferência de novo.
 *
 * O favorecido é fictício, com CPF de dígitos verificadores válidos, e a
 * execução com dados fake foi autorizada por quem administra o ambiente de
 * homologação — ver "Dificuldades encontradas" no README. Por ser dado
 * sintético, ele vive em `fixtures/` e vai para o Git, ao contrário das
 * credenciais, que ficam em `cypress.env.json`.
 */
describe('TED', { retries: 0 }, () => {
  const VALOR_EM_CENTAVOS = '1';
  const DESCRICAO = 'Teste automatizado Cypress';

  /**
   * Mesma data do agendamento de Pix, de propósito: os dois cenários ficam
   * comparáveis. Vale a mesma ressalva — data fixa envelhece, e a partir de
   * 01/10/2026 o calendário não a oferece mais.
   */
  const DATA_AGENDAMENTO = new Date(2026, 8, 30);

  let favorecido: FavorecidoTed;

  beforeEach(() => {
    cy.fixture<FavorecidoTed>('favorecido-ted').then((dados) => {
      favorecido = dados;
    });

    cy.login(envObrigatoria('documento'), envObrigatoria('conta'), envObrigatoria('senha'));
    cy.visitTed();
  });

  it('transfere R$ 0,01 para o favorecido de teste', () => {
    cy.preencherTed(favorecido, VALOR_EM_CENTAVOS, DESCRICAO);

    // Conferir antes de enviar: valor e data são os dois campos onde um erro
    // de máscara passaria despercebido até o dinheiro sair errado.
    cy.campoTed(tedElements.campos.valor)
      .invoke('val')
      .should('contain', centavosParaValorBR(VALOR_EM_CENTAVOS));
    cy.campoTed(tedElements.campos.data).should('have.value', paraDataBR(new Date()));

    // O botão só habilita com o formulário inteiro válido — é a validação do
    // produto confirmando que nada ficou para trás.
    cy.get(tedElements.botaoConcluir).should('be.enabled').click();

    cy.contains(tedElements.tituloConfirmacao).should('be.visible');
    cy.digitarCodigoSms(envObrigatoria('codigoSMS'));

    // Sem clique no "Confirmar": o componente de PIN envia sozinho ao receber
    // o 6º dígito, igual ao do Pix.
    //
    // O TED não emite toast. O sinal de sucesso é o comprovante abrir, e é
    // por isso que a espera é por ele e não por mensagem.
    cy.contains(tedElements.tituloComprovante, { timeout: 60000 }).should('be.visible');

    cy.contains('button', tedElements.botaoExportarComprovante).should('be.visible').and('be.enabled');
  });

  it('agenda R$ 0,01 para 30/09 e registra em Agendamentos', () => {
    // Marcador único por execução: a conta acumula agendamentos de rodadas
    // anteriores, e sem isso o teste encontraria o registro de ontem e passaria
    // mesmo que este agendamento tivesse falhado.
    const marcador = `Cypress agendamento ${Date.now()}`;

    cy.preencherTed(favorecido, VALOR_EM_CENTAVOS, marcador, DATA_AGENDAMENTO);

    cy.campoTed(tedElements.campos.data).should('have.value', paraDataBR(DATA_AGENDAMENTO));

    cy.get(tedElements.botaoConcluir).should('be.enabled').click();

    cy.contains(tedElements.tituloConfirmacao).should('be.visible');
    cy.digitarCodigoSms(envObrigatoria('codigoSMS'));

    cy.contains(tedElements.tituloComprovante, { timeout: 60000 }).should('be.visible');

    // Verificação fora do fluxo: o comprovante prova que a tela aceitou, não
    // que o agendamento existe. Quem prova isso é a listagem, em outra tela,
    // servida por outro endpoint.
    cy.visitAgendamentos().then((agendamentos) => {
      const criado = agendamentos.find((a) => a.notes === marcador);

      expect(criado, `agendamento "${marcador}" na listagem`).to.not.be.undefined;
      expect(criado?.amount, 'valor agendado').to.eq(0.01);
      expect(criado?.effectiveAt, 'data de efetivação').to.contain('2026-09-30');
    });

    // E o usuário precisa ver isso na tela, não só a API devolver.
    cy.contains(agendamentosElements.linhas, paraDataBR(DATA_AGENDAMENTO))
      .should('be.visible')
      .and('contain.text', agendamentosElements.statusAgendado);
  });
});
