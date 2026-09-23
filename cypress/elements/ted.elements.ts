import { comumElements } from './comum.elements';

/**
 * Seletores da tela de TED (/transferencias/ted).
 *
 * Contraste com o Pix: **aqui o produto expõe data-testid em todo campo**.
 * Mesmo sistema, dois padrões — o que mostra que a ausência no Pix é lacuna,
 * não limitação técnica. Com data-testid, cada âncora é imune a redesign, a
 * mudança de texto e a upgrade de framework.
 *
 * Atenção a dois detalhes de uso:
 *
 * 1. o atributo fica no **componente** Vuetify, um <div>, não no <input>
 *    interno. Por isso `cy.campoTed()` faz `.find('input')` antes de digitar;
 * 2. nos selects (banco, tipo de conta, data) o input interno tem
 *    `pointer-events: none` — o clique precisa cair no `.v-field`, senão o
 *    Cypress falha dizendo que o elemento não é interativo.
 */
export const tedElements = {
  /**
   * Campos do formulário, agrupados porque são percorridos em conjunto pelo
   * teste que valida o contrato da tela.
   */
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

  /** Modal de PIN: mesmo componente do Pix, título diferente. */
  modal: comumElements.modal,
  campoCodigo: comumElements.campoCodigo,
  tituloConfirmacao: 'Confirmar Transferência',

  /**
   * Comprovante. Diferente do Pix, o TED **não exibe toast**: o sinal de
   * sucesso é este modal aparecer.
   */
  tituloComprovante: 'Comprovante de Transferência',
  botaoExportarComprovante: /Exportar\s+Comprovante/i,
  botaoFechar: 'Fechar',
} as const;

export default tedElements;
