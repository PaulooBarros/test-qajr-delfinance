/**
 * Seletores da tela de Agendamentos (/agendamentos).
 *
 * É a tela que permite verificar um agendamento **fora do fluxo que o criou**
 * — sem isso, o teste de agendamento só prova que a tela aceitou os dados.
 */
export const agendamentosElements = {
  /** Colunas, na ordem em que o produto as exibe. */
  colunas: ['Tipo', 'Destinatário', 'Valor', 'Agendado para', 'Status', 'Ações'],

  /** Status de um agendamento ainda não executado. */
  statusAgendado: 'Agendado',

  linhas: 'tbody tr',
} as const;

export default agendamentosElements;
