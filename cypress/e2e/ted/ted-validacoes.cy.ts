import { menuElements } from '@elements/menu.elements';
import { tedElements } from '@elements/ted.elements';
import { envObrigatoria } from '@support/env';

/**
 * Validações do formulário de TED.
 *
 * Nenhum cenário aqui envia transferência: todos param antes do
 * "Concluir Transferência". O caminho feliz depende de dados de favorecido em
 * outra instituição (banco, agência, conta, documento), que a prova não
 * forneceu — ver "Dificuldades encontradas" no README.
 */
describe('TED — validações do formulário', () => {
  beforeEach(() => {
    cy.login(envObrigatoria('documento'), envObrigatoria('conta'), envObrigatoria('senha'));
  });

  it('é alcançável pelo menu, dentro do grupo Transferências', () => {
    // O item nasce escondido: é filho de um grupo recolhido. Testar isso
    // importa porque é o caminho real do usuário até a tela.
    cy.get(menuElements.grupoTransferencias).should('be.visible').click();
    cy.get(menuElements.itemTed).should('be.visible').click();

    cy.shouldBeOnPath('/transferencias/ted');
    cy.get(tedElements.botaoConcluir).should('be.visible');
  });

  it('exibe todos os campos do formulário', () => {
    cy.visitTed();

    // O contrato da tela: se um campo sumir num deploy, o teste acusa aqui em
    // vez de falhar lá na frente com "elemento não encontrado".
    Object.values(tedElements.campos).forEach((campo) => {
      cy.get(campo).should('exist');
    });

    cy.get(tedElements.botaoConcluir).should('exist');
  });

  it('mantém o envio bloqueado com o formulário vazio', () => {
    cy.visitTed();

    cy.get(tedElements.botaoConcluir).should('be.disabled');
  });

  it('aceita apenas dígitos em agência e conta', () => {
    cy.visitTed();

    cy.campoTed(tedElements.campos.agencia).type('abc123');
    cy.campoTed(tedElements.campos.agencia).should('have.value', '123');

    cy.campoTed(tedElements.campos.conta).type('12345-6');
    cy.campoTed(tedElements.campos.conta).should('have.value', '123456');
  });

  it('formata CPF e valor enquanto o usuário digita', () => {
    cy.visitTed();

    cy.campoTed(tedElements.campos.documento).type('11111111111');
    cy.campoTed(tedElements.campos.documento).should('have.value', '111.111.111-11');

    // Mesma máscara do Pix: centavos da direita para a esquerda.
    cy.campoTed(tedElements.campos.valor).type('1');
    cy.campoTed(tedElements.campos.valor).invoke('val').should('contain', '0,01');
  });

  it('busca banco pelo código no autocomplete', () => {
    cy.visitTed();

    cy.selecionarBanco('001');

    cy.campoTed(tedElements.campos.banco).should('contain.value', 'BCO DO BRASIL');
  });

  it.skip('deveria aceitar data digitada — DEFEITO conhecido', () => {
    cy.visitTed();

    // Medido: digitar "01/01/2027" deixa "01012027" no campo (o produto apaga
    // as barras do usuário) e, ao sair do campo, o valor some por completo.
    // Mesmo comportamento dos campos de data do extrato.
    cy.campoTed(tedElements.campos.data).type('01/01/2027');
    cy.campoTed(tedElements.campos.data).blur();

    cy.campoTed(tedElements.campos.data).should('have.value', '01/01/2027');
  });
});
