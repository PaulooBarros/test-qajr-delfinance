/**
 * Tela de TED. Ao contrário do Pix, todo campo tem data-testid, mas ele fica
 * na <div> do Vuetify, não no <input>: use cy.campoTed() para digitar.
 */
export const tedElements = {
  campos: {
    banco: '[data-testid="ted-bank-select"]',
    agencia: '[data-testid="ted-branch-input"]',
    conta: '[data-testid="ted-account-input"]',
    tipoDeConta: '[data-testid="ted-account-type-select"]',
    nomeFavorecido: '[data-testid="ted-recipient-name-input"]',
    email: '[data-testid="ted-recipient-email-input"]',
    documento: '[data-testid="ted-recipient-document-input"]',
    valor: '[data-testid="ted-amount-input"]',
    data: '[data-testid="ted-date-input"]',
    descricao: '[data-testid="ted-description-input"]',
  },

  botaoConcluir: '[data-testid="ted-submit-button"]',

  tituloConfirmacao: 'Confirmar Transferência',

  tituloComprovante: 'Comprovante de Transferência',
  botaoExportarComprovante: /Exportar\s+Comprovante/i,
} as const;

export default tedElements;
