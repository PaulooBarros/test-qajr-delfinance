import { pixElements } from '@elements/pix.elements';
import { envObrigatoria } from '@support/env';

/**
 * Validações de campo e caminhos alternativos do Pix.
 *
 * Nenhum cenário aqui confirma pagamento — todos param antes do PIN. Por isso
 * esta spec roda com os retries padrão do projeto, ao contrário de pix.cy.ts,
 * onde retry significa dinheiro saindo de novo.
 */
describe('Pix — validações e caminhos alternativos', () => {
  /**
   * Chave com formato válido e inexistente no DICT. Tem letras de propósito:
   * uma chave só de dígitos é capturada pela máscara de documento (ver o
   * defeito da máscara no README) e vira CNPJ antes de chegar ao servidor,
   * então testaria outra coisa.
   */
  const CHAVE_INEXISTENTE = 'deadbeef-dead-beef-dead-beefdeadbeef';

  beforeEach(() => {
    cy.login(envObrigatoria('documento'), envObrigatoria('conta'), envObrigatoria('senha'));
    cy.visitPix();
    cy.contains(pixElements.cardTransferir).should('be.visible').click();
  });

  it('não deixa avançar enquanto a chave não é preenchida', () => {
    cy.contains(pixElements.labelChave).should('be.visible');

    cy.botaoDaEtapa(pixElements.botaoContinuar).should('be.disabled');
  });

  it('não avança com chave inexistente', () => {
    cy.preencherChavePix(CHAVE_INEXISTENTE);

    // A chave tem formato válido, então o botão habilita: a recusa vem do
    // servidor, na consulta ao DICT.
    cy.botaoDaEtapa(pixElements.botaoContinuar).should('be.enabled').click();

    // O comportamento correto e verificado: o fluxo não avança. O modal do
    // favorecido não abre e a etapa da chave continua na tela.
    cy.get(pixElements.modal).should('not.exist');
    cy.contains(pixElements.tituloEtapaChave).should('be.visible');
  });

  it.skip('deveria avisar que a chave não existe — DEFEITO conhecido', () => {
    cy.preencherChavePix(CHAVE_INEXISTENTE);
    cy.botaoDaEtapa(pixElements.botaoContinuar).should('be.enabled').click();

    // Medido: nenhum feedback em 8s de observação, amostrando a cada 500ms —
    // sem toast, sem [role="alert"], sem mensagem no campo. O usuário clica e
    // não acontece nada. Este teste fica skip até o produto corrigir; quando
    // corrigir, basta trocar o texto esperado e remover o .skip.
    cy.contains(pixElements.mensagemChaveInexistente).should('be.visible');
  });

  it('não deixa avançar com valor zerado', () => {
    cy.preencherChavePix(envObrigatoria('chavePix'));
    cy.continuar();

    cy.contains(pixElements.tituloNovaTransferencia).should('be.visible');
    cy.botaoDaEtapa(pixElements.botaoContinuar).should('be.disabled');

    // Digitar zero não é o mesmo que deixar em branco: a máscara preenche
    // "R$ 0,00" e o campo deixa de estar vazio, mas o valor segue inválido.
    cy.get(pixElements.campoValor).type('0');

    // contain e não have.value: o "R$" vem separado por espaço não-quebrável
    // (U+00A0), então comparar a string inteira falha com duas mensagens de
    // erro visualmente idênticas — o pior tipo de teste para depurar.
    cy.get(pixElements.campoValor).invoke('val').should('contain', '0,00');

    cy.botaoDaEtapa(pixElements.botaoContinuar).should('be.disabled');
  });

  it('cancela a transferência e fecha o modal', () => {
    cy.preencherChavePix(envObrigatoria('chavePix'));
    cy.continuar();

    cy.contains(pixElements.tituloNovaTransferencia).should('be.visible');
    cy.botaoDaEtapa(pixElements.botaoCancelar).should('be.enabled').click();

    // Cancelar precisa abandonar o fluxo de verdade: modal fechado e nenhum
    // resquício da transferência montada em tela.
    cy.get(pixElements.modal).should('not.exist');
    cy.contains(pixElements.tituloNovaTransferencia).should('not.exist');
  });

  it('preserva valor e descrição ao voltar da etapa da data', () => {
    const descricao = 'descricao preservada';

    cy.preencherTransferenciaPix(envObrigatoria('chavePix'), '1', descricao);

    // Na etapa da data, "Voltar" devolve para o formulário. Perder o que já
    // foi digitado é defeito clássico de wizard, e caro para o usuário que
    // acabou de conferir os dados.
    cy.botaoDaEtapa(pixElements.botaoVoltar).should('be.enabled').click();

    cy.get(pixElements.campoValor).invoke('val').should('contain', '0,01');
    cy.get(pixElements.campoDescricao).should('have.value', descricao);
  });
});
