/** Componentes compartilhados entre Pix, TED e extrato. */
export const comumElements = {
  /** O Vuetify empilha modais e mantém a etapa anterior no DOM. */
  modal: '[role="dialog"]',

  campoCodigo: 'input[autocomplete="one-time-code"]',

  /** Dias do mês exibido, sem os dias do mês vizinho que a grade mostra nas bordas. */
  botaoCalendarioDia:
    '.v-date-picker-month__day:not(.v-date-picker-month__day--adjacent) .v-date-picker-month__day-btn',
  /** Durante a animação de troca de mês, são duas. */
  gradeCalendario: '.v-date-picker-month__days',
  botaoCalendarioProximoMes: '[data-testid="next-month"]',
} as const;

export default comumElements;
