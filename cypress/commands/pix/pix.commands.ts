import { pixElements } from '@elements/pix.elements';
import { centavosParaValorBR, paraDataBR, paraDiaPorExtenso } from '@utils';

declare global {
  namespace Cypress {
    interface Chainable {
      /** Abre a tela de Pix pela URL e espera os cards renderizarem. */
      visitPix(): Chainable<void>;

      /**
       * Faz o caminho comum de qualquer transferência: abre o fluxo, consulta
       * a chave, preenche valor e descrição e para na etapa da data — que é
       * onde imediato e agendado se separam.
       */
      preencherTransferenciaPix(
        chave: string,
        centavos: string,
        descricao: string,
      ): Chainable<void>;

      /** Preenche a chave do favorecido na etapa "para quem". */
      preencherChavePix(chave: string): Chainable<void>;

      /**
       * Digita o valor no campo mascarado. Recebe os centavos como o usuário
       * digitaria: '1' vira R$ 0,01, '150' vira R$ 1,50.
       */
      preencherValorPix(centavos: string): Chainable<void>;

      /** Abre o calendário e seleciona a data informada. */
      agendarPixPara(data: Date): Chainable<void>;

      /**
       * Botão da etapa que está por cima, para assertar estado sem clicar.
       * Necessário porque a etapa anterior continua no DOM com os botões
       * dela: uma asserção solta leria o botão errado.
       */
      botaoDaEtapa(texto: string): Chainable<JQuery<HTMLButtonElement>>;

      /** Avança a etapa atual pelo botão "Continuar". */
      continuar(): Chainable<void>;

      /** Confirma a etapa atual pelo botão "Confirmar". */
      confirmar(): Chainable<void>;

      /** Espera o processamento terminar, por estado da tela. */
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

    // A chave consultada tem que voltar no card do favorecido. Comparar com o
    // que foi enviado, em vez de escrever a chave aqui, mantém o dado fora do
    // Git e ainda valida a consulta ao DICT.
    cy.contains(pixElements.tituloNovaTransferencia).should('be.visible');
    cy.contains(chave).should('be.visible');

    cy.preencherValorPix(centavos);

    // A máscara é quem formata: garante que '1' virou centavo, não R$ 1,00.
    // Precisa ser aqui, antes do Continuar — depois dele o campo já saiu da
    // tela e a asserção viraria "elemento não encontrado".
    cy.get(pixElements.campoValor)
      .invoke('val')
      .should('contain', centavosParaValorBR(centavos));

    cy.get(pixElements.campoDescricao).type(descricao);

    cy.continuar();
  },
);

Cypress.Commands.add('preencherChavePix', (chave: string) => {
  // O input não tem texto próprio: chega-se nele pelo label e sobe até o
  // wrapper do componente Vuetify.
  //
  // Nada de .type() aqui: o campo tem máscara de CPF e, ao receber o 3º
  // dígito, injeta um ponto ("1234abcd..." vira "123.4abcd..."). Ele não
  // desfaz isso quando chegam letras, então chave aleatória sempre entra
  // corrompida — com delay ou sem. Setar o valor e disparar 'input' é o que
  // o navegador faz num paste real, e o Vue reage do mesmo jeito.
  cy.contains(pixElements.labelChave)
    .closest('.v-input')
    .find('input')
    .should('be.visible')
    .clear()
    .invoke('val', chave)
    .trigger('input')
    .should('have.value', chave);
});

Cypress.Commands.add('preencherValorPix', (centavos: string) => {
  cy.get(pixElements.campoValor).should('be.visible').clear().type(centavos);
});

Cypress.Commands.add('agendarPixPara', (data: Date) => {
  // O campo tem inputmode="none": não aceita digitação, só seleção. Clicar
  // nele é o que abre o calendário.
  cy.get(pixElements.campoData).should('be.visible').click();

  // O dia é escolhido pelo aria-label, que carrega a data por extenso e
  // identifica a célula sem ambiguidade — clicar pelo texto "30" pegaria
  // também o dia 30 do mês vizinho que o calendário mostra nas bordas.
  cy.get(`button[aria-label*="${paraDiaPorExtenso(data)}"]`)
    .should('be.visible')
    .click();

  // Sem esta asserção, um clique que não registrou seguiria adiante e o Pix
  // sairia com a data de hoje — falha silenciosa, o pior tipo aqui.
  cy.get(pixElements.campoData).should('have.value', paraDataBR(data));
});

/**
 * Encontra um botão pelo texto, sempre dentro do modal que está por cima.
 *
 * Cada etapa do fluxo abre um overlay e deixa a etapa anterior no DOM, com os
 * botões dela intactos. Um cy.contains('button', 'Continuar') solto acha o de
 * trás (primeiro na ordem do DOM): o clique morre no scrim que cobre a tela, e
 * uma asserção de estado leria o botão da etapa errada. Por isso: se existe
 * modal aberto, a busca acontece dentro do último; senão, na página inteira.
 */
Cypress.Commands.add('botaoDaEtapa', (texto: string) => {
  return cy.get('body').then(($body) => {
    const modais = $body.find(`${pixElements.modal}:visible`);
    const escopo = modais.length ? modais.last() : $body;

    return cy.wrap(escopo).contains('button', texto);
  });
});

Cypress.Commands.add('continuar', () => {
  // O botão nasce com disabled: esperar habilitar é o que sincroniza o teste
  // com a validação do campo, sem cy.wait() fixo.
  cy.botaoDaEtapa(pixElements.botaoContinuar).should('be.enabled').click();
});

Cypress.Commands.add('confirmar', () => {
  cy.botaoDaEtapa(pixElements.botaoConfirmar).should('be.enabled').click();
});

Cypress.Commands.add('aguardarPixConcluido', () => {
  // Espera de estado, não de tempo. São duas transições distintas e cada uma
  // falha com uma mensagem diferente, o que importa num teste de pagamento:
  //
  // 1. os campos de PIN somem  -> o backend respondeu à confirmação;
  // 2. o toast aparece         -> a resposta foi de sucesso.
  //
  // Se travar na 1, o pagamento não foi processado. Se travar na 2, foi
  // processado e deu errado. Um cy.wait(ms) confundiria os dois casos.
  // Também é aqui que se espera o autoenvio do PIN: o modal só desmonta
  // depois que o backend responde à confirmação disparada pelo 6º dígito.
  cy.get(pixElements.campoCodigo, { timeout: 60000 }).should('not.exist');

  cy.contains(pixElements.toastSucesso, { timeout: 60000 }).should('be.visible');
});

export {};
