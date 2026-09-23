/**
 * Seletores compartilhados entre features.
 *
 * O modal de PIN é o caso claro: Pix e TED usam o mesmo componente, com
 * títulos diferentes ("Confirmar Pagamento" e "Confirmar Transferência").
 * Duplicar o seletor em cada feature criaria dois pontos de manutenção para
 * um componente só.
 */
export const comumElements = {
  /** Qualquer modal. O Vuetify empilha overlays e mantém a etapa anterior. */
  modal: '[role="dialog"]',

  /**
   * Campos do PIN de 6 dígitos. O seletor é o autocomplete padrão de código
   * de uso único — atributo de HTML, mais estável que classe interna.
   */
  campoCodigo: 'input[autocomplete="one-time-code"]',
} as const;

export default comumElements;
